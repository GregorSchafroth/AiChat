// components/header.tsx
'use server'

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import Balance from './Balance'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function Header() {
  return (
    <Card className='rounded-none border-b'>
      <CardContent className='p-3 flex justify-between items-center'>
        <Link href='/'>
          <h1 className='text-xl font-semibold'>Grok Chat</h1>
        </Link>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <SignedOut>
            <Button variant='outline'>
              <SignInButton />
            </Button>
          </SignedOut>
          <SignedIn>
            <Link href='/coins'>
              <Suspense
                fallback={<Button variant='outline'>Loading...</Button>}
              >
                <Balance />
              </Suspense>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10',
                  userButtonTrigger: 'p-0.5',
                },
              }}
            />
          </SignedIn>
        </div>
      </CardContent>
    </Card>
  )
}
