// Public-facing hash route for portable demo links and missing-demo errors.
import WebsiteBuilder from './WebsiteBuilder'
import './ShareableDemo.css'

export default function ShareableDemo({ route }) {
  if (!route?.record?.business) return <main className="share-demo-error"><div><span>BS Finder</span><h1>Demo not found</h1><p>This demo link is missing, invalid, or no longer available. Ask the sender for a new link.</p><a href={`${window.location.pathname}${window.location.search}`}>Return to BS Finder</a></div></main>
  return <div className="share-demo-page"><WebsiteBuilder business={route.record.business} /></div>
}
