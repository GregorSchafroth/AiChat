// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from 'next'
import './globals.css'  // Make sure you're importing globals.css

export const metadata: Metadata = {
  title: 'Grok Chat',
  description: 'Chat interface for Grok',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}