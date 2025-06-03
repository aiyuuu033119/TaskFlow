'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-8xl font-bold text-muted-foreground/20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-muted-foreground/40" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. 
            It might have been removed, renamed, or doesn't exist.
          </p>
        </div>
        
        <div className="flex gap-2 justify-center pt-4">
          <Link href="/">
            <Button variant="default">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Button>
          </Link>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Go back
          </Button>
        </div>
        
        <div className="pt-8 text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  )
}