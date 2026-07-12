// Single local source of truth for the Ideas Vault and Dashboard quick capture.
export const IDEAS_STORAGE_KEY = 'business-os-command-center-ideas-v1'
export const IDEAS_CHANGED_EVENT = 'business-os-ideas-changed'

export const IDEA_OPTIONS = {
  revenuePotential: ['low', 'medium', 'high'],
  timeToRevenue: ['today', 'this-week', 'this-month', 'later'],
  effort: ['low', 'medium', 'high'],
  cost: ['free', 'low', 'medium', 'high'],
  status: ['new', 'reviewing', 'approved', 'rejected', 'converted-to-task'],
}

const SCORE_WEIGHTS = {
  timeToRevenue: { today: 40, 'this-week': 30, 'this-month': 18, later: 5 },
  revenuePotential: { high: 30, medium: 18, low: 8 },
  effort: { low: 15, medium: 9, high: 2 },
  cost: { free: 15, low: 10, medium: 5, high: 0 },
}

function validOption(group, value, fallback) {
  return IDEA_OPTIONS[group].includes(value) ? value : fallback
}

export function normalizeIdea(idea = {}) {
  return {
    id: String(idea.id || `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    title: String(idea.title || '').trim(),
    description: String(idea.description || '').trim(),
    revenuePotential: validOption('revenuePotential', idea.revenuePotential, idea.priority === 'critical' ? 'high' : 'medium'),
    timeToRevenue: validOption('timeToRevenue', idea.timeToRevenue, 'later'),
    effort: validOption('effort', idea.effort, 'medium'),
    cost: validOption('cost', idea.cost, 'low'),
    status: validOption('status', idea.status, 'new'),
    nextAction: String(idea.nextAction || '').trim(),
    createdAt: idea.createdAt || new Date().toISOString(),
  }
}

export function scoreIdea(idea) {
  const normalized = normalizeIdea(idea)
  return SCORE_WEIGHTS.timeToRevenue[normalized.timeToRevenue]
    + SCORE_WEIGHTS.revenuePotential[normalized.revenuePotential]
    + SCORE_WEIGHTS.effort[normalized.effort]
    + SCORE_WEIGHTS.cost[normalized.cost]
}

export function ideaPriorityLabel(idea) {
  const normalized = normalizeIdea(idea)
  const score = scoreIdea(normalized)
  if (normalized.timeToRevenue === 'today' && normalized.revenuePotential === 'high') return 'fastMoney'
  if (normalized.revenuePotential === 'high' && score >= 55) return 'highPotential'
  if (normalized.timeToRevenue === 'later' || score < 35) return 'later'
  return 'review'
}

export function sortIdeas(ideas) {
  return [...ideas].sort((a, b) => scoreIdea(b) - scoreIdea(a) || new Date(b.createdAt) - new Date(a.createdAt))
}

export function loadIdeas() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(IDEAS_STORAGE_KEY))
    return Array.isArray(stored) ? sortIdeas(stored.map(normalizeIdea).filter((idea) => idea.title)) : []
  } catch {
    return []
  }
}

export function saveIdeas(ideas) {
  const normalized = sortIdeas(ideas.map(normalizeIdea).filter((idea) => idea.title))
  window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent(IDEAS_CHANGED_EVENT))
  return normalized
}

export function addIdea(idea) { return saveIdeas([normalizeIdea(idea), ...loadIdeas()]) }
export function updateIdea(id, updates) { return saveIdeas(loadIdeas().map((idea) => idea.id === id ? normalizeIdea({ ...idea, ...updates, id: idea.id, createdAt: idea.createdAt }) : idea)) }
export function deleteIdea(id) { return saveIdeas(loadIdeas().filter((idea) => idea.id !== id)) }
export function subscribeToIdeas(callback) { window.addEventListener(IDEAS_CHANGED_EVENT, callback); return () => window.removeEventListener(IDEAS_CHANGED_EVENT, callback) }

