// Compact dashboard view of the highest-priority open tasks from the Tasks module.
import { useLanguage } from '../../context/LanguageContext'

export default function MissionControl({ tasks, maxTasks, onAction, onOpenHunter }) {
  const { t } = useLanguage()
  const visibleTasks = maxTasks ? tasks.slice(0, maxTasks) : tasks

  return (
    <section className="business-os__mission">
      <div className="business-os__mission-header">
        <div><span>{t('missionTodayLabel')}</span><h2>{t('missionControl')}</h2></div>
        <div className="business-os__mission-header-actions"><strong>{visibleTasks.length}</strong><button type="button" onClick={onOpenHunter}>{t('openBsHunter')}</button></div>
      </div>
      {visibleTasks.length > 0 ? (
        <div className="business-os__mission-grid">
          {visibleTasks.map((task) => (
            <article key={task.id} className={`is-${task.priority === 'critical' ? 'red' : task.priority === 'completed' ? 'green' : 'orange'}`}>
              <span className="business-os__mission-dot" aria-hidden="true" />
              <div><h3>{task.title}</h3><p>{task.description || `${t('taskDueDate')}: ${task.dueDate || '—'}`}</p></div>
              <button type="button" onClick={() => onAction(task)}>{t('openTasks')}</button>
            </article>
          ))}
        </div>
      ) : <p className="business-os__mission-empty">{t('missionAllClear')}</p>}
    </section>
  )
}
