import { buildLeadActivityTimeline } from './leadActivityTimelineUtils'

export default function LeadActivityTimeline({ view, copy = {}, emptyLabel = 'אין פעילות עדיין.' }) {
  const timeline = buildLeadActivityTimeline(view)

  return (
    <section className="lead-customer-file__section lead-customer-file__timeline" data-testid="lead-activity-timeline">
      <header><h3>{copy.activityTimeline || 'ציר פעילות'}</h3></header>
      {timeline.length ? (
        <ol className="lead-customer-file__timeline-list">
          {timeline.map((item) => (
            <li key={item.id} className={`lead-customer-file__timeline-item lead-customer-file__timeline-item--${item.kind}`}>
              <div className="lead-customer-file__timeline-main">
                <strong>{item.label}</strong>
                {item.text ? <p>{item.text}</p> : null}
              </div>
              <small>{item.date} · {item.time}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className="lead-customer-file__empty">{emptyLabel}</p>
      )}
    </section>
  )
}
