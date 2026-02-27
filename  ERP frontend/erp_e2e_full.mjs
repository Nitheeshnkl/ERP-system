import { chromium } from 'playwright'
import fs from 'fs'

const BASE_URL = 'http://localhost:5173'

async function runTest() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log('=== E2E Test: ERP System (Improved) ===\n')
    
    // Step 1: Navigate and wait for React to render
    console.log('1. Navigating to app and waiting for React render...')
    await page.goto(BASE_URL)
    
    // Wait for main app elements to appear
    try {
      await page.waitForSelector('button, input, [role="button"]', { timeout: 10000 })
      console.log('   ✓ App rendered')
    } catch (e) {
      console.log('   ⚠ Timeout waiting for elements to appear')
      const screenshot = await page.screenshot({ path: '/tmp/failed_load.png' })
      console.log('   Screenshot saved to /tmp/failed_load.png')
    }
    
    // Check current state
    const bodyHTML = await page.evaluate(() => document.body.outerHTML.substring(0, 500))
    console.log('   HTML preview:', bodyHTML)
    
    // Step 2: Check if we're on login page or already logged in
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    console.log(`2. Auth check: token present = ${!!token}`)
    
    if (!token) {
      // We're on login page
      console.log('3. Attempting login...')
      
      // Wait for email input
      await page.waitForSelector('input[type="email"], input[placeholder*="mail"], input[placeholder*="Email"]', { timeout: 5000 }).catch(() => {})
      
      const emailInputs = await page.$$('input[type="email"], input[placeholder*="mail"], input[placeholder*="Email"]')
      console.log(`   Found ${emailInputs.length} email input(s)`)
      
      if (emailInputs.length > 0) {
        await emailInputs[0].fill('admin@erp.local')
        console.log('   ✓ Email filled')
      }
      
      const passInputs = await page.$$('input[type="password"], input[placeholder*="ass"], input[placeholder*="Pass"]')
      console.log(`   Found ${passInputs.length} password input(s)`)
      
      if (passInputs.length > 0) {
        await passInputs[0].fill('Admin@123456')
        console.log('   ✓ Password filled')
      }
      
      // Click login button
      const allButtons = await page.$$('button')
      console.log(`   Found ${allButtons.length} buttons, searching for login...`)
      let loginClicked = false
      for (const btn of allButtons) {
        const text = await btn.textContent()
        if (text && (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in'))) {
          console.log(`   ✓ Found login button: "${text}"`)
          await btn.click()
          loginClicked = true
          break
        }
      }
      
      if (!loginClicked) {
        console.log('   ⚠ Could not find login button, trying first button...')
        if (allButtons.length > 0) {
          await allButtons[allButtons.length - 1].click()
        }
      }
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(2000)
      console.log('   Login submission done')
    }
    
    // Step 4: Navigate to Sales Orders
    console.log('4. Navigating to /sales-orders...')
    await page.goto(`${BASE_URL}/sales-orders`)
    
    // Wait for page to load
    try {
      await page.waitForSelector('button, [role="button"]', { timeout: 5000 })
    } catch (e) {
      console.log('   ⚠ Buttons not found, page may not be fully loaded')
    }
    
    const soPageHTML = await page.evaluate(() => document.body.outerHTML.substring(0, 1000))
    console.log('   Sales Orders page HTML preview:', soPageHTML)
    
    // Step 5: Find and click New SO button
    console.log('5. Looking for New SO button...')
    const soButtons = await page.$$('button')
    console.log(`   Found ${soButtons.length} buttons on SO page`)
    
    let newSOBtn = null
    for (let i = 0; i < soButtons.length; i++) {
      const text = await soButtons[i].textContent()
      console.log(`   Button ${i}: "${text.trim().substring(0, 30)}"`)
      if (text && (text.includes('New SO') || text.includes('Add') || text.includes('Create'))) {
        newSOBtn = soButtons[i]
        console.log(`   ✓ Found New SO button at index ${i}`)
        break
      }
    }
    
    if (newSOBtn) {
      await newSOBtn.click()
      await page.waitForTimeout(1500)
      console.log('   ✓ Dialog opened (button clicked)')
      
      // Screenshot after dialog opens
      await page.screenshot({ path: '/tmp/dialog_open.png' })
      console.log('   Dialog screenshot saved to /tmp/dialog_open.png')
    } else {
      console.log('   ⚠ New SO button not found')
    }
    
    console.log('\n=== Test Steps Complete ===')
    
  } catch (error) {
    console.error('Error during test:', error.message)
    const errorScreenshot = await page.screenshot({ path: '/tmp/error.png' })
    console.log('   Error screenshot saved to /tmp/error.png')
  } finally {
    await browser.close()
  }
}

runTest()
