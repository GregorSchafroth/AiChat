// components/header.tsx
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <Card className='rounded-none border-b'>
      <CardContent className='p-3 flex justify-between items-center'>
        <h1 className='text-xl font-semibold'>Grok Chat</h1>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <SignedOut>
            <Button variant='outline'>
              <SignInButton />
            </Button>
          </SignedOut>
          <SignedIn>
          <Button variant='outline'>500 🪙</Button>
          <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",  // Increase avatar size
                  userButtonTrigger: "p-0.5" // Add some padding around the button
                }
              }}
            />
          </SignedIn>         
        </div>
      </CardContent>
    </Card>
  );
}
