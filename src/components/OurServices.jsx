import './OurServices.css'

const SERVICES = [
  ['בניית אתרים', 'אתרים מקצועיים שמביאים פניות'], ['דפי נחיתה', 'עמודי נחיתה ממוקדים להמרות'], ['אוטומציות לעסקים', 'חיסכון בזמן עם תהליכים חכמים'], ['CRM וניהול לידים', 'סדר, מעקב ושליטה במכירות'], ['פתרונות AI ובוטים', 'כלים חכמים לשירות ולצמיחה'], ['קידום בגוגל', 'נראות טובה יותר במנועי חיפוש'], ['ניהול רשתות חברתיות', 'תוכן ונוכחות עקבית ברשת'], ['מיתוג ועיצוב', 'שפה ויזואלית שמבדלת את העסק'],
]

export default function OurServices({ onQuote, onWhatsApp }) {
  return <section className="our-services" dir="rtl" aria-labelledby="our-services-title">
    <header><span>GrowthPilot</span><h2 id="our-services-title">השירותים שלנו</h2></header>
    <div className="our-services__grid">{SERVICES.map(([name, description, startingPrice]) => <article key={name} className="our-services__card"><h3>{name}</h3><p>{description}</p>{startingPrice && <small>החל מ־₪{startingPrice.toLocaleString()}</small>}<div><button type="button" onClick={() => onQuote({ name, startingPrice })}>קבל הצעת מחיר</button><button type="button" className="our-services__whatsapp" onClick={() => onWhatsApp({ name })}>WhatsApp</button></div></article>)}</div>
  </section>
}
