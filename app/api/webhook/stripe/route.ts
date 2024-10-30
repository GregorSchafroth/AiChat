// app/api/webhook/stripe/route.ts

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import creditCoins from '@/app/actions/creditCoins'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  // Verify webhook signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('⚠️ Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Extract metadata
    const clerkUserId = session.metadata?.userId
    const coinAmount = parseInt(session.metadata?.coinAmount || '0')

    console.log('📥 Received webhook for completed checkout:', {
      clerkUserId,
      coinAmount,
      sessionId: session.id,
    })

    if (!clerkUserId || !coinAmount) {
      console.error('❌ Missing metadata in Stripe session:', session.metadata)
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    try {
      // Check if we've already processed this session
      const existingTransaction = await db.transaction.findFirst({
        where: {
          AND: [
            { user: { clerkUserId } },
            { amount: coinAmount },
            { type: 'PURCHASE' },
            { status: 'COMPLETED' },
            {
              createdAt: {
                gte: new Date(Date.now() - 1000 * 60 * 60), // Within the last hour
              },
            },
          ],
        },
      })

      if (existingTransaction) {
        console.log(
          '⚠️ Duplicate webhook event, transaction already processed:',
          existingTransaction.id
        )
        return NextResponse.json({ received: true })
      }

      // Create transaction record
      const transaction = await db.transaction.create({
        data: {
          amount: coinAmount,
          type: 'PURCHASE',
          status: 'PENDING',
          user: {
            connect: {
              clerkUserId: clerkUserId,
            },
          },
        },
      })

      console.log('💳 Created transaction record:', transaction.id)

      // Credit the coins
      const result = await creditCoins(clerkUserId, coinAmount)

      if (result.error) {
        console.error('❌ Failed to credit coins:', result.error)

        await db.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        })

        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      // Update transaction status to COMPLETED
      await db.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      })

      console.log('✅ Successfully credited coins and updated transaction')
    } catch (error) {
      console.error('❌ Error processing payment:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
