'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold">Critical Error</h1>

            <p className="text-muted-foreground">
              A critical error has occurred. The application needs to restart. Please refresh the
              page or try again later.
            </p>

            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
            )}

            <div className="flex gap-2 justify-center pt-4">
              <Button onClick={() => reset()} variant="default">
                Try again
              </Button>

              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh page
              </Button>
            </div>

            <div className="pt-8 text-xs text-muted-foreground">
              If this error persists, please clear your browser cache and cookies.
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
