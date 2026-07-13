// Owns the single local CRM daily-goal record; activity remains in existing lead action storage.
export const CRM_GOALS_STORAGE_KEY = 'bs-finder-crm-daily-goals-v1'

export const DEFAULT_CRM_GOALS = { leads: 50, outreach: 20, calls: 10, followUps: 7, deals: 2 }

export function loadCrmGoals() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CRM_GOALS_STORAGE_KEY))
    return Object.fromEntries(Object.entries(DEFAULT_CRM_GOALS).map(([key, fallback]) => {
      const savedValue = saved?.[key]
      return [key, savedValue === '' || savedValue === undefined || savedValue === null ? fallback : Math.max(0, Number(savedValue) || 0)]
    }))
  } catch { return { ...DEFAULT_CRM_GOALS } }
}

export function saveCrmGoals(goals) {
  const normalized = Object.fromEntries(Object.keys(DEFAULT_CRM_GOALS).map((key) => [key, Math.max(0, Number(goals[key]) || 0)]))
  window.localStorage.setItem(CRM_GOALS_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}
