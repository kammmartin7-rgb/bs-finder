// Public-facing /demo/:id route with legacy hash-link compatibility.
import { useEffect, useState } from 'react'
import WebsiteBuilder from './WebsiteBuilder'
import { createDemoOpenUrl, loadPublicDemo } from './demoStorage'
import './ShareableDemo.css'

export default function ShareableDemo({ route }) {
  const [record, setRecord] = useState(route?.record || null)
  const [loading, setLoading] = useState(Boolean((route?.remote && !route?.record) || route?.legacyRedirect))

  useEffect(() => {
    let active = true

    async function loadDemo() {
      if (route?.record && !route?.remote) {
        if (route.legacyRedirect && active) {
          window.history.replaceState(null, '', createDemoOpenUrl(route.record))
        }
        return
      }

      const loaded = await loadPublicDemo(route.id)
      if (!active) return
      setRecord(loaded)
      if (route?.legacyRedirect && loaded) {
        window.history.replaceState(null, '', createDemoOpenUrl(loaded))
      }
    }

    loadDemo().finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [route?.id, route?.legacyRedirect, route?.record, route?.remote])

  if (loading) return null
  if (!record?.business) return <main className="share-demo-error" dir="rtl" lang="he"><div><span>אתר הדגמה</span><h1>הדמו לא נמצא</h1><p>קישור הדמו חסר, אינו תקין או אינו זמין עוד. בקשו מהשולח קישור חדש.</p><a href="/">חזרה למערכת</a></div></main>
  return <div className="share-demo-page"><WebsiteBuilder business={record.business} /></div>
}
