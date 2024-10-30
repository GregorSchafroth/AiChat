// hooks/use-balance.ts

import { useState, useEffect } from 'react'
import getUserBalance from '@/app/actions/getUserBalance'

export const BALANCE_UPDATED_EVENT = 'balance-updated'

export function triggerBalanceUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BALANCE_UPDATED_EVENT))
  }
}

interface UseBalanceReturn {
  coins: number | null
  isLoading: boolean
  error: string | null
  refreshBalance: () => Promise<void>
}

export function useBalance(): UseBalanceReturn {
  const [coins, setCoins] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    try {
      setIsLoading(true)
      const { coins: userCoins } = await getUserBalance()
      setCoins(userCoins ?? 0)
      setError(null)
    } catch (err) {
      setError('Failed to fetch balance')
      console.error('Error fetching balance:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()

    // Set up an interval to periodically check the balance
    const intervalId = setInterval(fetchBalance, 60000)

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [])

  return {
    coins,
    isLoading,
    error,
    refreshBalance: fetchBalance
  }
}