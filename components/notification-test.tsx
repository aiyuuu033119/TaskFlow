'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
  checkNotificationSupport,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
} from '@/lib/notifications'

export function NotificationTest() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported(checkNotificationSupport())
      setPermission(getNotificationPermission())
    }
  }, [])

  const handleRequestPermission = async () => {
    const newPermission = await requestNotificationPermission()
    setPermission(newPermission)

    if (newPermission === 'granted') {
      setTestResult('Permission granted! You can now receive notifications.')
    } else if (newPermission === 'denied') {
      setTestResult('Permission denied. Please enable notifications in your browser settings.')
    } else {
      setTestResult('Permission request was dismissed.')
    }
  }

  const handleTestNotification = async () => {
    const notification = await showNotification({
      title: 'Test Notification',
      body: 'This is a test notification from TaskFlow!',
      requireInteraction: true,
    })

    if (notification) {
      setTestResult('Notification sent successfully! Check your system notifications.')
    } else {
      setTestResult('Failed to send notification. Please check permissions.')
    }
  }

  const getStatusIcon = () => {
    if (!supported) return <XCircle className="w-5 h-5 text-red-500" />
    if (permission === 'granted') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (permission === 'denied') return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertCircle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusBadge = () => {
    if (!supported) return <Badge variant="destructive">Not Supported</Badge>
    if (permission === 'granted') return <Badge variant="default">Granted</Badge>
    if (permission === 'denied') return <Badge variant="destructive">Denied</Badge>
    return <Badge variant="secondary">Not Set</Badge>
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notification Permissions</h3>
          {getStatusIcon()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Browser Support:</span>
            <Badge variant={supported ? 'default' : 'destructive'}>
              {supported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Permission Status:</span>
            {getStatusBadge()}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          {supported && permission !== 'granted' && (
            <Button onClick={handleRequestPermission} className="w-full" variant="default">
              <Bell className="w-4 h-4 mr-2" />
              Request Permission
            </Button>
          )}

          {supported && permission === 'granted' && (
            <Button onClick={handleTestNotification} className="w-full" variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          )}

          {!supported && (
            <div className="text-sm text-center text-muted-foreground">
              Your browser does not support notifications. Please use a modern browser like Chrome,
              Firefox, or Edge.
            </div>
          )}

          {permission === 'denied' && (
            <div className="text-sm text-center text-destructive">
              Notifications are blocked. To enable them:
              <ol className="mt-2 text-left space-y-1">
                <li>1. Click the lock icon in your address bar</li>
                <li>2. Find "Notifications" in the permissions</li>
                <li>3. Change it from "Block" to "Allow"</li>
                <li>4. Refresh this page</li>
              </ol>
            </div>
          )}
        </div>

        {testResult && <div className="mt-4 p-3 rounded-md bg-muted text-sm">{testResult}</div>}
      </div>
    </div>
  )
}
