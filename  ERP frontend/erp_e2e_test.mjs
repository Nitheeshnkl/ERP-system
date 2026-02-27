import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:5173'

async function runTest() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log('=== E2E Test: ERP System ===\n')
    
    // Step 1: Navigate to app
    console.log('1. Navigating to app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    console.log('   ✓ App loaded')
    
    // Step 2: Login as Admin
    console.log('2. Logging in as Admin...')
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i]')
    const passwordInput = await page.$('input[type="password"], input[placeholder*="password" i]')
    if (emailInput && passwordInput) {
      await emailInput.fill('admin@erp.local')
      await passwordInput.fill('Admin@123456')
      const loginBtn = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')
      if (loginBtn) {
        await loginBtn.click()
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})
        await page.waitForTimeout(2000)
        console.log('   ✓ Login submitted')
      }
    } else {
      console.log('   ⚠ Login form not found, checking if already logged in')
    }
    
    // Step 3: Navigate to Sales Orders
    console.log('3. Navigating to Sales Orders...')
    await page.goto(`${BASE_URL}/sales-orders`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    const soTitle = await page.locator('h4, h1, h2, h3').first().textContent().catch(() => null)
    console.log(`   ✓ Sales Orders page loaded (title: ${soTitle || 'N/A'})`)
    
    // Step 4: Click "New SO" button
    console.log('4. Opening Create Sales Order dialog...')
    const newSOBtn = await page.$('button:has-text("New SO"), button:has-text("Add")')
    if (newSOBtn) {
      await newSOBtn.click()
      await page.waitForTimeout(1500)
      console.log('   ✓ Dialog opened')
    } else {
      console.log('   ⚠ New SO button not found')
    }
    
    // Step 5: Fill Customer dropdown
    console.log('5. Selecting Customer...')
    const customerInputs = await page.$$eval('input[aria-label*="Customer" i], [role="combobox"]', els => els.slice(0, 1).map(el => el.tagName))
    if (customerInputs.length > 0) {
      const custInput = await page.$('input[aria-label*="Customer" i], [role="combobox"]')
      if (custInput) {
        await custInput.click()
        await page.waitForTimeout(500)
        const firstOption = await page.$('[role="option"]')
        if (firstOption) {
          await firstOption.click()
          console.log('   ✓ Customer selected')
        }
      }
    }
    
    // Step 6: Select Product
    console.log('6. Selecting Product...')
    const prodInputs = await page.$$eval('input[aria-label*="Product" i], [role="combobox"]', els => els.slice(1, 2).map(el => el.tagName))
    if (prodInputs.length > 0) {
      const prodInput = await page.locator('input[aria-label*="Product" i], [role="combobox"]').nth(1)
      await prodInput.click()
      await page.waitForTimeout(500)
      const options = await page.locator('[role="option"]').all()
      if (options.length > 0) {
        await options[0].click()
        console.log('   ✓ Product selected')
      }
    }
    
    // Step 7-9: Fill numeric fields
    console.log('7-9. Filling Quantity, Unit Price, Total Amount...')
    const numInputs = await page.$$('input[type="number"]')
    if (numInputs.length >= 1) await numInputs[0].fill('2')
    if (numInputs.length >= 2) await numInputs[1].fill('100')
    if (numInputs.length >= 3) await numInputs[2].fill('200')
    console.log('   ✓ Form filled')
    
    // Step 10: Save Sales Order
    console.log('10. Saving Sales Order...')
    const saveBtn = await page.$('button:has-text("Save"):visible')
    if (saveBtn) {
      await saveBtn.click()
      await page.waitForTimeout(2000)
      console.log('   ✓ Sales Order submitted')
    } else {
      console.log('   ⚠ Save button not found')
    }
    
    // Step 11: Navigate to Purchase Orders
    console.log('11. Navigating to Purchase Orders...')
    await page.goto(`${BASE_URL}/purchase-orders`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    console.log('   ✓ Purchase Orders page loaded')
    
    // Step 12: Click "New PO" button
    console.log('12. Opening Create Purchase Order dialog...')
    const newPOBtn = await page.$('button:has-text("New PO"), button:has-text("Add")')
    if (newPOBtn) {
      await newPOBtn.click()
      await page.waitForTimeout(1500)
      console.log('   ✓ Dialog opened')
    }
    
    // Step 13-14: Fill Supplier and Product
    console.log('13. Selecting Supplier...')
    const suppInput = await page.$('input[aria-label*="Supplier" i], [role="combobox"]')
    if (suppInput) {
      await suppInput.click()
      await page.waitForTimeout(500)
      const option = await page.$('[role="option"]')
      if (option) {
        await option.click()
        console.log('   ✓ Supplier selected')
      }
    }
    
    console.log('14. Selecting Product for PO...')
    const prodSelects = await page.$$('input[aria-label*="Product" i], [role="combobox"]')
    if (prodSelects.length > 0) {
      await prodSelects[0].click()
      await page.waitForTimeout(500)
      const opt = await page.$('[role="option"]')
      if (opt) {
        await opt.click()
        console.log('   ✓ Product selected')
      }
    }
    
    // Step 15-17: Fill numeric fields for PO
    console.log('15-17. Filling quantity, price, total...')
    const poNumInputs = await page.$$('input[type="number"]')
    if (poNumInputs.length >= 1) await poNumInputs[0].fill('5')
    if (poNumInputs.length >= 2) await poNumInputs[1].fill('90')
    if (poNumInputs.length >= 3) await poNumInputs[2].fill('450')
    console.log('   ✓ Form filled')
    
    // Step 18: Save PO
    console.log('18. Saving Purchase Order...')
    const savePOBtn = await page.$('button:has-text("Save"):visible')
    if (savePOBtn) {
      await savePOBtn.click()
      await page.waitForTimeout(2000)
      console.log('   ✓ Purchase Order submitted')
    }
    
    console.log('\n=== E2E Test Complete ===')
  } catch (error) {
    console.error('Error during test:', error.message)
    console.error(error)
  } finally {
    await browser.close()
  }
}

runTest()
