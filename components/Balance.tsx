// components/balance.tsx
'use client'
import { useEffect } from 'react'
import { Button } from "./ui/button"
import { useBalance, BALANCE_UPDATED_EVENT } from "@/hooks/use-balance"

const Balance = () => {
  const { coins, isLoading, error, refreshBalance } = useBalance()

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = () => {
      refreshBalance()
    }

    window.addEventListener(BALANCE_UPDATED_EVENT, handleBalanceUpdate)
    return () => window.removeEventListener(BALANCE_UPDATED_EVENT, handleBalanceUpdate)
  }, [refreshBalance])

  return (
    <Button 
      variant='outline'
      className={error ? 'text-red-500' : ''}
    >
      {isLoading ? '...' : coins} 🪙
    </Button>
  )
}

export default Balance