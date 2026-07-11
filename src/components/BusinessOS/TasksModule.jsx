// Full local Tasks workspace with CRUD, completion, sorting, and filters.
import { useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { createTaskId, loadTasks, saveTasks, sortTasks, TASK_CATEGORIES } from './taskStorage'

const EMPTY_TASK = { title: '', description: '', project: '', category: '', priority: 'important', status: 'open', dueDate: '', assignee: '', revenueImpact: 0, isBlocking: false, notes: '' }

export default function TasksModule() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState(loadTasks)
  const [draft, setDraft] = useState(EMPTY_TASK)
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({ priority: 'all', project: 'all', status: 'active', category: 'all' })
  const [page, setPage] = useState(1)

  const options = useMemo(() => ({
    projects: [...new Set(tasks.map((task) => task.project).filter(Boolean))],
    categories: [...new Set(tasks.map((task) => task.category).filter(Boolean))],
  }), [tasks])

  const categoryCounts = useMemo(() => Object.fromEntries(TASK_CATEGORIES.map((category) => [category, tasks.filter((task) => task.category === category).length])), [tasks])
  const progress = useMemo(() => ({ all: tasks.length, open: tasks.filter((task) => task.status === 'open').length, 'in-progress': tasks.filter((task) => task.status === 'in-progress').length, blocked: tasks.filter((task) => task.status === 'blocked').length, completed: tasks.filter((task) => task.status === 'completed').length }), [tasks])

  const filteredTasks = useMemo(() => sortTasks(tasks.filter((task) => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.project !== 'all' && task.project !== filters.project) return false
    if (filters.category !== 'all' && task.category !== filters.category) return false
    if (filters.status === 'active' && task.status === 'completed') return false
    if (!['all', 'active'].includes(filters.status) && task.status !== filters.status) return false
    return true
  })), [filters, tasks])
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / 20))
  const visibleTasks = filteredTasks.slice((Math.min(page, totalPages) - 1) * 20, Math.min(page, totalPages) * 20)

  function updateFilters(nextFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  function persist(nextTasks) {
    setTasks(nextTasks)
    saveTasks(nextTasks)
  }

  function submitTask(event) {
    event.preventDefault()
    if (!draft.title.trim()) return
    const now = new Date().toISOString()
    if (editingId) {
      persist(tasks.map((task) => task.id === editingId ? { ...task, ...draft, completedAt: draft.status === 'completed' ? task.completedAt || now : '' } : task))
    } else {
      persist([...tasks, { ...draft, id: createTaskId(), createdAt: now, completedAt: draft.status === 'completed' ? now : '' }])
    }
    setDraft(EMPTY_TASK)
    setEditingId(null)
  }

  function editTask(task) {
    setEditingId(task.id)
    setDraft({ ...EMPTY_TASK, ...task })
  }

  function markComplete(task) {
    persist(tasks.map((item) => item.id === task.id ? { ...item, priority: 'completed', status: 'completed', completedAt: new Date().toISOString() } : item))
  }

  return (
    <section className="business-os__tasks-page">
      <header><div><span>Business OS</span><h1>{t('tasks')}</h1></div><strong>{tasks.length}</strong></header>
      <div className="business-os__task-progress">
        {['all', 'open', 'in-progress', 'blocked', 'completed'].map((status) => <button type="button" key={status} className={(status === 'all' ? filters.status === 'all' : filters.status === status) ? 'is-active' : ''} onClick={() => updateFilters({ ...filters, status: status === 'all' ? 'all' : status })}><strong>{progress[status]}</strong><span>{t(status === 'all' ? 'taskTotal' : `taskStatus_${status}`)}</span></button>)}
      </div>
      <nav className="business-os__task-categories" aria-label={t('taskCategory')}>
        <button type="button" className={filters.category === 'all' ? 'is-active' : ''} onClick={() => updateFilters({ ...filters, category: 'all' })}>{t('allTasks')} <strong>{tasks.length}</strong></button>
        {TASK_CATEGORIES.map((category) => <button type="button" key={category} className={filters.category === category ? 'is-active' : ''} onClick={() => updateFilters({ ...filters, category })}>{t(`category_${category.replaceAll(' ', '')}`)} <strong>{categoryCounts[category]}</strong></button>)}
      </nav>
      <div className="business-os__task-workspace">
        <form className="business-os__task-form" onSubmit={submitTask}>
          <h2>{t(editingId ? 'editTask' : 'addTask')}</h2>
          <label>{t('taskTitle')}<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label>
          <label>{t('taskDescription')}<textarea rows="2" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          <div className="business-os__task-form-grid">
            <label>{t('taskProject')}<input value={draft.project} onChange={(event) => setDraft({ ...draft, project: event.target.value })} /></label>
            <label>{t('taskCategory')}<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>
            <label>{t('taskPriority')}<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}><option value="critical">{t('taskCritical')}</option><option value="important">{t('taskImportant')}</option><option value="completed">{t('taskCompletedPriority')}</option></select></label>
            <label>{t('taskStatus')}<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}><option value="open">{t('taskOpen')}</option><option value="in-progress">{t('taskInProgress')}</option><option value="blocked">{t('taskBlocked')}</option><option value="completed">{t('taskCompleted')}</option></select></label>
            <label>{t('taskDueDate')}<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
            <label>{t('taskAssignee')}<input value={draft.assignee} onChange={(event) => setDraft({ ...draft, assignee: event.target.value })} /></label>
            <label>{t('taskRevenue')}<input type="number" min="0" value={draft.revenueImpact} onChange={(event) => setDraft({ ...draft, revenueImpact: Number(event.target.value) })} /></label>
            <label className="business-os__task-checkbox"><input type="checkbox" checked={draft.isBlocking} onChange={(event) => setDraft({ ...draft, isBlocking: event.target.checked })} />{t('taskBlocking')}</label>
          </div>
          <label>{t('taskNotes')}<textarea rows="2" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
          <div className="business-os__task-form-actions"><button type="submit">{t(editingId ? 'saveTask' : 'addTask')}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(EMPTY_TASK) }}>{t('cancel')}</button>}</div>
        </form>

        <div className="business-os__task-list-panel">
          <div className="business-os__task-filters">
            <select aria-label={t('taskPriority')} value={filters.priority} onChange={(event) => updateFilters({ ...filters, priority: event.target.value })}><option value="all">{t('allPriorities')}</option><option value="critical">{t('taskCritical')}</option><option value="important">{t('taskImportant')}</option><option value="completed">{t('taskCompletedPriority')}</option></select>
            <select aria-label={t('taskProject')} value={filters.project} onChange={(event) => updateFilters({ ...filters, project: event.target.value })}><option value="all">{t('allProjects')}</option>{options.projects.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label={t('taskStatus')} value={filters.status} onChange={(event) => updateFilters({ ...filters, status: event.target.value })}><option value="active">{t('activeTasks')}</option><option value="all">{t('allStatuses')}</option><option value="open">{t('taskOpen')}</option><option value="in-progress">{t('taskInProgress')}</option><option value="blocked">{t('taskBlocked')}</option><option value="completed">{t('taskCompleted')}</option></select>
            <select aria-label={t('taskCategory')} value={filters.category} onChange={(event) => updateFilters({ ...filters, category: event.target.value })}><option value="all">{t('allCategories')}</option>{options.categories.map((value) => <option key={value} value={value}>{t(`category_${value.replaceAll(' ', '')}`)}</option>)}</select>
          </div>
          <div className="business-os__task-list">
            {visibleTasks.map((task) => (
              <article key={task.id} className={`is-${task.status === 'completed' ? 'completed' : task.priority}`}>
                <div className="business-os__task-title"><span /><div><h3>{task.title}</h3><p>{task.description}</p></div></div>
                <div className="business-os__task-meta"><span>{task.project || '—'}</span><span>{task.category || '—'}</span><span>{t(`taskStatus_${task.status}`)}</span><span>{task.dueDate || '—'}</span><span>{task.assignee || '—'}</span><span>${Number(task.revenueImpact || 0).toLocaleString()}</span>{task.isBlocking && <strong>{t('taskBlocking')}</strong>}</div>
                <div className="business-os__task-actions"><button type="button" onClick={() => editTask(task)}>{t('editTask')}</button>{task.status !== 'completed' && <button type="button" onClick={() => markComplete(task)}>{t('markComplete')}</button>}<button type="button" onClick={() => persist(tasks.filter((item) => item.id !== task.id))}>{t('deleteTask')}</button></div>
                <small>{t('taskCreated')}: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'} · {t('taskCompletedDate')}: {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}{task.notes ? ` · ${task.notes}` : ''}</small>
              </article>
            ))}
          </div>
          <div className="business-os__task-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t('previousPage')}</button><span>{t('page')} {Math.min(page, totalPages)} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>{t('nextPage')}</button></div>
        </div>
      </div>
    </section>
  )
}
