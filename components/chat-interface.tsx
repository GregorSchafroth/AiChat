// components/chat-interface.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import ReactMarkdown from 'react-markdown'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage: Message = { role: 'user', content: inputMessage }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
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
          process.env.NODE_ENV === 'development'
            ? `Debug Error: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            : 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col h-screen bg-background'>
      <Header />
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
                        <code className='bg-gray-100 rounded px-1 py-0.5'>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className='bg-gray-100 rounded p-4 overflow-x-auto my-4'>
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

      <Card className='rounded-none border-t'>
        <CardContent className='p-4'>
          <form onSubmit={handleSubmit} className='flex space-x-2'>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder='Type your message...'
              className='flex-1'
            />
            <Button type='submit' disabled={isLoading} size='icon'>
              <Send className='h-5 w-5' />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
