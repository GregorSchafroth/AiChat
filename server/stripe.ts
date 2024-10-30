// server/stripe.ts

'use server'

import { coinOptions } from '@/data/coinOptionsList'
import { currentUser, User } from '@clerk/nextjs/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function createCheckoutSession(coinsToBuy: number) {
  const user = await currentUser()

  if (!user) {
    console.error('❌ No user found in createCheckoutSession')
    return { error: 'User not authenticated' }
  }

  try {
    console.log('🚀 Creating checkout session for:', {
      userId: user.id,
      coinsToBuy,
      email: user.primaryEmailAddress?.emailAddress,
    })

    const url = await getCheckoutSession(coinsToBuy, user)
    console.log('✅ Successfully created checkout session')
    return { url }
  } catch (error) {
    console.error('❌ Stripe session creation error:', error)
    return { error: 'Failed to create checkout session' }
  }
}

async function getCheckoutSession(coinsToBuy: number, user: User) {
  // Find the matching coin option
  const coinOption = coinOptions.find((option) => option.amount === coinsToBuy)

  if (!coinOption) {
    console.error('❌ Invalid coin amount selected:', coinsToBuy)
    throw new Error('Invalid coin amount selected')
  }

  console.log('💰 Creating session with metadata:', {
    userId: user.id,
    coinAmount: coinOption.amount,
  })

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: user.primaryEmailAddress?.emailAddress,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${coinOption.amount} Coins`,
            description: `Purchase ${coinOption.amount} coins for your account`,
          },
          unit_amount: coinOption.price * 100, // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/coins/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coins`,
    metadata: {
      userId: user.id,
      coinAmount: coinOption.amount.toString(),
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session - no session.url')
  }

  console.log('🔗 Created session with URL:', session.url)
  return session.url
}
