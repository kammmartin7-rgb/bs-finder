// Reusable website asset registry for Websites & Assets. Append entries to add more sites.
export const WEBSITE_ASSETS = [
  {
    id: 'bs-funds',
    name: 'BS Funds',
    icon: '◈',
    typeKey: 'assetTypeWebsite',
    statusKey: 'assetStatusActive',
    productionUrl: import.meta.env.VITE_BS_FUNDS_WEBSITE_URL?.trim() || 'https://bs-funds.vercel.app',
    repositoryUrl: 'https://github.com/kammmartin7-rgb/bs-funds',
  },
  {
    id: 'bs-finder',
    name: 'BS Finder',
    icon: '◎',
    typeKey: 'assetTypeWebsite',
    statusKey: 'assetStatusActive',
    productionUrl: import.meta.env.VITE_BS_FINDER_WEBSITE_URL?.trim() || 'https://bs-finder.vercel.app',
    repositoryUrl: 'https://github.com/kammmartin7-rgb/bs-finder',
    screen: 'bs-hunter',
  },  {
    id: 'plumber-demo',
    name: 'אתר אינסטלטור – דמו למכירה',
    icon: '🔧',
    typeKey: 'assetTypeWebsite',
    statusKey: 'assetStatusActive',
    productionUrl: 'https://plumber-pro-israel.kammmartin7.chatgpt.site',
    repositoryUrl: '',
  },

]

export function repositoryLabel(url = '') {
  return String(url).replace(/^https?:\/\/(www\.)?github\.com\//i, '')
}

export async function checkProductionUrlReachable(url) {
  const target = String(url || '').trim()
  if (!/^https?:\/\//i.test(target)) return false
  let sameOrigin = false
  try { sameOrigin = new URL(target).origin === window.location.origin } catch { return false }
  for (const method of sameOrigin ? ['GET'] : ['HEAD', 'GET']) {
    try {
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), 6000)
      const response = await fetch(target, { method, mode: 'cors', signal: controller.signal, cache: 'no-store' })
      window.clearTimeout(timer)
      if (response.ok) return true
    } catch { /* try next method or return false */ }
  }
  return false
}

export async function copyAssetUrl(value) {
  const text = String(value || '').trim()
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const field = document.createElement('textarea')
      field.value = text
      field.setAttribute('readonly', '')
      field.style.position = 'absolute'
      field.style.left = '-9999px'
      document.body.appendChild(field)
      field.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(field)
      return copied
    } catch {
      return false
    }
  }
}
