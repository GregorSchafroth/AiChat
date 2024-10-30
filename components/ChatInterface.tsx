// components/ChatInterface.tsx
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
import { triggerBalanceUpdate } from '@/hooks/use-balance'
import Link from 'next/link'

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
    if (!inputMessage.trim() || isLoading) return // Prevent multiple submissions

    try {
      // Check coins before proceeding
      const currentBalance = await getUserBalance()
      if (
        currentBalance.error ||
        !currentBalance.coins ||
        currentBalance.coins < 1
      ) {
        setCoins(0)
        throw new Error('Insufficient coins')
      }

      const userMessage: Message = { role: 'user', content: inputMessage }
      setMessages((prev) => [...prev, userMessage])
      setInputMessage('')
      setIsLoading(true)

      // Deduct coin first and update local state immediately
      const spendResult = await spendCoins(1)
      if (spendResult.error) {
        throw new Error(spendResult.error)
      }
      setCoins((prev) => (prev !== null ? prev - 1 : null)) // Update local state instantly

      // Trigger balance sync in the background without affecting UI
      triggerBalanceUpdate() // This will update any external balance if needed

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      const content =
        data.choices?.[0]?.message?.content || 'No response received'

      setMessages((prev) => [...prev, { role: 'assistant', content }])
    } catch (error) {
      console.error('Error:', error)

      // Add a more user-friendly error message
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
    <div className='flex flex-col h-full'>
      {/* Container for chat messages */}
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
                  <ReactMarkdown
                    className='prose dark:prose-invert max-w-none'
                    components={{
                      // Override default element styling
                      p: ({ children }) => (
                        <p className='mt-4 first:mt-0'>{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className='list-disc pl-4 mt-4 space-y-2'>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className='list-decimal pl-4 mt-4 space-y-2'>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className='ml-4'>{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className='font-bold'>{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className='italic'>{children}</em>
                      ),
                      h1: ({ children }) => (
                        <h1 className='text-2xl font-bold mt-6 mb-4'>
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className='text-xl font-bold mt-6 mb-3'>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className='text-lg font-bold mt-6 mb-2'>
                          {children}
                        </h3>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className='border-l-4 border-gray-300 pl-4 italic my-4'>
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className='bg-gray-700 rounded px-1 py-0.5 text-white'>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className='bg-gray-700 rounded p-4 overflow-x-auto my-4'>
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
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

      {/* Show out of coins alert */}
      {showNoCoinsMessage && (
        <div className='max-w-full'>
          <Alert className='m-4 flex justify-between items-center'>
            <div className='flex items-center'>
              <Coins className='h-4 w-4' />
              <div className='ml-2'>
                <AlertTitle>Out of Coins</AlertTitle>
                <AlertDescription>
                  You need coins to continue chatting with the AI. Please get
                  more coins to continue the conversation.
                </AlertDescription>
              </div>
            </div>
            <Link href='/coins'>
              <Button className='ml-4'>Buy 🪙</Button>
            </Link>
          </Alert>
        </div>
      )}

      {/* Input area */}
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
