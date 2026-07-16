// Public-facing hash route for portable demo links and missing-demo errors.
import { useEffect, useState } from 'react'
import WebsiteBuilder from './WebsiteBuilder'
import { loadPublicDemo } from './demoStorage'
import './ShareableDemo.css'

export default function ShareableDemo({ route }) {
  const [record, setRecord] = useState(route?.record || null)
  const [loading, setLoading] = useState(Boolean(route?.remote && !route?.record))

  useEffect(() => {
    if (!route?.remote) return undefined
    let active = true
    loadPublicDemo(route.id).then((loaded) => {
      if (active) setRecord(loaded)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [route?.id, route?.remote])

  if (loading) return null
  if (!record?.business) return <main className="share-demo-error" dir="rtl" lang="he"><div><span>אתר הדגמה</span><h1>הדמו לא נמצא</h1><p>קישור הדמו חסר, אינו תקין או אינו זמין עוד. בקשו מהשולח קישור חדש.</p><a href={`${window.location.pathname}${window.location.search}`}>חזרה למערכת</a></div></main>
  return <div className="share-demo-page"><WebsiteBuilder business={record.business} /></div>
}
