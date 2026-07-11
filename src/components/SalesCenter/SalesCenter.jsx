// Presents reusable outreach copy for one lead and provides clipboard actions.
// It has no knowledge of application routing, payments, search, or AI services.

import { useMemo, useState } from 'react'
import createSalesContent, { normalizeSalesLead } from './prompts'
import './SalesCenter.css'

function CopyButton({ text, copyId, copiedId, onCopy }) {
  return (
    <button
      type="button"
      className="sales-center__copy"
      onClick={() => onCopy(text, copyId)}
    >
      {copiedId === copyId ? 'Copied!' : 'Copy'}
    </button>
  )
}

function MessageCard({ title, label, text, copyId, copiedId, onCopy }) {
  return (
    <section className="sales-center__card">
      <div className="sales-center__card-header">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
        <CopyButton text={text} copyId={copyId} copiedId={copiedId} onCopy={onCopy} />
      </div>
      <pre>{text}</pre>
    </section>
  )
}

export function SalesCenter({ lead }) {
  const [copiedId, setCopiedId] = useState('')
  const normalizedLead = useMemo(() => normalizeSalesLead(lead), [lead])
  const content = useMemo(() => createSalesContent(lead), [lead])

  async function handleCopy(text, copyId) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(copyId)
      window.setTimeout(() => setCopiedId(''), 1800)
    } catch {
      setCopiedId('')
    }
  }

  return (
    <div className="sales-center">
      <header className="sales-center__hero">
        <span>BS Hunter Sales Center</span>
        <h1>Outreach for {normalizedLead.businessName}</h1>
        <p>Ready-to-use conversation starters personalized with available lead details.</p>
      </header>

      <div className="sales-center__content">
        <MessageCard title="Phone Opening Script" label="Phone" text={content.phoneScript} copyId="phone" copiedId={copiedId} onCopy={handleCopy} />
        <MessageCard title="WhatsApp Message" label="Message" text={content.whatsappMessage} copyId="whatsapp" copiedId={copiedId} onCopy={handleCopy} />
        <MessageCard title="Email Template" label="Email" text={content.emailTemplate} copyId="email" copiedId={copiedId} onCopy={handleCopy} />

        <section className="sales-center__card">
          <div className="sales-center__card-header">
            <div><span>Conversation guide</span><h2>Common Objections</h2></div>
            <CopyButton
              text={content.objections.map(({ objection, response }) => `${objection}\n${response}`).join('\n\n')}
              copyId="objections"
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          </div>
          <div className="sales-center__objections">
            {content.objections.map(({ objection, response }, index) => (
              <article key={objection}>
                <div><h3>{objection}</h3><p>{response}</p></div>
                <CopyButton text={`${objection}\n${response}`} copyId={`objection-${index}`} copiedId={copiedId} onCopy={handleCopy} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SalesCenter
