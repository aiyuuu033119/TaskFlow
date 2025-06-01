'use client'

import { useState, useMemo, useEffect } from 'react'
import { type Task, type TaskStatus } from '@/types/task'
import { TaskList } from './task-list'
import { TaskFilter } from './task-filter'
import { AddTaskButton } from './add-task-button'
import { TaskFormDialog } from './task-form-dialog'
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog'
import { useEmptyState, useIsFirstTimeUser } from '@/hooks/use-empty-state'
import { EmptyState } from './ui/empty-state'
import { withErrorBoundary } from './error-boundary'
import { Spinner } from './ui/spinner'
import { Button } from './ui/button'
import { Keyboard } from 'lucide-react'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useTheme } from 'next-themes'
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useBulkUpdateTasks,
  useBulkDeleteTasks,
} from '@/hooks/use-tasks'
import type { CreateTaskData, UpdateTaskData, TaskFilters } from '@/lib/api-client'

function TaskManagerApiContent() {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<{ id: string; data: UpdateTaskData } | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  })
  const { setTheme, theme } = useTheme()

  // API hooks
  const { data: tasksResponse, isLoading, error, refetch } = useTasks(filters)
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const updateStatusMutation = useUpdateTaskStatus()
  const bulkUpdateMutation = useBulkUpdateTasks()
  const bulkDeleteMutation = useBulkDeleteTasks()
  const isFirstTime = useIsFirstTimeUser()

  // Extract tasks and pagination from response
  const tasks = tasksResponse?.tasks || []
  const pagination = tasksResponse?.pagination

  // Task counts for filter component
  const taskCounts = useMemo(() => {
    return {
      total: pagination?.total || 0,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      in_progress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      cancelled: tasks.filter((t) => t.status === 'CANCELLED').length,
    }
  }, [tasks, pagination])

  // Empty state configuration
  const emptyStateInfo = useEmptyState({
    tasks,
    filteredTasks: tasks, // Tasks are already filtered by API
    filters: {
      search: filters.search,
      status: filters.status ? [filters.status] : undefined,
      priority: filters.priority ? [filters.priority] : undefined,
      sortBy: filters.sortBy as any,
      sortOrder: filters.sortOrder,
    },
    isFirstTime,
  })

  // Loading states for individual tasks
  const loadingStates = useMemo(() => {
    const states: Record<string, boolean> = {}

    // Add loading states for various operations
    if (updateStatusMutation.isPending) {
      // We don't have access to specific task ID in mutation state
      // This could be improved with more sophisticated state management
    }

    return states
  }, [updateStatusMutation.isPending])

  // Event handlers
  const handleAddTask = async (data: CreateTaskData) => {
    try {
      await createTaskMutation.mutateAsync(data)
      setIsAddingTask(false)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (data: UpdateTaskData) => {
    if (!editingTask) return

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data,
      })
      setEditingTask(null)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update task:', error)
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: taskId, status })
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update task status:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId)
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId))
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to delete task:', error)
    }
  }

  const handleBulkDelete = async (taskIds: string[]) => {
    if (taskIds.length === 0) return

    try {
      await bulkDeleteMutation.mutateAsync(taskIds)
      setSelectedTaskIds([])
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to delete tasks:', error)
    }
  }

  const handleBulkStatusChange = async (taskIds: string[], status: TaskStatus) => {
    if (taskIds.length === 0) return

    try {
      await bulkUpdateMutation.mutateAsync({
        ids: taskIds,
        data: { status },
      })
      setSelectedTaskIds([])
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update task status:', error)
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    // Convert from TaskFilter component format to API format
    const apiFilters: TaskFilters = {
      search: newFilters.search,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
      // Convert arrays to single values (take first item)
      status: Array.isArray(newFilters.status) ? newFilters.status[0] : newFilters.status,
      priority: Array.isArray(newFilters.priority) ? newFilters.priority[0] : newFilters.priority,
      page: newFilters.page !== undefined ? newFilters.page : 1,
      limit: filters.limit,
    }
    setFilters(apiFilters)
  }

  const handleEditTask = (task: any) => {
    setEditingTask({
      id: task.id,
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
      },
    })
  }

  // Keyboard shortcuts
  const shortcuts = [
    // Global shortcuts
    { key: 'k', ctrl: true, description: 'Quick add task', handler: () => setIsAddingTask(true) },
    { key: '?', description: 'Show shortcuts help', handler: () => setShowShortcuts(true) },
    { key: '/', ctrl: true, description: 'Focus search', handler: () => {
      // Focus search input (would need ref to implement)
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
      searchInput?.focus()
    }},
    { key: 't', description: 'Toggle theme', handler: () => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }},
    { key: 'n', description: 'New task', handler: () => setIsAddingTask(true) },
    
    // Filter shortcuts
    { key: '1', description: 'Show all tasks', handler: () => handleFiltersChange({ ...filters, status: undefined }) },
    { key: '2', description: 'Show active tasks', handler: () => handleFiltersChange({ ...filters, status: 'PENDING' }) },
    { key: '3', description: 'Show completed tasks', handler: () => handleFiltersChange({ ...filters, status: 'COMPLETED' }) },
    { key: '1', ctrl: true, description: 'Filter high priority', handler: () => handleFiltersChange({ ...filters, priority: 'HIGH' }) },
    { key: '2', ctrl: true, description: 'Filter medium priority', handler: () => handleFiltersChange({ ...filters, priority: 'MEDIUM' }) },
    { key: '3', ctrl: true, description: 'Filter low priority', handler: () => handleFiltersChange({ ...filters, priority: 'LOW' }) },
  ]

  useKeyboardNavigation({
    shortcuts,
    enabled: !isAddingTask && !editingTask // Disable when dialogs are open
  })

  // Handle loading and error states
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tasks</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Failed to load tasks. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-6xl">
      {/* Keyboard shortcuts button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Keyboard Shortcuts
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6">
        {/* Sidebar with filters and add button */}
        <div className="w-full md:w-80 lg:w-96 space-y-3 sm:space-y-4">
          <AddTaskButton
            onClick={() => setIsAddingTask(true)}
            variant="card"
            disabled={isAddingTask || editingTask !== null || createTaskMutation.isPending}
          />
          <TaskFilter
            filters={{
              search: filters.search,
              status: filters.status ? [filters.status] : [],
              priority: filters.priority ? [filters.priority] : [],
              sortBy: filters.sortBy as any,
              sortOrder: filters.sortOrder,
            }}
            onFiltersChange={handleFiltersChange}
            taskCounts={taskCounts}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="ml-2 text-muted-foreground">Loading tasks...</span>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              selectedTaskIds={selectedTaskIds}
              onSelectionChange={setSelectedTaskIds}
              loadingStates={loadingStates}
              showCheckboxes={tasks.length > 0}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
              emptyComponent={
                emptyStateInfo && (
                  <EmptyState
                    variant={emptyStateInfo.variant}
                    title={emptyStateInfo.title}
                    description={emptyStateInfo.description}
                    onAddTask={() => setIsAddingTask(true)}
                    onClearFilters={() =>
                      setFilters({
                        search: '',
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                        page: 1,
                        limit: 20,
                      })
                    }
                    filters={{
                      search: filters.search,
                      status: filters.status ? [filters.status] : undefined,
                      priority: filters.priority ? [filters.priority] : undefined,
                      sortBy: filters.sortBy as any,
                      sortOrder: filters.sortOrder,
                    }}
                    searchTerm={emptyStateInfo.searchTerm}
                    totalTasks={tasks.length}
                  />
                )
              }
            />
          )}
        </div>
      </div>

      {/* Add/Edit Task Form Dialog */}
      {(isAddingTask || editingTask) && (
        <TaskFormDialog
          open={isAddingTask || !!editingTask}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingTask(false)
              setEditingTask(null)
            }
          }}
          task={
            editingTask
              ? ({
                  id: editingTask.id,
                  title: editingTask.data.title || '',
                  description: editingTask.data.description,
                  status: editingTask.data.status || 'PENDING',
                  priority: editingTask.data.priority || 'MEDIUM',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as Task)
              : undefined
          }
          onSubmit={(data) => {
            if (editingTask) {
              return handleUpdateTask(data as UpdateTaskData)
            } else {
              return handleAddTask(data as CreateTaskData)
            }
          }}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </div>
  )
}

export const TaskManagerApi = withErrorBoundary(TaskManagerApiContent)
