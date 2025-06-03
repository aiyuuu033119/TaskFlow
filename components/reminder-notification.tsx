'use client'

import React from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  getNotificationPermission,
  requestNotificationPermission,
  checkNotificationSupport,
} from '@/lib/notifications'
import { useToast } from '@/hooks/use-toast'

interface ReminderNotificationProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  reminderTime?: Date | string | null
}

export function ReminderNotification({
  enabled,
  onToggle,
  reminderTime,
}: ReminderNotificationProps) {
  const { toast } = useToast()
  const [permission, setPermission] = React.useState<NotificationPermission | null>(null)
  const [supported, setSupported] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported(checkNotificationSupport())
      setPermission(getNotificationPermission())
    }
  }, [])

  const handleToggle = async () => {
    if (!supported) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      })
      return
    }

    if (!enabled && permission !== 'granted') {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)

      if (newPermission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        })
        return
      }
    }

    onToggle(!enabled)
    toast({
      title: enabled ? 'Reminder Disabled' : 'Reminder Enabled',
      description: enabled
        ? 'You will not receive notifications for this task.'
        : 'You will receive a notification at the scheduled time.',
    })
  }

  const getPermissionBadge = () => {
    if (!supported) return <Badge variant="secondary">Not Supported</Badge>
    if (permission === 'granted') return <Badge variant="default">Allowed</Badge>
    if (permission === 'denied') return <Badge variant="destructive">Blocked</Badge>
    return <Badge variant="secondary">Not Set</Badge>
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggle}
          disabled={!supported || (permission === 'denied' && !enabled)}
        >
          {enabled ? (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Reminder On
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 mr-2" />
              Reminder Off
            </>
          )}
        </Button>
        {reminderTime && enabled && (
          <span className="text-sm text-muted-foreground">
            {new Date(reminderTime).toLocaleString()}
          </span>
        )}
      </div>
      {getPermissionBadge()}
    </div>
  )
}
