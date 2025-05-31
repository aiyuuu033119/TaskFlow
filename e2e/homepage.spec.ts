import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display the main elements', async ({ page }) => {
    await page.goto('/')

    // Check if the page title is correct
    await expect(page).toHaveTitle(/TaskFlow/)

    // Check if the header is visible
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('h1:has-text("TaskFlow")')).toBeVisible()

    // Check if the theme toggle is present
    await expect(page.locator('[aria-label*="theme"], button:has-text("Toggle theme")')).toBeVisible()

    // Check if the main content area is visible
    await expect(page.locator('main')).toBeVisible()

    // Check if the Add Task button is visible
    await expect(page.locator('button:has-text("Add Task")')).toBeVisible()
  })

  test('should create a new task', async ({ page }) => {
    await page.goto('/')

    // Click Add Task button
    await page.click('button:has-text("Add Task")')

    // Fill in the task form
    await page.fill('input[placeholder*="title"]', 'Test Task from E2E')
    await page.fill('textarea[placeholder*="description"]', 'This is a test task created by E2E test')

    // Select priority
    await page.click('button[role="combobox"]:has-text("Low")')
    await page.click('div[role="option"]:has-text("High")')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for the task to appear
    await expect(page.locator('text=Test Task from E2E')).toBeVisible({ timeout: 10000 })
  })

  test('should filter tasks by status', async ({ page }) => {
    await page.goto('/')

    // Expand filters if needed
    const filterSection = page.locator('text=Filters & Sort')
    if (await filterSection.isVisible()) {
      await filterSection.click()
    }

    // Click on status filter
    await page.click('button:has-text("Pending")')

    // Wait for the filter to be applied
    await page.waitForTimeout(1000)

    // Check that the URL has been updated with the filter
    expect(page.url()).toContain('status=PENDING')
  })

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/')

    // Get initial theme
    const htmlElement = page.locator('html')
    const initialTheme = await htmlElement.getAttribute('class')

    // Click theme toggle
    await page.click('[aria-label*="theme"], button:has-text("Toggle theme")')

    // Check that theme has changed
    await expect(htmlElement).not.toHaveAttribute('class', initialTheme)
  })
})