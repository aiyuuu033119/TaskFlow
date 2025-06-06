import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './assets/globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/lib/theme-provider'
import { ReactQueryProvider } from '@/lib/react-query'
import { ThemeScript } from './theme-script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskFlow - Task Management App',
  description: 'A modern task management application to organize your work efficiently',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
