import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:5173'

async function runTest() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    console.log('=== E2E Test - Debug Mode ===\n')
    
    // Navigate to app
    console.log('1. Navigating to app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    
    // Log what's on the page
    const bodyText = await page.locator('body').textContent()
    console.log('   Page text sample:', bodyText.substring(0, 200))
    
    // Check for login form
    console.log('2. Checking for login elements...')
    const inputs = await page.$$('input')
    console.log(`   Found ${inputs.length} input elements`)
    
    const buttons = await page.$$('button')
    console.log(`   Found ${buttons.length} button elements`)
    
    // Log button texts
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const text = await buttons[i].textContent()
      console.log(`   Button ${i}: "${text}"`)
    }
    
    // Check if already authenticated
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    console.log(`   Auth token present: ${!!token}`)
    
    // If not authenticated, try to login
    if (!token) {
      console.log('3. Attempting login...')
      const emailInp = await page.$('input[type="email"]')
      if (emailInp) {
        await emailInp.fill('admin@erp.local')
        console.log('   ✓ Email filled')
      }
      
      const passInp = await page.$('input[type="password"]')
      if (passInp) {
        await passInp.fill('Admin@123456')
        console.log('   ✓ Password filled')
      }
      
      // Find and click login button
      const allButtons = await page.$$('button')
      for (const btn of allButtons) {
        const text = await btn.textContent()
        if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign')) {
          await btn.click()
          console.log('   ✓ Login button clicked')
          await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {})
          await page.waitForTimeout(2000)
          break
        }
      }
    }
    
    // Navigate to Sales Orders
    console.log('4. Navigating to /sales-orders')
    await page.goto(`${BASE_URL}/sales-orders`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    
    const pageTitle = await page.title()
    console.log(`   Page title: ${pageTitle}`)
    
    // Show all buttons on SO page
    const soButtons = await page.$$('button')
    console.log(`   Found ${soButtons.length} buttons on SO page`)
    for (let i = 0; i < Math.min(soButtons.length, 10); i++) {
      const text = await soButtons[i].textContent()
      console.log(`   Button: "${text.trim().substring(0, 50)}"`)
    }
    
    console.log('\n=== Debug Complete - Check browser window ===')
    await page.waitForTimeout(10000)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await browser.close()
  }
}

runTest()
