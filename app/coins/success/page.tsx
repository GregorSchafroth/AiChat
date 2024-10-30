// app/coins/success/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function SuccessPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    toast({
      title: "Purchase Successful!",
      description: "Your coins will be credited to your account shortly.",
    })
  }, [toast])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your purchase was successful. Your coins will be credited to your account shortly.
        </p>
        <div className="text-8xl">🪙</div> {/* Apply shiny effect here */}
        <Button 
          onClick={() => router.push('/')}
          className="w-full"
        >
          Return to AI Chat
        </Button>
      </Card>
    </div>
  )
}
