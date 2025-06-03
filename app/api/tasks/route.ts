import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTaskSchema, taskQuerySchema } from '@/lib/validations/task'
import { withErrorHandler, ApiError } from '@/lib/api-errors'
import { withSecurity, validateRequestBody } from '@/lib/security-middleware'

export const GET = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 100,
  maxRequestSize: 1024 * 10, // 10KB
})(
  withErrorHandler(async (request: NextRequest) => {
    // Validate and sanitize query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      search: searchParams.get('search') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    }

    // Validate and sanitize query parameters
    const validatedQuery = taskQuerySchema.parse(queryParams)

    // Build where clause from validated parameters
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search } },
        { description: { contains: validatedQuery.search } },
      ]
    }

    if (validatedQuery.priority) {
      where.priority = validatedQuery.priority
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: {
          [validatedQuery.sortBy]: validatedQuery.sortOrder,
        },
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      tasks,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    })
  }),
)

export const POST = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 30,
  maxRequestSize: 1024 * 5, // 5KB
  enableCSRF: true,
})(
  withErrorHandler(async (request: NextRequest) => {
    const body = await request.json()

    // Validate request body structure
    const bodyValidation = validateRequestBody(body)
    if (!bodyValidation.valid) {
      throw new ApiError(400, bodyValidation.error || 'Invalid request body')
    }

    // Validate and sanitize request data
    const validatedData = createTaskSchema.parse(body)

    // Transform date strings to Date objects for Prisma
    const taskData: any = {
      ...validatedData,
    }

    // Handle date fields - convert to Date or null
    // Map dueDate to deadline (database field name)
    if ('dueDate' in validatedData && validatedData.dueDate !== undefined) {
      taskData.deadline = validatedData.dueDate ? new Date(validatedData.dueDate) : null
      delete taskData.dueDate // Remove the dueDate field as it doesn't exist in database
    }
    if ('reminderTime' in validatedData && validatedData.reminderTime !== undefined) {
      taskData.reminderTime = validatedData.reminderTime
        ? new Date(validatedData.reminderTime)
        : null
    }

    // Create the task
    const task = await prisma.task.create({
      data: taskData,
    })

    return NextResponse.json(task, { status: 201 })
  }),
)
