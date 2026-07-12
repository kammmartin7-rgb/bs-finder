// Compact revenue-first decision tool for capturing and ranking business ideas.
import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { addIdea, deleteIdea, IDEA_OPTIONS, ideaPriorityLabel, loadIdeas, scoreIdea, subscribeToIdeas, updateIdea } from './ideasStorage'
import './IdeasVault.css'

const EMPTY_IDEA = { title: '', description: '', revenuePotential: 'medium', timeToRevenue: 'this-week', effort: 'medium', cost: 'low', status: 'new', nextAction: '' }

function OptionSelect({ field, value, onChange, t }) {
  return <select value={value} onChange={(event) => onChange(field, event.target.value)}>{IDEA_OPTIONS[field].map((option) => <option key={option} value={option}>{t(`ideaOption_${option}`)}</option>)}</select>
}

export default function IdeasVault() {
  const { t } = useLanguage()
  const [ideas, setIdeas] = useState(loadIdeas)
  const [draft, setDraft] = useState(EMPTY_IDEA)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => subscribeToIdeas(() => setIdeas(loadIdeas())), [])

  function change(field, value) { setDraft((current) => ({ ...current, [field]: value })) }
  function resetForm() { setDraft(EMPTY_IDEA); setEditingId(null) }
  function submit(event) {
    event.preventDefault()
    if (!draft.title.trim()) return
    setIdeas(editingId ? updateIdea(editingId, draft) : addIdea(draft))
    resetForm()
  }
  function edit(idea) { setEditingId(idea.id); setDraft({ ...EMPTY_IDEA, ...idea }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function remove(id) { if (window.confirm(t('ideaDeleteConfirm'))) { setIdeas(deleteIdea(id)); if (editingId === id) resetForm() } }

  return <section className="ideas-vault">
    <header className="ideas-vault__header"><div><span>Business OS</span><h1>{t('ideasVault')}</h1><p>{t('ideasVaultSubtitle')}</p></div><strong>{ideas.length} {t('ideasCount')}</strong></header>
    <form className="ideas-vault__form" onSubmit={submit}>
      <div className="ideas-vault__form-title"><h2>{editingId ? t('editIdea') : t('addIdea')}</h2>{editingId && <button type="button" onClick={resetForm}>{t('cancel')}</button>}</div>
      <label><span>{t('ideaTitle')}</span><input value={draft.title} onChange={(event) => change('title', event.target.value)} required /></label>
      <label className="is-wide"><span>{t('ideaDescription')}</span><textarea rows="2" value={draft.description} onChange={(event) => change('description', event.target.value)} /></label>
      <label><span>{t('ideaRevenuePotential')}</span><OptionSelect field="revenuePotential" value={draft.revenuePotential} onChange={change} t={t} /></label>
      <label><span>{t('ideaTimeToRevenue')}</span><OptionSelect field="timeToRevenue" value={draft.timeToRevenue} onChange={change} t={t} /></label>
      <label><span>{t('ideaEffort')}</span><OptionSelect field="effort" value={draft.effort} onChange={change} t={t} /></label>
      <label><span>{t('ideaCost')}</span><OptionSelect field="cost" value={draft.cost} onChange={change} t={t} /></label>
      <label><span>{t('ideaStatus')}</span><OptionSelect field="status" value={draft.status} onChange={change} t={t} /></label>
      <label className="is-wide"><span>{t('ideaNextAction')}</span><input value={draft.nextAction} onChange={(event) => change('nextAction', event.target.value)} /></label>
      <button className="ideas-vault__save" type="submit">{editingId ? t('saveChanges') : t('saveIdea')}</button>
    </form>
    <div className="ideas-vault__list">
      {ideas.map((idea) => <article key={idea.id} className={`idea-card label-${ideaPriorityLabel(idea)}`}>
        <header><div><span>{t(`ideaLabel_${ideaPriorityLabel(idea)}`)}</span><h2>{idea.title}</h2></div><strong>{scoreIdea(idea)}</strong></header>
        {idea.description && <p>{idea.description}</p>}
        <dl><div><dt>{t('ideaRevenuePotential')}</dt><dd>{t(`ideaOption_${idea.revenuePotential}`)}</dd></div><div><dt>{t('ideaTimeToRevenue')}</dt><dd>{t(`ideaOption_${idea.timeToRevenue}`)}</dd></div><div><dt>{t('ideaEffort')}</dt><dd>{t(`ideaOption_${idea.effort}`)}</dd></div><div><dt>{t('ideaCost')}</dt><dd>{t(`ideaOption_${idea.cost}`)}</dd></div></dl>
        <div className="idea-card__next"><span>{t('ideaNextAction')}</span><strong>{idea.nextAction || t('ideaNoNextAction')}</strong></div>
        <footer><label><span>{t('ideaStatus')}</span><OptionSelect field="status" value={idea.status} onChange={(_, value) => setIdeas(updateIdea(idea.id, { status: value }))} t={t} /></label><small>{new Date(idea.createdAt).toLocaleDateString()}</small><button type="button" onClick={() => edit(idea)}>{t('edit')}</button><button type="button" className="is-delete" onClick={() => remove(idea.id)}>{t('delete')}</button></footer>
      </article>)}
      {!ideas.length && <div className="ideas-vault__empty"><span>◇</span><h2>{t('ideasEmpty')}</h2><p>{t('ideasEmptyHelp')}</p></div>}
    </div>
  </section>
}

