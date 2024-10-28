// app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Metadata } from 'next';
import {
  ClerkProvider,
} from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Chat',
  description: 'Chat with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
