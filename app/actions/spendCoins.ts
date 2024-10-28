'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

async function spendCoins(price: number): Promise<{
  success?: boolean
  error?: string
}> {
  const { userId } = await auth()
  
  if (!userId) {
    return { error: 'User not authenticated' }
  }

  try {
    // Fetch the user to check current coins balance
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        coins: true,
      },
    })

    // Check if the user exists
    if (!user) {
      return { error: 'User not found' }
    }

    // Ensure the user has enough coins to spend
    if (user.coins < price) {
      return { error: 'Not enough coins' }
    }

    // Deduct coins from the user's balance
    await db.user.update({
      where: { clerkUserId: userId },
      data: {
        coins: user.coins - price,
      },
    })

    // Revalidate the layout to update the balance display
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { error: 'Database error' }
  }
}

export default spendCoins