// Visual project-status dashboard backed by static project facts and the existing Tasks storage.
import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { loadTasks, sortTasks, subscribeToTaskChanges } from '../BusinessOS/taskStorage'
import projectData, { getRelatedScreen, localizeTaskContent } from './projectData'
import './Projects.css'

const TABS = ['overview', 'nextTasks', 'modules', 'issues', 'documents']

function priorityClass(priority) {
  if (priority === 'critical') return 'red'
  if (priority === 'completed') return 'green'
  return 'orange'
}

export default function Projects({ onOpenScreen }) {
  const { language, t } = useLanguage()
  const [tasks, setTasks] = useState(loadTasks)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDocument, setSelectedDocument] = useState(projectData.documents[0])
  const [lastUpdated, setLastUpdated] = useState(projectData.lastUpdated)

  useEffect(() => subscribeToTaskChanges(() => setTasks(loadTasks())), [])

  const status = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 'completed').length
    const completedValue = tasks.reduce((total, task) => total + (task.status === 'completed' ? 1 : task.status === 'in-progress' ? 0.5 : 0), 0)
    const progress = tasks.length > 0 ? Math.round((completedValue / tasks.length) * 100) : 0
    const nextTasks = sortTasks(tasks.filter((task) => task.status !== 'completed')).slice(0, 10).map((task) => localizeTaskContent(task, language, t))
    return { progress, completedTasks, totalTasks: tasks.length, nextTasks, activeTask: nextTasks[0] || null }
  }, [language, t, tasks])

  function refreshStatus() {
    setTasks(loadTasks())
    setLastUpdated(new Date().toLocaleString())
  }

  return (
    <section className="projects-page">
      <header className="projects-header">
        <div><span>{projectData.name}</span><h1>{t('projectCommandCenter')}</h1><p>{t('projectCommandSubtitle')}</p><small>{t(projectData.statusKey)} · {t(projectData.phaseKey)}</small></div>
        <div className="projects-progress"><strong>{status.progress}%</strong><span>{status.completedTasks} / {status.totalTasks} {t('projectTasksCompleted')}</span><div><i style={{ width: `${status.progress}%` }} /></div></div>
        <div className="projects-updated"><span>{t('projectLastUpdated')}</span><strong>{lastUpdated}</strong><button type="button" onClick={refreshStatus}>{t('updateProjectStatus')}</button></div>
      </header>

      <nav className="projects-tabs" aria-label={t('projects')}>
        {TABS.map((tab) => <button type="button" key={tab} className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)}>{t(`projectTab_${tab}`)}</button>)}
      </nav>

      <div className="projects-content">
        {activeTab === 'overview' && (
          <div className="projects-overview">
            <article className="projects-active-task">
              <span>{t('projectCurrentTask')}</span>
              {status.activeTask ? <><div className="projects-active-title"><h2>{status.activeTask.title}</h2><strong className={`is-${priorityClass(status.activeTask.priority)}`}>{t(status.activeTask.priority === 'critical' ? 'taskCritical' : 'taskImportant')}</strong></div><p>{status.activeTask.description || t('projectNotAvailable')}</p><dl><div><dt>{t('taskRevenue')}</dt><dd>{status.activeTask.revenueImpact !== undefined && status.activeTask.revenueImpact !== '' ? `$${Number(status.activeTask.revenueImpact).toLocaleString()}` : t('projectNotAvailable')}</dd></div><div><dt>{t('taskBlocking')}</dt><dd>{status.activeTask.isBlocking === true ? t('projectYes') : status.activeTask.isBlocking === false ? t('projectNo') : t('projectNotAvailable')}</dd></div><div><dt>{t('taskAssignee')}</dt><dd>{status.activeTask.assignee || t('projectNotAvailable')}</dd></div></dl><button type="button" onClick={() => onOpenScreen(getRelatedScreen(status.activeTask))}>{t('openRelatedModule')}</button></> : <p>{t('projectNoActiveTask')}</p>}
            </article>
            <section className="projects-overview-list"><h2>{t('projectNextFive')}</h2><div className="projects-task-list">{status.nextTasks.slice(0, 5).map((task, index) => <article key={task.id}><strong>{index + 1}</strong><i className={`priority-${priorityClass(task.priority)}`} /><div><h3>{task.title}</h3><p>{task.category} · {t(`taskStatus_${task.status}`)}</p></div></article>)}</div></section>
            <section className="projects-overview-issues"><h2>{t('projectBlockingIssues')}</h2><ul className="projects-issues">{projectData.knownIssues.slice(0, 4).map((issue, index) => <li key={issue}><strong>{index + 1}</strong><span>{t(issue)}</span></li>)}</ul></section>
            <article className="projects-revenue"><span>{t('projectRevenueFlow')}</span><div>{projectData.revenueFlow.map((step, index) => <div key={step}><i>{index + 1}</i><strong>{t(`flow_${step.replaceAll(' ', '')}`)}</strong>{index < projectData.revenueFlow.length - 1 && <b>→</b>}</div>)}</div></article>
            <div className="projects-navigation"><button type="button" onClick={() => onOpenScreen('tasks')}>{t('openTasks')}</button><button type="button" onClick={() => onOpenScreen('bs-hunter')}>{t('openBsHunter')}</button><button type="button" onClick={() => onOpenScreen('crm')}>{t('openCrm')}</button><button type="button" onClick={() => onOpenScreen('websites-assets')}>{t('openWebsites')}</button></div>
          </div>
        )}

        {activeTab === 'nextTasks' && <div className="projects-task-list">{status.nextTasks.map((task, index) => <article key={task.id}><strong>{index + 1}</strong><i className={`priority-${priorityClass(task.priority)}`} /><div><h3>{task.title}</h3><p>{task.category} · {t(`taskStatus_${task.status}`)}</p></div><span>{t(task.priority === 'critical' ? 'taskCritical' : 'taskImportant')}</span></article>)}</div>}

        {activeTab === 'modules' && <div className="projects-modules"><section><h2>{t('projectCompletedModules')}</h2><div>{projectData.completedModules.map((module) => <article key={module}><span>✓</span><strong>{t(`module_${module.replaceAll(' ', '')}`)}</strong></article>)}</div></section><section><h2>{t('projectIncompleteModules')}</h2><div>{projectData.incompleteModules.map((module) => <article key={module} className="is-incomplete"><span>○</span><strong>{t(`module_${module.replaceAll(' ', '')}`)}</strong></article>)}</div></section></div>}

        {activeTab === 'issues' && <ul className="projects-issues">{projectData.knownIssues.map((issue, index) => <li key={issue}><strong>{index + 1}</strong><span>{t(issue)}</span></li>)}</ul>}

        {activeTab === 'documents' && <div className="projects-documents"><div>{projectData.documents.map((document) => <button type="button" key={document.name} className={selectedDocument.name === document.name ? 'is-active' : ''} onClick={() => setSelectedDocument(document)}><span>MD</span><strong>{document.name}</strong></button>)}</div><article><span>{t('projectDocumentPreview')}</span><h2>{selectedDocument.name}</h2><p>{t(selectedDocument.descriptionKey)}</p><small>{t('projectDocumentsReadOnly')}</small></article></div>}
      </div>
    </section>
  )
}
