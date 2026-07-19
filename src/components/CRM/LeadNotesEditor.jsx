// Inline CRM notes editor — append-only history reused across CRM surfaces.
import { useState } from 'react'
import { appendLeadNote, getLeadNotesHistory } from '../../services/leadNotesHistory'

export default function LeadNotesEditor({ view, copy = {}, onClose, onSaved, className = '' }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  function stop(event) {
    event.stopPropagation()
  }

  function save(event) {
    stop(event)
    if (!view?.leadId) return
    const trimmed = draft.trim()
    if (!trimmed) {
      setError(copy.noteRequired || 'יש להזין הערה.')
      return
    }

    const result = appendLeadNote(view.leadId, trimmed, view.crm)
    if (!result.ok) {
      setError(copy.noteSaveFailed || 'שמירת ההערה נכשלה.')
      return
    }

    setDraft('')
    setError('')
    onSaved?.(result)
    onClose?.()
  }

  function cancel(event) {
    stop(event)
    setDraft('')
    setError('')
    onClose?.()
  }

  const historyCount = getLeadNotesHistory(view?.crm).length

  return (
    <div className={`crm-lead-card__editor crm-lead-card__editor--append${className ? ` ${className}` : ''}`} onClick={stop}>
      {historyCount ? (
        <p className="crm-lead-card__editor-hint">{copy.appendOnlyNotes || 'הערות חדשות נוספות לסוף ההיסטוריה.'}</p>
      ) : null}
      <textarea
        rows="2"
        value={draft}
        placeholder={copy.addNote || copy.notesPlaceholder || copy.notes || ''}
        onChange={(event) => {
          setDraft(event.target.value)
          if (error) setError('')
        }}
        onClick={stop}
      />
      {error ? <p className="crm-lead-card__editor-error">{error}</p> : null}
      <div>
        <button type="button" onClick={save}>{copy.addNote || copy.save || 'הוספת הערה'}</button>
        {onClose ? <button type="button" onClick={cancel}>{copy.cancel || 'ביטול'}</button> : null}
      </div>
    </div>
  )
}
