#!/usr/bin/env node
/**
 * BOS-028 lead persistence E2E verification against the running Vite dev server.
 * Does not wipe existing leads — records count before/after and verifies the test lead persists.
 *
 * Usage: node scripts/verify-lead-e2e.mjs [baseUrl]
 */
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const BASE_URL = process.argv[2] || 'http://localhost:5173'
const CANONICAL_KEY = 'bs-hunter-real-leads'
const REPO_ROOT = new URL('..', import.meta.url).pathname

const results = []
let testMarker = ''
let testPhone = ''
let testLeadId = null
let initialLeadCount = 0

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
    execSync('npm install --no-save playwright@1.52.0', { stdio: 'inherit', cwd: REPO_ROOT })
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
    cwd: REPO_ROOT,
    stdio: 'ignore',
    detached: true,
  })
  child.unref()
  return waitForServer(BASE_URL, 45000)
}

async function readLeadStorage(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    let leads = []
    try {
      leads = raw ? JSON.parse(raw) : []
    } catch {
      leads = []
    }
    if (!Array.isArray(leads)) leads = []
    return { count: leads.length, leads }
  }, CANONICAL_KEY)
}

async function openSales(page) {
  await page.locator('.business-os__sidebar nav button').filter({ hasText: /Sales|מכירות|المبيعات|Продажи/i }).click()
  await page.waitForSelector('.crm-v2__pipeline', { timeout: 15000 })
}

async function openManualLeadForm(page) {
  await page.getByRole('button', { name: /הוספת ליד ידנית|Add Lead Manually|הוסף ליד/i }).click()
  await page.waitForSelector('#manual-lead-title', { timeout: 10000 })
}

async function fillManualLeadForm(page, { businessName, phone, city = 'E2E City' }) {
  const form = page.locator('form.manual-lead-form').filter({ has: page.locator('#manual-lead-title') })
  await form.getByLabel(/Business Name|שם העסק|اسم النشاط|Название компании/i).fill(businessName)
  await form.getByLabel(/City|עיר|المدينة|Город/i).fill(city)
  await form.getByLabel(/Phone|טלפון|الهاتف|Телефон/i).fill(phone)
  await form.getByRole('button', { name: /Save Lead|שמירת ליד|حفظ العميل|Сохранить лид/i }).click()
}

async function waitForManualLeadFormClose(page) {
  await page.waitForSelector('#manual-lead-title', { state: 'detached', timeout: 10000 }).catch(() => {})
  await delay(300)
}

async function openLeadEditFromPipelineCard(page, businessName) {
  const card = page.locator('.crm-v2__pipeline .crm-lead-card--pipeline', { hasText: businessName }).first()
  await card.click()
  await page.waitForSelector('#lead-edit-title', { timeout: 10000 })
  return card
}

async function closeLeadEdit(page) {
  const dialog = page.locator('.manual-lead-overlay').filter({ has: page.locator('#lead-edit-title') })
  await dialog.getByRole('button', { name: /Cancel|ביטול|Отмена|إلغاء/i }).click()
  await page.waitForSelector('#lead-edit-title', { state: 'detached', timeout: 10000 }).catch(() => {})
  await delay(300)
}

async function saveLeadEdit(page) {
  const form = page.locator('form.manual-lead-form').filter({ has: page.locator('#lead-edit-title') })
  await form.getByRole('button', { name: /Save Changes|שמירת שינויים|حفظ التغييرات|Сохранить изменения/i }).click()
  await page.waitForSelector('#lead-edit-title', { state: 'detached', timeout: 10000 }).catch(() => {})
  await delay(300)
}

async function findTestLeadInStorage(page) {
  return page.evaluate(({ key, marker }) => {
    const leads = JSON.parse(localStorage.getItem(key) || '[]')
    const lead = leads.find((item) => String(item.businessName || '') === marker)
    return lead ? { found: true, id: lead.id || lead.placeId || null, city: lead.city || '', phone: lead.phone || '' } : { found: false }
  }, { key: CANONICAL_KEY, marker: testMarker })
}

async function run() {
  testMarker = `E2E-BOS028-${Date.now()}`
  testPhone = `050-${String(Date.now()).slice(-7)}`

  const chromium = await loadPlaywright()
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const ready = await waitForServer(BASE_URL)
  record('Dev server reachable', ready, BASE_URL)
  if (!ready) {
    await browser.close()
    printSummary()
    process.exit(1)
  }

  await page.goto(BASE_URL, { waitUntil: 'networkidle' })

  const initialStorage = await readLeadStorage(page)
  initialLeadCount = initialStorage.count
  record('Record existing lead count before testing', initialLeadCount >= 0, `count=${initialLeadCount}`)

  await openSales(page)

  await openManualLeadForm(page)
  await fillManualLeadForm(page, { businessName: testMarker, phone: testPhone })
  await waitForManualLeadFormClose(page)

  const afterCreateStorage = await readLeadStorage(page)
  const createdLead = afterCreateStorage.leads.find((lead) => String(lead.businessName || '') === testMarker)
  testLeadId = createdLead?.id || createdLead?.placeId || null
  record(
    'Manual lead creation persists to bs-hunter-real-leads',
    Boolean(createdLead) && afterCreateStorage.count === initialLeadCount + 1,
    `count=${afterCreateStorage.count}, leadId=${testLeadId || 'missing'}`,
  )

  await openManualLeadForm(page)
  await fillManualLeadForm(page, { businessName: `${testMarker}-DUPLICATE`, phone: testPhone })
  const duplicateErrorVisible = await page.locator('.manual-lead-form .manual-lead-error').isVisible()
  await page.locator('form.manual-lead-form').filter({ has: page.locator('#manual-lead-title') })
    .getByRole('button', { name: /Cancel|ביטול|Отмена|إلغاء/i }).click()
  await waitForManualLeadFormClose(page)
  const afterDuplicateStorage = await readLeadStorage(page)
  record(
    'Duplicate phone blocked on manual create',
    duplicateErrorVisible && afterDuplicateStorage.count === afterCreateStorage.count,
    duplicateErrorVisible ? 'duplicate error shown' : 'no duplicate error',
  )

  const editCity = `E2E-City-${Date.now()}`
  await openLeadEditFromPipelineCard(page, testMarker)
  const editForm = page.locator('form.manual-lead-form').filter({ has: page.locator('#lead-edit-title') })
  await editForm.getByLabel(/City|עיר|المدينة|Город/i).fill(editCity)
  await saveLeadEdit(page)
  const afterEditStorage = await findTestLeadInStorage(page)
  record(
    'Lead edit opens from pipeline card click and persists city',
    afterEditStorage.found && afterEditStorage.city === editCity,
    `city=${afterEditStorage.city || 'missing'}`,
  )

  await openLeadEditFromPipelineCard(page, testMarker)
  await closeLeadEdit(page)

  const selectedCard = page.locator('.crm-v2__pipeline .crm-lead-card--pipeline.is-selected', { hasText: testMarker }).first()
  const stageSelect = selectedCard.locator('.crm-lead-card__stage--pipeline')
  await stageSelect.waitFor({ state: 'visible', timeout: 10000 })
  await stageSelect.selectOption('first-contact')
  await delay(400)

  const stageFromStorage = await page.evaluate(({ key, marker }) => {
    const leads = JSON.parse(localStorage.getItem(key) || '[]')
    const lead = leads.find((item) => String(item.businessName || '') === marker)
    const leadId = lead?.id || lead?.placeId
    if (!leadId) return { ok: false }
    const crm = JSON.parse(localStorage.getItem(`bs-hunter-crm:${leadId}`) || '{}')
    return { ok: crm.status === 'first-contact', leadId, status: crm.status || '' }
  }, { key: CANONICAL_KEY, marker: testMarker })
  record(
    'Pipeline stage selector updates LeadID CRM record',
    stageFromStorage.ok,
    `leadId=${stageFromStorage.leadId}, status=${stageFromStorage.status}`,
  )

  const sourceCard = page.locator('.crm-v2__pipeline .crm-lead-card--pipeline', { hasText: testMarker }).first()
  const targetDropZone = page.locator('.crm-v2__pipeline .pipeline-column').nth(2).locator('.pipeline-column-leads')
  await sourceCard.dragTo(targetDropZone)
  await delay(500)

  const dragStageFromStorage = await page.evaluate(({ key, marker }) => {
    const leads = JSON.parse(localStorage.getItem(key) || '[]')
    const lead = leads.find((item) => String(item.businessName || '') === marker)
    const leadId = lead?.id || lead?.placeId
    if (!leadId) return { ok: false }
    const crm = JSON.parse(localStorage.getItem(`bs-hunter-crm:${leadId}`) || '{}')
    return { ok: crm.status === 'demo-sent', leadId, status: crm.status || '' }
  }, { key: CANONICAL_KEY, marker: testMarker })
  record(
    'Drag-and-drop between pipeline stages updates CRM status',
    dragStageFromStorage.ok,
    `leadId=${dragStageFromStorage.leadId}, status=${dragStageFromStorage.status}`,
  )

  await page.reload({ waitUntil: 'networkidle' })
  await openSales(page)
  const afterRefreshCardCount = await page.locator('.crm-v2__pipeline .crm-lead-card--pipeline', { hasText: testMarker }).count()
  const afterRefreshStorage = await findTestLeadInStorage(page)
  record(
    'Test lead survives browser refresh',
    afterRefreshCardCount > 0 && afterRefreshStorage.found,
    `cards=${afterRefreshCardCount}, storage=${afterRefreshStorage.found}`,
  )

  const viteRestarted = await restartDevServer()
  record('Vite dev server restart', viteRestarted, BASE_URL)

  await page.reload({ waitUntil: 'networkidle' })
  await openSales(page)
  const afterRestartCardCount = await page.locator('.crm-v2__pipeline .crm-lead-card--pipeline', { hasText: testMarker }).count()
  const afterRestartStorage = await readLeadStorage(page)
  const restartLead = afterRestartStorage.leads.find((lead) => String(lead.businessName || '') === testMarker)
  record(
    'Test lead survives dev-server restart',
    afterRestartCardCount > 0 && Boolean(restartLead),
    `cards=${afterRestartCardCount}, count=${afterRestartStorage.count}`,
  )

  const finalCountOk = afterRestartStorage.count >= initialLeadCount + 1
  record(
    'Final lead count did not decrease',
    finalCountOk,
    `before=${initialLeadCount}, after=${afterRestartStorage.count}`,
  )

  record(
    'Test lead remains in bs-hunter-real-leads',
    Boolean(restartLead),
    restartLead ? `leadId=${restartLead.id || restartLead.placeId}` : 'missing',
  )

  await browser.close()

  printSummary()
  process.exit(results.every((item) => item.pass) ? 0 : 1)
}

function printSummary() {
  console.log('\n=== BOS-028 Verification Summary ===')
  for (const item of results) {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} — ${item.step}`)
  }
  const passed = results.filter((item) => item.pass).length
  console.log(`\n${passed}/${results.length} checks passed`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
