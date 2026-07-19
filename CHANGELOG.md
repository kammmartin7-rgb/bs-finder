# Changelog

Exact completion dates for earlier work are not available. Verified existing work is recorded under **Unreleased**.

## Unreleased

### Added

- BOS-028 lead persistence E2E script (`scripts/verify-lead-e2e.mjs`): 12 Playwright checks against the running dev server — existing lead count, manual create, duplicate phone block, pipeline-card edit, stage selector, drag-and-drop, browser refresh, dev-server restart, count non-decrease, and canonical `bs-hunter-real-leads` persistence; does not wipe existing leads.
- Sales page **מרכז פעולות מכירה** (`SalesActionCenter.jsx`, `data-testid="sales-action-center"`) with six categories: חייב טיפול עכשיו, התקשר עכשיו, שלח WhatsApp, פתח דמו, מוכן להצעת מחיר, נסגרה עסקה — single-pass `getSalesActionCenterData` selector.
- Sales page **Requires Attention**, **פעולות דחופות**, and **מרכז מעקבים** now read real lead sales-tracking fields (`salesStatus`, `nextAction`, `nextActionDate`, `lastContactAt`) via `salesTrackingSelectors.js`; empty states explain why no leads match with live counts.
- Lead model sales tracking fields on every real lead record: `messageVersion`, `messageSentAt`, `demoOpenCount`, `firstDemoOpenAt`, `lastDemoOpenAt`, `lastContactAt`, `nextAction`, `nextActionDate`, and `salesStatus` (`new`, `message_sent`, `demo_opened`, `in_call`, `proposal_sent`, `follow_up`, `won`, `lost`). Existing leads receive defaults via `enrichLeadSalesTracking` on load and a one-time migration key `bs-hunter-lead-sales-tracking-migration-v1`.
- LeadEditForm (Edit Lead dialog from Sales Pipeline): bordered **Sales Tracking** fieldset (`data-testid="lead-sales-tracking"`) directly above Notes; pipeline card click opens this dialog.

### Fixed

- Sales/CRM interaction slowness: cached `loadPersistedLeads`, CRM records, and lead-action history; removed full lead reload on screen change, window focus, lead-action events, and CRM mount; CRM-only stage updates no longer rewrite the entire lead array; Sales command data computed in one pass; pipeline cards memoized and demo lookups deferred until click.

### Changed

- Sales Screen Cleanup Audit: removed daily mission goals, duplicate urgent actions list, CRM revenue summary, redundant header search/stage/sort toolbar, and standalone follow-up section; dashboard deep-links scroll to the action center; pipeline filter/sort popover remains the sole pipeline filter UI.
- Sales Action Center replaces **מרכז פיקוד מכירות** / **דורש טיפול עכשיו** / **מרכז מעקבים** with one category-filtered action queue above the pipeline.
- Lead edit cleanup: removed unreachable legacy full CRM lead-card edit UI; pipeline cards renamed to `PipelineLeadCard`; Sales and CRM both open the same `LeadEditForm`; **Manage Images** moved to the edit dialog footer.
- CRM pipeline filter UI: replaced category and import-batch chip rows with one compact Hebrew RTL `סינון ומיון` popover (presets, category/city/batch dropdowns, sort, result counter, reset, active indicator).
- CRM import batch filtering: shared Apify batch object per search (`batchId`, `batchLabel`, `businessType`, `city`, `country`, `importedAt`, `importedDate`, `source: Apify`); legacy leads migrate in place with `legacyBatch: true` and derived `batchLabel`; compact batch tag on cards.
- CRM pipeline category filtering: Hebrew filter bar above the pipeline with live counts; display-only (mission, urgent, revenue, and follow-up sections stay unfiltered).
- Existing leads migrate in place on load: `businessType` derived from `category`, `searchBusinessType`, `batchLabel`, and related fields without deleting or duplicating records.
- Apify lead import metadata now saves `businessType`, `city`, `country`, `importedAt`, and `batchLabel` (`<businessType> — <city> — <DD/MM/YYYY>`) via existing `attachSearchMetadata`.
- Demo persistence now saves complete records to the existing Supabase `demos` table and generates 8-character `/#/demo/<id>` links without embedded JSON or base64; public routes load from Supabase, localStorage remains a cache/legacy fallback, and old `?data=` links continue to parse.
- Sales Pipeline Send Demo message now uses the approved concise Hebrew copy, contains no emojis, and keeps the existing demo URL and pre-filled WhatsApp flow.
- Demo Website hero: selected per-lead business images now fill the existing hero with `cover`, layered dark readability gradients, responsive portrait positioning, right-aligned Hebrew copy and CTA controls, and the existing WhatsApp contact form in a glass panel; the no-image blue gradient fallback remains.
- Business OS navigation cleanup: 10-item sidebar (Dashboard, Businesses, Sales, Finance, Tasks, AI Center, Documents, Users & Permissions, Integrations, Settings). Projects, Websites & Assets, Ideas Vault, and Development removed from top-level sidebar but preserved via business hubs, dashboard links, deep routes, or Settings.
- Sales added as a main Business OS navigation tab; opens the existing shared CRM & Sales Pipeline (`crm` screen) with no duplicate CRM or pipeline.
- CRM & Sales Pipeline merged label and route: one workspace for pipeline stages, lead cards, manual entry, and Google Maps import.
- Sales Pipeline layout: two fixed-height rows (primary 420px / secondary 270px); lead lists scroll inside each stage column; column headers and footers stay fixed.
- Pipeline lead cards: content-driven dynamic height; always show business name, phone, and compact stage selector; optional category, source, rating, website, and address only when present; click opens existing LeadEditForm; drag-and-drop and selector share `updateLeadStage`.
- Dashboard trimmed to compact actionable metrics and quick navigation; Ideas Vault linked from dashboard; Development Console linked from Settings.
- Finance and Documents exposed as top-level navigation hubs using existing data and document panels.
- Business OS migration step 1: Businesses hub shows BS Finder and BS Funds cards; sidebar highlights Businesses when BS Finder/BS Funds nested routes are open; Sales highlights when CRM is open.

### Fixed

- Shareable demo freeze: selected base64 hero images remain in the existing LeadID demo record but are no longer duplicated into View Demo / Send Demo URLs; oversized legacy route payloads are ignored in favor of the saved record, preventing multi-megabyte hash parsing from blocking the browser.
- Sales Pipeline phone action: clicking a pipeline lead phone number or CRM call action opens WhatsApp in a new tab through `https://wa.me/`; Israeli numbers with or without a leading zero normalize to country code `972`. Removed the remaining CRM `tel:` handler that caused Chrome to offer FaceTime.
- Sales Pipeline stage movement: every pipeline lead card has a compact stage selector backed by existing `CRM_STAGES`; selector and drag-and-drop call shared `updateLeadStage` → `onUpdateLead` / `updatePersistedLead`; stage changes move cards immediately and persist across refresh. CRM (`bs-hunter-crm:{leadId}`), action history, proposals (`bs-finder-proposal:{leadId}`), demos (`bs-finder-demo:lead-{leadId}`), media (`…:lead-{leadId}`), and real website projects (`project.leadId`) now join only on `lead.id`; legacy business-name / CRM-key / hash demo data migrates on load via `leadRelationMigration.js`.
- Lead persistence: one canonical store (`bs-hunter-real-leads` / `leadPersistence.js`) with legacy migration, stable IDs, change notifications, demo-table isolation, and dev verification helpers (`__bsHunterVerifyLeadPersistence`).
- CRM/Sales Pipeline regression: pipeline empty state restored to distinguish “no persisted leads” vs active filters; CRM reloads `bs-hunter-real-leads` on mount; sidebar CRM/Sales clears stale navigation filters; Sales default navigation memoized to avoid effect churn.
- Lead Search and Apify workflow: improved Apify field mapping (name, phone, website, address, placeId, category), duplicate upsert on repeat search, demo/real separation in UI/stats/export/persistence, clearer missing-token and network errors, and localhost CORS for dev ports beyond 5173.
- Lead status pipeline access: Sales sidebar and BS Finder Sales card route to the existing CRM pipeline; dashboard Lead pipeline card scrolls to the pipeline section.
- Lead-to-pipeline flow: saved search/import/manual leads auto-create CRM records at stage `new`; CRM reloads persisted leads when opened; dashboard counters align with CRM V2 stages.
- CRM manual lead entry: pipeline header button opens extended manual form; duplicate phone blocked; notes saved to CRM record.
- Google Maps paste import: CRM pipeline button, review step, Media Library image upload, duplicate phone/URL/name+address checks.
- Lead persistence: `addPersistedLead` and `persistLeadCollection` merge from stored real leads; legacy manual leads migrate into `bs-hunter-real-leads` on load; App reloads leads on mount/focus/storage events.
- Lead-to-sale workflow: real leads from manual entry, CSV import, and paid search now persist in `bs-hunter-real-leads` and survive reload.
- CRM and proposal storage now share the same LeadID via `getLeadId()`.
- Proposal open/accept actions update CRM stage and proposal amount consistently.
- Inline Lead CRM status dropdown uses CRM V2 stages instead of legacy values.
- Google Sheets export filters demo leads, verifies JSON responses, and includes CRM/proposal columns.

### Added

- Lead category normalization module (`src/services/leadCategory.js`) with Hebrew alias mapping and dynamic future-category support.
- CRM pipeline category filter bar and compact category tags on lead cards.
- `scripts/report-lead-categories.mjs` helper to report category counts from browser localStorage.

- Businesses hub now includes “אתר אינסטלטור – דמו למכירה” beside BS Finder and BS Funds, linked to its verified public Sites URL; hosted assets without a repository hide repository-only controls.

- Sales Pipeline Send Demo action: opens a normalized `wa.me` draft with the required Hebrew sales message and the lead's existing shareable demo URL; missing demos show `יש ליצור אתר דמו לפני השליחה` and do not open WhatsApp.
- Business OS application shell, fixed sidebar, dashboard, and internal screen navigation.
- BS Hunter as the first complete Business OS module.
- BS Funds placeholder module and dashboard shortcut.
- Tasks module with CRUD, 100-task starter roadmap, filtering, categories, progress, sorting, pagination, and localStorage.
- Mission Control with the top six incomplete task records.
- Lead CRM controls for status, notes, and follow-up dates.
- Lead action history for Demo Site, Proposal, Sales Pitch, and WhatsApp opening.
- Automatic CRM stage updates for Proposal and WhatsApp actions.
- Clickable dashboard cards and real-lead filters.
- Demo-lead exclusion from real metrics and priority selection.
- Demo Website Builder engine, templates, sections, and responsive one-page rendering.
- Proposal Generator modal.
- Sales Center outreach scripts and copy actions.
- WhatsApp Web action with personalized messages and cleaned phone numbers.
- Paid API, Free Mode, CSV Import, Demo Leads, and manual lead source modes.
- Manual real-lead form, deduplication, scoring, and persistence.
- CRM/Sales Pipeline manual lead entry button with extended form fields and duplicate-phone prevention.
- Google Maps paste import in CRM with review step, Media Library image storage, and shared images for Demo/Real Website Builder.
- CRM lead card Edit Lead and Manage Images actions with persisted updates and per-business media linking.
- CSV export and Google Sheets export integration.
- English, Hebrew, Arabic, and Russian interface translations.
- Global RTL/LTR direction and persisted language selector.
- Production error boundary, environment ignore rules, and static-host rewrite fallback.
- Permanent project documentation: status, roadmap, decisions, development guide, changelog, and agent rules.
- Structured durable roadmap with 120 tasks and explicit priorities, blockers, dependencies, and evidence-based status.
- Projects module with task-based progress, next-ten priorities, module status, known issues, revenue flow, document summaries, and Business OS navigation.
- Project Command Center upgrade with completed/total counts, summary metrics, active-task metadata, responsive connected revenue timeline, compact tabs, and audited four-language labels.
- Project Command Center task-content localization for known starter and generated roadmap tasks, with original stored values preserved and a decision-focused Overview.
- Secure AI Center with backend-only OpenAI Node SDK, Responses API endpoints, request validation, safe no-key behavior, project-summary context, and non-sensitive activity metadata.
- AI Center status endpoint, permanent Business OS navigation, four translated one-click project actions, and strictly limited task/project request context.
- Real Website Builder V1 with customer intake, three professional templates, deterministic four-language content, RTL/LTR previews, project status tracking, and localStorage persistence.
- Business OS Command Center v2 with task-backed Current Mission actions, Focus Mode, local business overview, three ecosystem project cards, development and document centers, priority queue, grouped risks, AI connection summary, local idea capture, persistent light/dark themes, and responsive navigation.
- Businesses and Websites & Assets category pages, plus a focused BS Finder workspace that exposes existing revenue tools without placing them in the global sidebar.
- Revenue-first Ideas Vault with compact CRUD, status updates, deterministic scoring, priority labels, shared Dashboard idea persistence, responsive cards, and four-language RTL/LTR support.
- Proposal Templates V1 with Basic, Business, and Premium website offers, customer/contact/date autofill, editable prices and scope details, and per-business local draft saving.
- Working Business OS Settings screen for language, light/dark theme, default opening screen, compact mode, reset confirmation, and immediate persisted preferences.
- CRM V2 sales shell connected to existing real leads, CRM records, and action history, with ten-stage pipeline cards and deterministic urgent-action ordering.
- CRM V2 Next Action and secondary controls using existing call, WhatsApp, demo, proposal, payment-link, and real-website handlers.
- Persisted editable CRM daily goals with actual counts sourced only from existing leads and recorded activity.
- CRM follow-up center, proposal/revenue summary, search, stage filters, sorting, translated labels, responsive states, and shared proposal storage utilities.
- Real Website Builder Image Manager with eight customer image slots, browser-side WebP compression, drag-and-drop upload, replace/delete, and per-business Media Library (80 images / 3.5 MB cap).
- Image slot targeting from library to customer project with visual slot selection and four-language labels.
- Generated real websites now consume uploaded images for logo, hero, about/gallery/team gallery, service cards, testimonial avatars, and contact section imagery.
- Per-business media isolation with unicode-safe storage keys, legacy key migration, business-name rename migration, and slot-upload sync into the shared Media Library.
- Business OS InternalBackButton with screen history, sticky topbar placement, and RTL-aware chevron.
- Global responsive containment to prevent page-level horizontal scrolling across shell, CRM pipeline, lead table, command center, and website builder layouts.
- BS Funds website asset card in Websites & Assets with Name, Type, Status metadata and Open website action for the existing BS Funds site URL.
- Reusable Websites & Assets registry with shared asset cards for BS Funds and BS Finder, including production URL, GitHub repository, and open actions; additional sites append to `websiteAssets.js` without layout changes.

### Changed

- Lead action buttons use a compact 2x2 grid.
- Dashboard and lead table layouts were compacted for standard desktop screens.
- Google Maps Free Mode query uses `businessType city` without a hardcoded “in”.
- Paid API production flow now fails safely when billing/backend configuration is absent.
- Paid API failures no longer replace results with demo leads.
- AI Center now loads backend configuration status and sends the selected language separately from its constrained project context.
- Proposal Generator now uses a shared storage accessor and emits local proposal-change events so CRM values refresh without duplicating proposal state.
- BS Hunter can open Real Website Builder with a copied lead payload while preserving the original lead and existing demo-site workflow.
- Business OS now opens on the owner Command Center while preserving direct BS Hunter, BS Funds, Projects, Tasks, AI Center, and Real Website Builder navigation.
- Replaced the mixed sidebar of businesses, assets, and individual builders with 13 system categories. BS Finder moved under Businesses; BS Funds, demo sites, and customer sites moved under Websites & Assets; lead-specific builders remain accessible from the BS Finder workspace. The BS Finder card uses existing live counts, BS Funds is absent from Dashboard project cards, and display-only Open BS Hunter text now reads Open BS Finder.

### Verified

- Existing Shareable Demo Links: stable IDs, direct no-shell demo routes, new-tab portable loading, refresh persistence, missing-demo state, Vite module serving, build, and lint.
- Latest application build passed with `npm run build` after reusable website asset registry refactor.
- Latest lint passed with `npm run lint` after reusable website asset registry refactor.
- No-key AI status, connection test, chat failure, and empty-message validation passed against the running local backend.
