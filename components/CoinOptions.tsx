// components/CoinOptions.tsx

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { useState } from 'react'
import { coinOptions } from '@/data/coinOptionsList'
import { createCheckoutSession } from '@/server/stripe'
import { useToast } from "@/hooks/use-toast"

const CoinsPage = () => {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const { toast } = useToast()

  const handlePurchase = async (amount: number) => {
    try {
      setIsLoading(amount)
      const result = await createCheckoutSession(amount)
      console.log('Checkout Session Result:', result);
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create checkout session"
        })
        return
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong"
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center flex-1 bg-gray-100 dark:bg-gray-900 p-6'>
      <h1 className='text-3xl font-bold text-black dark:text-white mb-8'>
        Buy Coins
      </h1>
      <p>one message costs one 🪙</p>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full'>
        {coinOptions.map((option) => (
          <Card
            key={option.amount}
            className='flex flex-col justify-between p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300'
          >
            <CardHeader className='flex items-center justify-between'>
              <Card className='w-full p-4 flex items-center justify-center mb-4 bg-white dark:bg-gray-700'>
                <h2 className='text-3xl font-semibold text-black dark:text-white'>
                  {option.amount} <span className='text-8xl'>🪙</span>
                </h2>
              </Card>
              <div className='text-2xl font-bold text-gray-600 dark:text-gray-300 italic'>
                for just ${option.price}
              </div>
            </CardHeader>
            <CardFooter>
              <Button 
                className='w-full bg-black text-white hover:bg-gray-800 dark:hover:bg-gray-900 transition duration-200'
                onClick={() => handlePurchase(option.amount)}
                disabled={isLoading === option.amount}
              >
                {isLoading === option.amount ? 'Loading...' : 'Buy Now'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CoinsPage