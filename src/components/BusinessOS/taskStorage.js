// Owns task persistence, starter data, sorting, and same/cross-tab update notifications.
const STORAGE_KEY = 'business-os-tasks'
const TASK_CHANGE_EVENT = 'business-os-tasks-change'
const ROADMAP_CREATED_KEY = 'business-os-roadmap-100-created'

export const TASK_CATEGORIES = ['Business OS', 'BS Hunter', 'Lead Search', 'Demo Websites', 'Sales', 'CRM', 'Proposals', 'WhatsApp', 'Payments', 'BS Funds', 'Marketing', 'Automation', 'Infrastructure', 'Global Languages', 'Future Development']

const STARTER_TITLES = [
  'Fix real lead search',
  'Connect live lead data',
  'Improve demo site quality',
  'Track proposal creation',
  'Track WhatsApp sending',
  'Prepare payment integration for Sunday',
]

function dateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function createStarterTasks() {
  const createdAt = new Date().toISOString()
  return STARTER_TITLES.map((title, index) => ({
    id: `starter-${index + 1}`,
    title,
    description: `Complete the Business OS work item: ${title}.`,
    project: index === 5 ? 'Business OS' : 'BS Hunter',
    category: index === 5 ? 'Payments' : 'Product',
    priority: index < 2 ? 'critical' : 'important',
    status: 'open',
    dueDate: dateOffset(index + 1),
    assignee: 'BS Team',
    revenueImpact: index < 2 ? 10000 : 5000,
    isBlocking: index < 2,
    notes: '',
    createdAt,
    completedAt: '',
  }))
}

const ROADMAP_ACTIONS = ['Audit current workflow', 'Define success metrics', 'Design production workflow', 'Implement core capability', 'Add validation and safeguards', 'Automate repetitive steps', 'Document and launch']

function normalizeTitle(title) {
  return String(title || '').trim().toLowerCase()
}

function createRoadmap(existingStarters = []) {
  const starterCategories = ['Lead Search', 'Lead Search', 'Demo Websites', 'Proposals', 'WhatsApp', 'Payments']
  const reusedStarters = createStarterTasks().map((starter, index) => {
    const existing = existingStarters.find((task) => task.id === starter.id || normalizeTitle(task.title) === normalizeTitle(starter.title))
    return { ...starter, ...(existing || {}), category: starterCategories[index] }
  })
  const titles = new Set(reusedStarters.map((task) => normalizeTitle(task.title)))
  const roadmap = [...reusedStarters]
  let sequence = 0

  while (roadmap.length < 100) {
    const category = TASK_CATEGORIES[sequence % TASK_CATEGORIES.length]
    const action = ROADMAP_ACTIONS[Math.floor(sequence / TASK_CATEGORIES.length) % ROADMAP_ACTIONS.length]
    const title = `${category}: ${action}`
    sequence += 1
    if (titles.has(normalizeTitle(title))) continue

    const index = roadmap.length
    const completed = index >= 85
    roadmap.push({
      id: `roadmap-${index + 1}`,
      title,
      description: `${action} for the ${category} workstream and record the measurable outcome.`,
      project: category === 'BS Funds' ? 'BS Funds' : 'Business OS',
      category,
      priority: completed ? 'completed' : index < 22 ? 'critical' : 'important',
      status: completed ? 'completed' : index % 13 === 0 ? 'blocked' : index % 7 === 0 ? 'in-progress' : 'open',
      dueDate: dateOffset((index % 75) + 1),
      assignee: index % 4 === 0 ? 'Automation Agent' : 'BS Team',
      revenueImpact: Math.max(1000, 15000 - index * 110),
      isBlocking: !completed && index % 9 === 0,
      notes: '',
      createdAt: new Date().toISOString(),
      completedAt: completed ? new Date().toISOString() : '',
    })
    titles.add(normalizeTitle(title))
  }

  return roadmap
}

export function loadTasks() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === null) {
      const roadmap = createRoadmap()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap))
      window.localStorage.setItem(ROADMAP_CREATED_KEY, 'true')
      return roadmap
    }
    const tasks = JSON.parse(saved)
    const validTasks = Array.isArray(tasks) ? tasks : []
    const roadmapCreated = window.localStorage.getItem(ROADMAP_CREATED_KEY) === 'true'
    const hasUserTasks = validTasks.some((task) => !String(task.id || '').startsWith('starter-') && !String(task.id || '').startsWith('roadmap-'))

    if (!roadmapCreated && !hasUserTasks) {
      const roadmap = createRoadmap(validTasks)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap))
      window.localStorage.setItem(ROADMAP_CREATED_KEY, 'true')
      return roadmap
    }

    return validTasks
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    window.dispatchEvent(new CustomEvent(TASK_CHANGE_EVENT))
    return true
  } catch {
    return false
  }
}

export function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isOverdue(task, today) {
  return task.status !== 'completed' && task.dueDate && task.dueDate < today
}

export function sortTasks(tasks) {
  const today = new Date().toISOString().slice(0, 10)
  return [...tasks].sort((a, b) => {
    const criticalDifference = Number(b.priority === 'critical') - Number(a.priority === 'critical')
    if (criticalDifference) return criticalDifference
    const overdueDifference = Number(isOverdue(b, today)) - Number(isOverdue(a, today))
    if (overdueDifference) return overdueDifference
    const blockingDifference = Number(Boolean(b.isBlocking)) - Number(Boolean(a.isBlocking))
    if (blockingDifference) return blockingDifference
    const revenueDifference = Number(b.revenueImpact || 0) - Number(a.revenueImpact || 0)
    if (revenueDifference) return revenueDifference
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return String(a.createdAt).localeCompare(String(b.createdAt))
  })
}

export function getHighestPriorityOpenTasks(limit = 20) {
  return sortTasks(loadTasks().filter((task) => task.status !== 'completed')).slice(0, limit)
}

export function completeRoadmapTrackingTask(actionType) {
  const titleByAction = {
    'demo-site-opened': 'Improve demo site quality',
    'proposal-opened': 'Track proposal creation',
    'whatsapp-opened': 'Track WhatsApp sending',
  }
  const targetTitle = titleByAction[actionType]
  if (!targetTitle) return

  const tasks = loadTasks()
  const matchingTask = tasks.find((task) => task.title === targetTitle && task.status !== 'completed')
  if (!matchingTask) return
  const completedAt = new Date().toISOString()
  saveTasks(tasks.map((task) => task.id === matchingTask.id ? { ...task, priority: 'completed', status: 'completed', completedAt } : task))
}

export function subscribeToTaskChanges(callback) {
  function handleStorage(event) {
    if (event.key === STORAGE_KEY) callback()
  }
  window.addEventListener(TASK_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(TASK_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}
