export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date | string
  updatedAt: Date | string
  completedAt?: Date | string | null
  deadline?: Date | string | null
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  deadline?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'title'
  sortOrder?: 'asc' | 'desc'
}
