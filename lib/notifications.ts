export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window
}

export const getNotificationPermission = (): NotificationPermission | null => {
  if (!checkNotificationSupport()) return null
  return Notification.permission
}

export const requestNotificationPermission = async (): Promise<NotificationPermission | null> => {
  if (!checkNotificationSupport()) {
    console.warn('This browser does not support notifications')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return null
  }
}

export const showNotification = async (
  options: NotificationOptions,
): Promise<Notification | null> => {
  if (!checkNotificationSupport()) return null

  const permission = getNotificationPermission()

  if (permission !== 'granted') {
    const newPermission = await requestNotificationPermission()
    if (newPermission !== 'granted') return null
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
    return null
  }
}

export const scheduleNotification = (
  options: NotificationOptions,
  delayMs: number,
): NodeJS.Timeout => {
  return setTimeout(() => {
    showNotification(options)
  }, delayMs)
}

export const formatReminderTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
