// app/actions/creditCoins.ts

'use server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function creditCoins(
  clerkUserId: string,
  amount: number
): Promise<{
  success?: boolean
  error?: string
}> {
  console.log('🎯 Attempting to credit coins:', { clerkUserId, amount })
  
  try {
    // Find or create user
    const user = await db.user.upsert({
      where: { clerkUserId },
      update: {
        coins: {
          increment: amount
        }
      },
      create: {
        clerkUserId,
        email: '', // You'll need to get this from Clerk
        coins: amount
      }
    })

    console.log('💰 Successfully credited coins to user:', user.id)

    // Revalidate the layout to update the balance display
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error('❌ Database error:', error)
    return { error: 'Database error' }
  }
}

export default creditCoins