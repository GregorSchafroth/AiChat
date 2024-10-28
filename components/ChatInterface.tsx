'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ReactMarkdown from 'react-markdown'
import getUserBalance from '@/app/actions/getUserBalance'
import spendCoins from '@/app/actions/spendCoins'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are an AI Assistant',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [coins, setCoins] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial coin balance
  useEffect(() => {
    const fetchCoins = async () => {
      const { coins } = await getUserBalance()
      if (coins) {
        setCoins(coins)
      } else {
        setCoins(0)
      }
    }
    fetchCoins()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Check coins before proceeding
    const currentBalance = await getUserBalance()
    if (currentBalance.coins == undefined || currentBalance.coins < 1) {
      setCoins(0) // Update local state
      return // Don't proceed with the message
    }

    const userMessage: Message = { role: 'user', content: inputMessage }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Deduct coin first
      const spendResult = await spendCoins(1)

      if (spendResult.error) {
        throw new Error(spendResult.error)
      }

      // Update local coins state after successful spend
      setCoins((prev) => (prev !== null ? prev - 1 : null))

      const requestPayload = {
        model: 'grok-beta',
        messages: [...messages, userMessage],
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`)
      }

      const data = JSON.parse(responseText)
      const content = data.choices[0].message.content || 'No response received'

      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Detailed error:', error)

      const errorMessage: Message = {
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'An error occurred. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Show no coins message when coins is exactly 0
  const showNoCoinsMessage = coins === 0

  return (
    <div className='flex flex-col flex-1'>
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages
          .filter((m) => m.role !== 'system')
          .map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted shadow-sm'
                }`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        {isLoading && (
          <div className='flex items-center space-x-2 text-muted-foreground'>
            <Loader2 className='h-5 w-5 animate-spin' />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showNoCoinsMessage && (
          <div className="max-w-full">
          <Alert className='m-4'>
            <Coins className='h-4 w-4' />
            <AlertTitle>Out of Coins</AlertTitle>
            <AlertDescription>
              You need coins to continue chatting with the AI. Please get more
              coins to continue the conversation.
            </AlertDescription>
          </Alert>
          </div>
      )}
      <Card className='rounded-none border-t'>
        <CardContent className='p-4'>
          <form onSubmit={handleSubmit} className='flex space-x-2'>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                showNoCoinsMessage
                  ? 'Get more coins to continue...'
                  : 'Type your message...'
              }
              disabled={showNoCoinsMessage}
              className='flex-1'
            />
            <Button
              type='submit'
              disabled={isLoading || showNoCoinsMessage}
              size='icon'
            >
              <Send className='h-5 w-5' />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
