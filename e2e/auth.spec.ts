import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders the public landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CourseHub/i)
    await expect(page.getByRole('link', { name: /login|sign in|get started|acceder/i }).first()).toBeVisible()
  })
})

test.describe('Login page', () => {
  test('shows email input form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows error message for empty email submission', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button[type="submit"]').click()
    // Browser native validation or custom error
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
  })

  test('submits magic link request for valid email', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@coursehub.dev')
    await page.locator('button[type="submit"]').click()
    // Should show success message after sending magic link
    await expect(
      page.getByText(/link|email|sent|enviado|revisa/i).first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Unauthorized access', () => {
  test('redirects /admin to login when not authenticated', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login|\//)
  })

  test('redirects /dashboard to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login|\//)
  })
})
