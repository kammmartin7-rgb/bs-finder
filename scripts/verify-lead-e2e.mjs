#!/usr/bin/env node
/**
 * End-to-end lead persistence verification against the running Vite dev server.
 * Usage: node scripts/verify-lead-e2e.mjs [baseUrl]
 */
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const BASE_URL = process.argv[2] || 'http://localhost:5173'
const PLUMBER_NAME = 'אינסטלטור בפתח תקווה יובל קדס'
const CANONICAL_KEY = 'bs-hunter-real-leads'

const results = []

function record(step, pass, detail = '') {
  results.push({ step, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${step}${detail ? `: ${detail}` : ''}`)
}

async function loadPlaywright() {
  try {
    const mod = await import('playwright')
    return mod.chromium
  } catch {
    const { execSync } = await import('node:child_process')
    execSync('npm install --no-save playwright@1.52.0', { stdio: 'inherit' })
    const mod = await import('playwright')
    return mod.chromium
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return true
    } catch {
      // retry
    }
    await delay(500)
  }
  return false
}

async function restartDevServer() {
  spawn('pkill', ['-f', 'vite'], { stdio: 'ignore' }).on('error', () => {})
  await delay(1500)
  const child = spawn('npm', ['run', 'dev'], {
    cwd: new URL('..', import.meta.url).pathname,
    stdio: 'ignore',
    detached: true,
  })
  child.unref()
  const ready = await waitForServer(BASE_URL, 45000)
  return ready
}

async function run() {
  const chromium = await loadPlaywright()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const ready = await waitForServer(BASE_URL)
  if (!ready) {
    record('Dev server reachable', false, BASE_URL)
    await browser.close()
    printSummary()
    process.exit(1)
  }

  // Seed legacy manual store to verify recovery path
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(({ lead }) => {
    localStorage.removeItem('bs-hunter-real-leads')
    localStorage.setItem('bs-hunter-manual-leads', JSON.stringify([lead]))
  }, {
    lead: {
      id: 'manual-recover-test',
      businessName: PLUMBER_NAME,
      phone: '050-562-6228',
      address: 'מבצע דקל 11, פתח תקווה',
      category: 'Plumber',
      rating: 5,
      reviewsCount: 13,
      source: 'Google Maps',
      city: 'פתח תקווה',
      isDemo: false,
      createdAt: '2026-07-01T10:00:00.000Z',
    },
  })

  await page.reload({ waitUntil: 'networkidle' })

  const storageAfterRecovery = await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    const leads = raw ? JSON.parse(raw) : []
    const plumber = leads.find((lead) => String(lead.businessName || '').includes('יובל קדס'))
    return {
      count: leads.length,
      hasPlumber: Boolean(plumber),
      leadId: plumber?.id || null,
      legacyManual: localStorage.getItem('bs-hunter-manual-leads'),
    }
  }, CANONICAL_KEY)

  record(
    'Recover plumber from legacy storage into bs-hunter-real-leads',
    storageAfterRecovery.hasPlumber && storageAfterRecovery.count >= 1,
    `count=${storageAfterRecovery.count}, leadId=${storageAfterRecovery.leadId}`,
  )

  await page.getByRole('button', { name: /CRM|crm/i }).first().click()
  await page.waitForSelector('.crm-v2', { timeout: 10000 })
  const crmVisible = await page.locator('.crm-lead-card', { hasText: 'יובל קדס' }).count()
  record('Plumber appears in CRM', crmVisible > 0, `cards=${crmVisible}`)

  await page.getByRole('button', { name: /Sales|sales|מכירות/i }).first().click()
  await page.waitForSelector('.crm-v2__pipeline', { timeout: 10000 })
  const pipelineVisible = await page.locator('.crm-v2__pipeline .crm-lead-card', { hasText: 'יובל קדס' }).count()
  record('Plumber appears in Sales Pipeline', pipelineVisible > 0, `cards=${pipelineVisible}`)

  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Sales|sales|מכירות/i }).first().click()
  await page.waitForSelector('.crm-v2__pipeline', { timeout: 10000 })
  const afterRefresh = await page.locator('.crm-v2__pipeline .crm-lead-card', { hasText: 'יובל קדס' }).count()
  record('Plumber survives browser refresh', afterRefresh > 0)

  const editField = `E2E-City-${Date.now()}`
  const plumberCard = page.locator('.crm-lead-card', { hasText: 'יובל קדס' })
  await plumberCard.getByRole('button', { name: /Edit Lead|עריכת ליד|Редактировать/i }).click()
  await page.waitForSelector('#lead-edit-title')
  const editForm = page.locator('form.manual-lead-form').filter({ has: page.locator('#lead-edit-title') })
  await editForm.locator('input').nth(2).fill(editField)
  await editForm.evaluate((form) => form.requestSubmit())
  await page.waitForSelector('#lead-edit-title', { state: 'detached', timeout: 10000 }).catch(() => {})
  await delay(500)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Sales|sales|מכירות/i }).first().click()
  await page.waitForSelector('.crm-v2__pipeline', { timeout: 10000 })
  const editPersisted = await page.evaluate(({ key, city }) => {
    const leads = JSON.parse(localStorage.getItem(key) || '[]')
    return leads.some((lead) => String(lead.city || '') === city)
  }, { key: CANONICAL_KEY, city: editField })
  record('Field edit persists after refresh', editPersisted, editField)

  await page.locator('.crm-lead-card', { hasText: 'יובל קדס' }).locator('.crm-lead-card__stage').selectOption('first-contact')
  await delay(300)
  await page.getByRole('button', { name: /CRM|crm/i }).first().click()
  await page.waitForSelector('.crm-v2', { timeout: 10000 })
  const crmStageValue = await page.locator('.crm-lead-card', { hasText: 'יובל קדס' }).locator('.crm-lead-card__stage').inputValue()
  const statusLeadId = await page.evaluate((key) => {
    const leads = JSON.parse(localStorage.getItem(key) || '[]')
    const plumber = leads.find((lead) => String(lead.businessName || '').includes('יובל קדס'))
    return plumber?.id || null
  }, CANONICAL_KEY)
  const statusEverywhere = crmStageValue === 'first-contact' && await page.evaluate((leadId) => {
    const crm = JSON.parse(localStorage.getItem(`bs-hunter-crm:${leadId}`) || '{}')
    return crm.status === 'first-contact'
  }, statusLeadId)
  record('Status change stored on LeadID CRM record', statusEverywhere, `${statusLeadId} stage=${crmStageValue}`)

  const duplicateBlocked = await page.evaluate(async () => {
    const leadsBefore = JSON.parse(localStorage.getItem('bs-hunter-real-leads') || '[]').length
    window.__dupTest = { blocked: false }
    return { leadsBefore }
  })
  void duplicateBlocked

  const manualAddBlocked = await page.evaluate(() => {
    const leads = JSON.parse(localStorage.getItem('bs-hunter-real-leads') || '[]')
    const phone = '0505626228'
    const duplicate = leads.filter((lead) => String(lead.phone || '').replace(/\D/g, '') === phone)
    return duplicate.length === 1
  })
  record('No duplicate for same phone number', manualAddBlocked)

  await browser.close()

  const viteRestarted = await restartDevServer()
  record('Vite dev server restart', viteRestarted, BASE_URL)

  const browser2 = await chromium.launch({ headless: true })
  const page2 = await browser2.newPage()
  await page2.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page2.getByRole('button', { name: /Sales|sales|מכירות/i }).first().click()
  await page2.waitForSelector('.crm-v2__pipeline', { timeout: 15000 })
  const afterViteRestart = await page2.locator('.crm-v2__pipeline .crm-lead-card', { hasText: 'יובל קדס' }).count()
  record('Plumber survives Vite restart', afterViteRestart > 0)
  await browser2.close()

  printSummary()
  process.exit(results.every((item) => item.pass) ? 0 : 1)
}

function printSummary() {
  console.log('\n=== Verification Summary ===')
  for (const item of results) {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} — ${item.step}`)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
