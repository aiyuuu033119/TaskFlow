import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading TaskFlow...</p>
      </div>
    </div>
  )
}