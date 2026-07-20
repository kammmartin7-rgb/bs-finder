const PAYMENT_OPTIONS = [
  ['bankTransfer', 'bankTransfer'],
  ['creditCard', 'creditCard'],
  ['bit', 'bit'],
  ['payBox', 'payBox'],
  ['cash', 'cash'],
  ['check', 'check'],
  ['installments', 'installments'],
]

function selectedOptions(draft) {
  return Array.isArray(draft.paymentOptions) ? draft.paymentOptions : []
}

export function ProposalPaymentOptionsEditor({ draft, copy, onChange }) {
  const selected = selectedOptions(draft)

  function toggleOption(optionId) {
    const nextOptions = selected.includes(optionId)
      ? selected.filter((item) => item !== optionId)
      : [...selected, optionId]
    onChange('paymentOptions', nextOptions)
  }

  return (
    <fieldset className="proposal-payment-editor">
      <legend>{copy.paymentOptionsTitle}</legend>
      <div className="proposal-payment-editor__options">
        {PAYMENT_OPTIONS.map(([optionId, labelKey]) => (
          <label key={optionId}>
            <input type="checkbox" checked={selected.includes(optionId)} onChange={() => toggleOption(optionId)} />
            <span>{copy[labelKey]}</span>
          </label>
        ))}
      </div>

      {selected.includes('installments') ? (
        <div className="proposal-payment-editor__installments">
          <label>{copy.installmentCount}<input type="number" min="2" value={draft.installmentCount || ''} onChange={(event) => onChange('installmentCount', event.target.value)} /></label>
          <label>{copy.firstPayment}<input type="text" value={draft.firstPayment || ''} onChange={(event) => onChange('firstPayment', event.target.value)} /></label>
          <label>{copy.paymentStartDate}<input type="date" value={draft.paymentStartDate || ''} onChange={(event) => onChange('paymentStartDate', event.target.value)} /></label>
        </div>
      ) : null}

      <label className="proposal-payment-editor__notes">
        {copy.paymentNotes}
        <textarea rows="4" value={draft.paymentNotes || ''} onChange={(event) => onChange('paymentNotes', event.target.value)} placeholder={copy.paymentNotesPlaceholder} />
      </label>
    </fieldset>
  )
}

export function ProposalPaymentOptionsPreview({ draft, copy, language }) {
  const selected = selectedOptions(draft)
  const hasInstallments = selected.includes('installments')
  const startDate = draft.paymentStartDate
    ? new Date(`${draft.paymentStartDate}T00:00:00`).toLocaleDateString(language)
    : ''

  return (
    <section className="proposal-section proposal-payment-preview">
      <header><span>04</span><h2>{copy.paymentOptionsTitle}</h2></header>
      {selected.length ? (
        <ul className="proposal-payment-preview__methods">
          {selected.map((optionId) => <li key={optionId}>✓ {copy[optionId]}</li>)}
        </ul>
      ) : <p className="proposal-payment-preview__empty">{copy.noPaymentOptions}</p>}

      {hasInstallments && (draft.installmentCount || draft.firstPayment || startDate) ? (
        <dl className="proposal-payment-preview__details">
          {draft.installmentCount ? <div><dt>{copy.installmentCount}</dt><dd>{draft.installmentCount}</dd></div> : null}
          {draft.firstPayment ? <div><dt>{copy.firstPayment}</dt><dd>{draft.firstPayment}</dd></div> : null}
          {startDate ? <div><dt>{copy.paymentStartDate}</dt><dd>{startDate}</dd></div> : null}
        </dl>
      ) : null}

      {draft.paymentNotes ? <p className="proposal-payment-preview__notes"><strong>{copy.paymentNotes}:</strong> {draft.paymentNotes}</p> : null}
    </section>
  )
}
