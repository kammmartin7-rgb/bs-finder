// Renders the complete one-page website model produced by the builder engine.
// The component remains data-driven and independent from BS Hunter navigation and state.

import { useMemo, useState } from 'react'
import { imageSource } from '../RealWebsiteBuilder/imageProcessing'
import { loadLeadMediaLibrary } from '../RealWebsiteBuilder/realWebsiteStorage'
import { createIsraeliWhatsAppUrl } from '../../services/whatsapp'
import generateWebsite from './generator'
import './WebsiteBuilder.css'
import './websiteDesignTokens.css'

function Actions({ phone, mapsUrl, ui }) {
  const whatsappUrl = createIsraeliWhatsAppUrl(phone)

  return (
    <div className="website-builder__actions">
      {whatsappUrl && (
        <a className="website-builder__button website-builder__button--whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          {ui.whatsapp}
        </a>
      )}
      {phone && <a className="website-builder__button" href={`tel:${phone}`}>{ui.call}</a>}
      {mapsUrl && <a className="website-builder__button website-builder__button--outline" href={mapsUrl} target="_blank" rel="noreferrer">{ui.directions}</a>}
    </div>
  )
}

function ContactForm({ phone, businessName, ui }) {
  const [details, setDetails] = useState({ name: '', message: '' })
  const whatsappUrl = createIsraeliWhatsAppUrl(phone)
  function submit(event) {
    event.preventDefault()
    if (!whatsappUrl) return
    const message = ui === undefined || ui.name === 'Your name' ? `Hi ${businessName}, my name is ${details.name || 'a customer'}. ${details.message || 'I would like more information.'}` : `שלום ${businessName}, שמי ${details.name || 'לקוח/ה'}. ${details.message || 'אשמח לקבל מידע נוסף.'}`
    window.open(`${whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }
  return <form className="website-builder__form" onSubmit={submit}><label>{ui.name}<input value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} required /></label><label>{ui.help}<textarea rows="4" value={details.message} onChange={(event) => setDetails({ ...details, message: event.target.value })} required /></label><button type="submit" disabled={!whatsappUrl}>{ui.send}</button>{!whatsappUrl && <small>{ui.unavailable}</small>}</form>
}

function heroBackgroundPosition(width, height) {
  const ratio = Number(width) / Number(height)
  return Number.isFinite(ratio) && ratio < 1 ? 'center top' : 'center center'
}

function HeroSection({ section, business }) {
  const { content } = section
  const hasImage = Boolean(content.heroImageUrl)
  const [backgroundPosition, setBackgroundPosition] = useState(() => heroBackgroundPosition(content.heroImageWidth, content.heroImageHeight))
  const heroStyle = hasImage ? { backgroundImage: `url(${JSON.stringify(content.heroImageUrl)})`, backgroundPosition } : undefined
  function inspectImage(event) {
    setBackgroundPosition(heroBackgroundPosition(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))
  }
  return (
    <section className={`website-builder__hero ${hasImage ? 'website-builder__hero--image' : 'website-builder__hero--default'}`} style={heroStyle}>
      {hasImage && <img className="website-builder__hero-image-probe" src={content.heroImageUrl} alt="" aria-hidden="true" onLoad={inspectImage} />}
      <div className="website-builder__hero-overlay" aria-hidden="true" />
      <div className="website-builder__hero-glow" />
      <div className="website-builder__hero-grid" aria-hidden="true" />
      <div className="website-builder__container website-builder__hero-content">
        <div className="website-builder__hero-copy"><span className="website-builder__eyebrow">{content.eyebrow}</span><p className="website-builder__business-name">{content.title}</p><h1>{content.headline}</h1><p className="website-builder__lead">{content.text}</p>{content.rating && <p className="website-builder__rating">★★★★★ <span>{content.rating.toFixed(1)}{content.reviewsCount ? ` · ${content.reviewsCount}` : ''}</span></p>}<div className="website-builder__hero-actions"><a className="website-builder__button" href={content.primaryAction.href}>{content.primaryAction.label}</a><a className="website-builder__button website-builder__button--outline" href={content.secondaryAction.href}>{content.secondaryAction.label}</a></div></div>
        <div className="website-builder__hero-contact">
          <span className="website-builder__eyebrow">{content.ui.contactEye}</span>
          <h2>{content.ui.contact(content.title)}</h2>
          <p>{content.ui.contactText}</p>
          <ContactForm phone={business.phone} businessName={content.title} ui={content.ui} />
        </div>
      </div>
    </section>
  )
}

function Section({ section, business }) {
  const { content, type } = section

  if (type === 'hero') return <HeroSection section={section} business={business} />

  if (type === 'features') {
    return (
      <section id={section.id === 'services' ? 'services' : undefined} className={`website-builder__section ${section.id === 'why-us' ? 'website-builder__section--tinted' : ''}`}>
        <div className="website-builder__container">
          <span className="website-builder__eyebrow">{content.eyebrow}</span>
          <h2>{content.heading}</h2>
          <p className="website-builder__intro">{content.intro}</p>
          <div className="website-builder__grid">
            {content.items.map((item) => <article key={item.title}><span className="website-builder__card-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </div>
      </section>
    )
  }

  if (type === 'testimonials') {
    return (
      <section className="website-builder__section website-builder__reviews">
        <div className="website-builder__container">
          <span className="website-builder__eyebrow">{content.eyebrow}</span>
          <h2>{content.heading}</h2>
          <div className="website-builder__review-card"><strong>{content.rating ? content.rating.toFixed(1) : '—'}</strong><div><p className="website-builder__review-summary">★★★★★</p><span>{content.summary}</span>{content.mapsUrl && <a href={content.mapsUrl} target="_blank" rel="noreferrer">{content.viewReviews} ↗</a>}</div></div>
        </div>
      </section>
    )
  }

  if (type === 'service-areas') return <section className="website-builder__section website-builder__areas"><div className="website-builder__container"><span className="website-builder__eyebrow">{content.eyebrow}</span><h2>{content.heading}</h2><p className="website-builder__intro">{content.text}</p><div>{content.areas.map((area) => <span key={area}>⌖ {area}</span>)}</div></div></section>

  if (type === 'faq') return <section className="website-builder__section website-builder__faq"><div className="website-builder__container"><span className="website-builder__eyebrow">{content.eyebrow}</span><h2>{content.heading}</h2><div>{content.items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

  if (type === 'contact') {
    return (
      <section id="contact" className="website-builder__section website-builder__contact">
        <div className="website-builder__container website-builder__contact-card">
          <div><span className="website-builder__eyebrow">{content.eyebrow}</span><h2>{content.heading}</h2><p>{content.text}</p></div>
          <div className="website-builder__contact-details">{content.phone && <p><strong>{content.ui.phone}</strong><span dir="ltr">{content.phone}</span></p>}{content.address && <p><strong>{content.ui.visit}</strong><span>{content.address}</span></p>}{content.website && <p><strong>{content.ui.online}</strong><span dir="ltr">{content.website}</span></p>}</div>
          <Actions phone={content.phone} mapsUrl={content.mapsUrl} ui={content.ui} /><ContactForm phone={content.phone} businessName={content.businessName} ui={content.ui} />
        </div>
      </section>
    )
  }

  if (type === 'footer') {
    return <footer className="website-builder__footer"><div className="website-builder__container"><strong>{content.businessName}</strong><span>{content.tagline}</span><small>© {new Date().getFullYear()} {content.businessName}. {content.rights}</small></div></footer>
  }

  return <section className="website-builder__section website-builder__about"><div className="website-builder__container"><span className="website-builder__eyebrow">{content.eyebrow}</span><h2>{content.heading}</h2><p className="website-builder__lead">{content.text}</p><strong className="website-builder__highlight">{content.highlight}</strong></div></section>
}

export function WebsiteBuilder({ business, templateId, sectionIds, contentOverrides = {} }) {
  const libraryOverrides = useMemo(() => {
    const savedDemoImage = business.demoHeroImageMode === 'default' ? null : business.demoHeroImage
    if (savedDemoImage?.dataUrl) return { hero: { heroImageUrl: imageSource(savedDemoImage), heroImageWidth: savedDemoImage.width, heroImageHeight: savedDemoImage.height } }
    if (business.demoHeroImageMode) return {}
    const items = loadLeadMediaLibrary(business)
    if (!items.length) return {}
    const hero = items.find((item) => item.category === 'hero') || items[0]
    const gallery = items.filter((item) => item.category === 'gallery').map(imageSource).filter(Boolean)
    const overrides = {}
    if (hero) overrides.hero = { heroImageUrl: imageSource(hero), heroImageWidth: hero.width, heroImageHeight: hero.height }
    if (gallery.length) overrides.about = { galleryImageUrls: gallery }
    return overrides
  }, [business])
  const website = generateWebsite({ business, templateId, sectionIds, contentOverrides: { ...libraryOverrides, ...contentOverrides }, language: 'he' })
  const theme = website.template.theme
  const style = { '--builder-background': theme.background, '--builder-surface': theme.surface, '--builder-text': theme.text, '--builder-muted-text': theme.mutedText, '--builder-primary': theme.primary, '--builder-accent': theme.accent, '--builder-font-family': theme.fontFamily }

  const phone = website.business.phone
  const whatsappUrl = createIsraeliWhatsAppUrl(phone)
  const ui = website.sections.find((section) => section.id === 'hero')?.content.ui
  return <div className="website-builder" dir="rtl" lang="he" style={style} data-template={website.template.id}><header className="website-builder__header"><a href="#top" className="website-builder__brand"><span>{website.business.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()}</span><strong>{website.business.name}</strong></a><nav><a href="#services">{ui.servicesNav}</a><a href="#contact">{ui.contactNav}</a></nav>{phone && <a className="website-builder__header-call" href={`tel:${phone}`}>{ui.call}</a>}</header><main id="top">{website.sections.map((section) => <Section key={section.id} section={section} business={website.business} />)}</main>{phone && <div className="website-builder__sticky"><a href={`tel:${phone}`}>☎ {ui.call}</a>{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{ui.whatsapp}</a>}</div>}</div>
}

export default WebsiteBuilder
