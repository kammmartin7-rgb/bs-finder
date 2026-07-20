#!/usr/bin/env node
/** Focused regression: Sales proposal action opens the existing generator for the selected lead. */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'

const baseUrl = process.argv[2] || 'http://127.0.0.1:5173'
const lead = {
  id: 'proposal-action-regression-lead',
  businessName: 'Proposal Action Regression Lead',
  contactName: 'Regression Contact',
  phone: '0501234567',
  city: 'Tel Aviv',
  category: 'Plumber',
  source: 'Regression Test',
  createdAt: '2026-07-20T08:00:00.000Z',
  isDemo: false,
}

const installedChromium = `${homedir()}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(installedChromium) ? { executablePath: installedChromium } : {}),
})
const page = await browser.newPage()
const consoleErrors = []
const pageErrors = []

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('pageerror', (error) => pageErrors.push(error.message))

await page.addInitScript((seedLead) => {
  localStorage.setItem('bs-hunter-real-leads', JSON.stringify([seedLead]))
  localStorage.setItem(`bs-hunter-crm:${seedLead.id}`, JSON.stringify({
    status: 'demo-sent',
    notes: '',
    notesHistory: [],
    nextFollowUp: '',
    dealAmount: '',
    proposalAmount: '',
    stageChangedAt: seedLead.createdAt,
    updatedAt: seedLead.createdAt,
  }))
  localStorage.setItem('business-os-settings-v1', JSON.stringify({
    language: 'he',
    theme: 'light',
    defaultScreen: 'dashboard',
    compactMode: false,
  }))
  localStorage.setItem('bs-hunter-language', 'he')
}, lead)

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.locator('.business-os__sidebar nav button').filter({ hasText: /Sales|מכירות/i }).click()
  await page.waitForSelector('[data-testid="current-lead-panel"]', { timeout: 15000 })

  const proposalButton = page.getByRole('button', { name: /שליחת הצעת מחיר/ }).first()
  await proposalButton.waitFor({ state: 'visible', timeout: 10000 })
  await proposalButton.click()

  const dialog = page.getByRole('dialog', { name: /הצעה לפרויקט אתר/ })
  await dialog.waitFor({ state: 'visible', timeout: 10000 })
  const selectedLeadPreloaded = await dialog.getByText(lead.businessName, { exact: true }).first().isVisible()

  if (!selectedLeadPreloaded) throw new Error('ProposalGenerator opened without the selected lead preloaded.')

  await dialog.getByRole('button', { name: /עריכת ההצעה/ }).click()
  await dialog.getByLabel('העברה בנקאית').check()
  await dialog.getByLabel('תשלומים', { exact: true }).check()
  await dialog.getByLabel('מספר תשלומים').fill('3')
  await dialog.getByLabel('תשלום ראשון').fill('₪1,000')
  await dialog.getByLabel('תאריך תחילת תשלום').fill('2026-08-01')
  await dialog.getByLabel('הערות ותנאי תשלום').fill('50% בתחילת העבודה ו-50% במסירה')
  const noDialog = new Promise((resolve) => page.once('dialog', async (confirmation) => {
    const message = confirmation.message()
    await confirmation.dismiss()
    resolve(message)
  }))
  await dialog.getByRole('button', { name: /שמירת טיוטת הצעה/ }).click()
  const declinedAdvanceMessage = await noDialog
  if (!declinedAdvanceMessage.includes("הצעת מחיר נשלחה")) {
    throw new Error(`Unexpected stage confirmation: ${declinedAdvanceMessage}`)
  }
  const stageAfterNo = await page.evaluate((leadId) => JSON.parse(localStorage.getItem(`bs-hunter-crm:${leadId}`) || '{}').status, lead.id)
  if (stageAfterNo !== 'demo-sent') throw new Error(`NO changed stage to ${stageAfterNo}.`)
  const savedPaymentDraft = await page.evaluate((leadId) => JSON.parse(localStorage.getItem(`bs-finder-proposal:${leadId}:draft`) || '{}'), lead.id)
  if (savedPaymentDraft.paymentOptions?.join(',') !== 'bankTransfer,installments' || savedPaymentDraft.installmentCount !== '3') {
    throw new Error('Payment options were not saved in the existing proposal draft.')
  }
  await dialog.locator('.proposal-payment-preview__methods').filter({ hasText: 'העברה בנקאית' }).waitFor({ state: 'visible' })
  await dialog.locator('.proposal-payment-preview__notes').filter({ hasText: '50% בתחילת העבודה ו-50% במסירה' }).waitFor({ state: 'visible' })

  await page.waitForTimeout(1100)
  await dialog.getByRole('button', { name: /עריכת ההצעה/ }).click()
  const yesDialog = new Promise((resolve) => page.once('dialog', async (confirmation) => {
    await confirmation.accept()
    resolve()
  }))
  await dialog.getByRole('button', { name: /שמירת טיוטת הצעה/ }).click()
  await yesDialog
  await page.waitForFunction((leadId) => JSON.parse(localStorage.getItem(`bs-hunter-crm:${leadId}`) || '{}').status === 'proposal-sent', lead.id)

  if (pageErrors.length || consoleErrors.length) {
    throw new Error(`Browser errors: ${[...pageErrors, ...consoleErrors].join(' | ')}`)
  }

  console.log('PASS — proposal action opens ProposalGenerator')
  console.log(`PASS — selected lead preloaded: ${lead.businessName}`)
  console.log('PASS — save asks whether to move to proposal-sent')
  console.log('PASS — NO keeps current stage; YES moves to proposal-sent')
  console.log('PASS — payment options persist in the existing draft and appear in preview')
  console.log('PASS — no browser console or runtime errors')
} finally {
  await browser.close()
}
