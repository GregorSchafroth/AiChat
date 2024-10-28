// app/page.tsx
import ChatInterface from '@/components/ChatInterface'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className='min-h-screen'>
      <div className='flex flex-col h-screen bg-background'>
        <Header />
        <ChatInterface />
      </div>
    </main>
  )
}
