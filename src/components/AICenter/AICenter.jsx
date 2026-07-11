// Secure AI Center frontend. It communicates only with backend endpoints and never handles API keys.
import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { loadTasks, sortTasks } from '../BusinessOS/taskStorage'
import projectData from '../Projects/projectData'
import './AICenter.css'

const ACTIVITY_KEY = 'business-os-ai-activity'

function loadActivity() {
  try {
    const activity = JSON.parse(window.localStorage.getItem(ACTIVITY_KEY))
    return Array.isArray(activity) ? activity : []
  } catch {
    return []
  }
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || (import.meta.env.DEV ? '' : null)
}

export default function AICenter() {
  const { language, t } = useLanguage()
  const [connection, setConnection] = useState('not-connected')
  const [model, setModel] = useState('—')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [activity, setActivity] = useState(loadActivity)
  const [loading, setLoading] = useState(false)

  const projectContext = useMemo(() => {
    const tasks = loadTasks()
    const completedValue = tasks.reduce((total, task) => total + (task.status === 'completed' ? 1 : task.status === 'in-progress' ? 0.5 : 0), 0)
    const topTasks = sortTasks(tasks.filter((task) => task.status !== 'completed')).slice(0, 10)
    return {
      projectProgress: { percentage: tasks.length ? Math.round((completedValue / tasks.length) * 100) : 0, completedValue, totalTasks: tasks.length },
      activeTask: topTasks[0] ? { title: topTasks[0].title, category: topTasks[0].category, priority: topTasks[0].priority, status: topTasks[0].status } : null,
      topTasks: topTasks.map((task) => ({ title: task.title, category: task.category, priority: task.priority, status: task.status })),
      knownIssues: projectData.knownIssues.map((issue) => t(issue)),
    }
  }, [t])

  useEffect(() => {
    let active = true
    const apiBaseUrl = getApiBaseUrl()
    if (apiBaseUrl === null) return () => { active = false }
    fetch(`${apiBaseUrl}/api/ai/status`)
      .then(async (result) => {
        const data = await result.json().catch(() => ({}))
        if (!result.ok) throw new Error(data.error || data.message || 'Status unavailable')
        return data
      })
      .then((data) => {
        if (!active) return
        setConnection(data.configured ? 'connected' : 'not-connected')
        setModel(data.model || '—')
      })
      .catch(() => {
        if (active) setConnection('not-connected')
      })
    return () => { active = false }
  }, [])

  function addActivity(actionName, success) {
    const now = new Date()
    const nextActivity = [{ date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 8), actionName, success }, ...activity].slice(0, 30)
    setActivity(nextActivity)
    try {
      window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(nextActivity))
    } catch {
      // Activity logging is optional when browser storage is unavailable.
    }
  }

  async function callBackend(path, options = {}) {
    const apiBaseUrl = getApiBaseUrl()
    if (apiBaseUrl === null) throw new Error(t('aiBackendUnavailable'))
    const result = await fetch(`${apiBaseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, ...options })
    const data = await result.json().catch(() => ({}))
    if (!result.ok) throw new Error(data.error || data.message || t('aiRequestFailed'))
    return data
  }

  async function testConnection() {
    setLoading(true)
    setResponse('')
    try {
      const data = await callBackend('/api/ai/test')
      setConnection(data.connected ? 'connected' : 'not-connected')
      setModel(data.model || '—')
      setResponse(data.message || t('aiConnected'))
      addActivity('aiActionTestConnection', Boolean(data.connected))
    } catch (error) {
      setConnection('not-connected')
      setResponse(error.message)
      addActivity('aiActionTestConnection', false)
    } finally {
      setLoading(false)
    }
  }

  async function sendAIRequest(actionName, requestMessage, extraContext = {}) {
    if (!requestMessage.trim()) return
    setLoading(true)
    setResponse('')
    try {
      const data = await callBackend('/api/ai/chat', { body: JSON.stringify({ message: requestMessage.trim(), language, context: { ...projectContext, ...extraContext } }) })
      setConnection('connected')
      setModel(data.model || model)
      setResponse(data.text || t('aiEmptyResponse'))
      addActivity(actionName, true)
    } catch (error) {
      setConnection('not-connected')
      setResponse(error.message)
      addActivity(actionName, false)
    } finally {
      setLoading(false)
    }
  }

  function clearHistory() {
    setActivity([])
    try {
      window.localStorage.removeItem(ACTIVITY_KEY)
    } catch {
      // The in-memory history is still cleared.
    }
  }

  return (
    <section className="ai-center">
      <header><div><span>Business OS</span><h1>{t('aiCenter')}</h1><p>{t('aiCenterSubtitle')}</p></div><div className={`ai-center__status is-${connection}`}><i /><span>{t(connection === 'connected' ? 'aiConnected' : 'aiNotConnected')}</span><small>{t('aiSelectedModel')}: {model}</small></div><button type="button" onClick={testConnection} disabled={loading}>{t('aiTestConnection')}</button></header>

      <div className="ai-center__notice"><strong>{t('aiSecureBackend')}</strong><p>{t('aiBillingRequired')}</p></div>

      <div className="ai-center__workspace">
        <div className="ai-center__request">
          <div className="ai-center__quick-actions">
            <button type="button" disabled={loading} onClick={() => sendAIRequest('aiActionSummarizeProject', t('aiSummarizePrompt'))}>{t('aiSummarizeProject')}</button>
            <button type="button" disabled={loading} onClick={() => sendAIRequest('aiActionWhatNext', t('aiWhatNextPrompt'))}>{t('aiWhatNext')}</button>
            <button type="button" disabled={loading} onClick={() => sendAIRequest('aiActionFindBlockers', t('aiFindBlockersPrompt'))}>{t('aiFindBlockers')}</button>
            <button type="button" disabled={loading} onClick={() => sendAIRequest('aiActionPrioritizeTasks', t('aiPrioritizeTasksPrompt'))}>{t('aiPrioritizeTasks')}</button>
          </div>
          <label>{t('aiRequestInput')}<textarea maxLength="4000" rows="6" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('aiRequestPlaceholder')} /></label>
          <button type="button" disabled={loading || !message.trim()} onClick={() => sendAIRequest('aiActionRequest', message)}>{loading ? t('aiSending') : t('aiSend')}</button>
        </div>
        <article className="ai-center__response"><span>{t('aiResponse')}</span><div>{response || t('aiResponsePlaceholder')}</div></article>
        <aside className="ai-center__activity"><header><h2>{t('aiRecentActivity')}</h2><button type="button" onClick={clearHistory} disabled={activity.length === 0}>{t('aiClearHistory')}</button></header><div>{activity.length ? activity.map((item, index) => <article key={`${item.date}-${item.time}-${index}`}><i className={item.success ? 'is-success' : 'is-failure'} /><div><strong>{t(item.actionName)}</strong><small>{item.date} · {item.time}</small></div><span>{t(item.success ? 'aiSuccess' : 'aiFailure')}</span></article>) : <p>{t('aiNoActivity')}</p>}</div></aside>
      </div>
    </section>
  )
}
