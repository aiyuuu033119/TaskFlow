'use client'

import { useEffect, useRef } from 'react'
import { Task } from '@/types'
import { showNotification } from '@/lib/notifications'
import { taskApi } from '@/lib/api-client'

interface UseRemindersOptions {
  tasks: Task[]
  enabled?: boolean
  checkInterval?: number // in milliseconds
}

export function useReminders({
  tasks,
  enabled = true,
  checkInterval = 10000, // check every 10 seconds for better responsiveness
}: UseRemindersOptions) {
  const notifiedTasksRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const checkReminders = async () => {
      const now = new Date()

      for (const task of tasks) {
        // Skip if no reminder is set or already notified
        if (!task.reminderEnabled || !task.reminderTime || task.reminderNotified) {
          continue
        }

        // Skip if already notified in this session
        if (notifiedTasksRef.current.has(task.id)) {
          continue
        }

        const reminderTime = new Date(task.reminderTime)

        // Check if it's time to show the reminder (within 1 minute window)
        const timeDiff = reminderTime.getTime() - now.getTime()

        if (timeDiff <= 0 && timeDiff > -60000) {
          // Show notification
          await showNotification({
            title: 'Task Reminder',
            body: task.title,
            tag: `task-reminder-${task.id}`,
            requireInteraction: true,
          })

          // Mark as notified in this session
          notifiedTasksRef.current.add(task.id)

          // Update task in database to mark as notified
          try {
            await taskApi.update(task.id, {
              reminderNotified: true,
            })
          } catch (error) {
            console.error('Failed to update reminder status:', error)
          }
        }
      }
    }

    // Check immediately
    checkReminders()

    // Set up interval
    intervalRef.current = setInterval(checkReminders, checkInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [tasks, enabled, checkInterval])

  // Reset notified tasks when tasks change significantly
  useEffect(() => {
    const currentTaskIds = new Set(tasks.map((t) => t.id))
    const notifiedIds = Array.from(notifiedTasksRef.current)

    // Remove notified IDs that are no longer in the task list
    for (const id of notifiedIds) {
      if (!currentTaskIds.has(id)) {
        notifiedTasksRef.current.delete(id)
      }
    }
  }, [tasks])

  return {
    notifiedCount: notifiedTasksRef.current.size,
  }
}
