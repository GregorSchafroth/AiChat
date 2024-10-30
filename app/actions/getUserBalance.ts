// app/actions/getUserBalance.ts

'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

async function getUserBalance(): Promise<{
  coins?: number
  error?: string
}> {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'User not found' }
  }

  try {
    // Fetch the user directly from the User model
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }, // Adjust this based on how you manage user IDs
      select: {
        coins: true, // Select only the coins field
      },
    });

    // Check if the user exists
    if (!user) {
      return { error: 'User not found' }
    }

    // Return the coins from the user
    return { coins: user.coins }
  } catch (error) {
    console.error('Database error:', error)
    return { error: 'Database error' }
  }
}

export default getUserBalance
