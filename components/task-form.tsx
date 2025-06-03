'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Task, type CreateTaskData, type UpdateTaskData, type TaskPriority } from '@/types'
import { useAsync } from '@/hooks/use-async'
import { CalendarDays, X, Clock } from 'lucide-react'
import { ReminderNotification } from './reminder-notification'
import { Checkbox } from '@/components/ui/checkbox'

interface TaskFormProps {
  task?: Task
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
}

export function TaskForm({ task, onSubmit, onCancel, isLoading: externalLoading }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'LOW')
  const [dueDate, setDueDate] = useState(
    task?.deadline
      ? new Date(task.deadline).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  )
  const [reminderEnabled, setReminderEnabled] = useState(task?.reminderEnabled || false)
  const [reminderTime, setReminderTime] = useState(
    task?.reminderTime
      ? new Date(task.reminderTime).toISOString().slice(0, 16)
      : ''
  )

  const { loading: asyncLoading, execute } = useAsync(async (data: any) => {
    const result = onSubmit(data)
    if (result instanceof Promise) {
      return result
    }
    return Promise.resolve()
  })
  const isLoading = externalLoading || asyncLoading
  const isEditing = !!task
  const isValid = title.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isLoading) return

    const formData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled && reminderTime ? new Date(reminderTime).toISOString() : undefined,
    }

    try {
      await execute(formData)
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission failed:', error)
    }
  }

  return (
    <Card className="w-full !border-0">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              className="w-full min-h-[60px] sm:min-h-[80px] p-2 sm:p-3 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-2">
                    <span className="text-xs leading-none">🟢</span>
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <span className="text-xs leading-none">🟡</span>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-2">
                    <span className="text-xs leading-none">🟠</span>
                    High
                  </div>
                </SelectItem>
                <SelectItem value="URGENT">
                  <div className="flex items-center gap-2">
                    <span className="text-xs leading-none">🔴</span>
                    Urgent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full"
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
              />
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminder"
                checked={reminderEnabled}
                onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="reminder"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set reminder
              </label>
            </div>
            
            {reminderEnabled && (
              <div className="space-y-2 pl-6">
                <label htmlFor="reminderTime" className="text-sm font-medium">
                  Reminder Time
                </label>
                <div className="relative">
                  <Input
                    id="reminderTime"
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <ReminderNotification
                  enabled={reminderEnabled}
                  onToggle={setReminderEnabled}
                  reminderTime={reminderTime}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button type="submit" disabled={!isValid || isLoading} className="w-full sm:flex-1">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Saving...
                </div>
              ) : isEditing ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
