# Business OS Project Status

## Last Updated

2026-07-20 IDT

## Current Main Goal

Launch a working revenue-producing Business OS with one shared CRM and a stable lead system.

## Current Active Task

Add Real Website Builder page and section editor (RWB-003).

## Last Completed Task

Added the Proposal Generator “שליחת הצעה” action using the existing draft, shared-link, WhatsApp, and confirmed stage-advance flows; build/lint passed without storage or CRM architecture changes.

## Project Rules (Current)

- Business OS manages the entire business.
- BS Finder is one business inside Business OS.
- All businesses use the same CRM and Sales Pipeline.
- Do not create duplicate CRM, Pipeline, Dashboard, or modules.
- Work on only one task at a time.
- Do not add new features before lead-system stabilization is complete.

## What Is Working

- Business OS shell with internal screen state and fixed RTL/LTR-aware sidebar.
- Top-level navigation: Dashboard, Businesses, Sales, Finance, Tasks, AI Center, Documents, Users & Permissions, Integrations, Settings.
- **Sales** sidebar tab opens the existing shared CRM & Sales Pipeline (`crm` screen); no duplicate CRM or pipeline was created.
- Businesses hub lists BS Finder, BS Funds, the plumber demo website asset, and the kidney donation campaign website (`התרמה להשתלת כליה`); BS Finder workspace links to Overview, Lead Sources, CRM & Sales Pipeline, Proposal, Demo Builder, Real Website Builder, Media Library, and Customers.
- Projects, Websites & Assets, Ideas Vault, and Development remain accessible via business hubs, dashboard links, deep routes, or Settings — not as duplicate top-level modules.
- Sales Pipeline uses two fixed-height rows (5 primary + 4 secondary stages, 420px / 270px); lead lists scroll inside each stage column.
- Selected lead **customer file** (`LeadCustomerFile.jsx`): business info, sales info, append-only notes history, activity timeline, demo/proposal links, and Edit Lead; pipeline cards and Current Lead panel retain all CRM actions.
- Sales workflow (`salesWorkflow.js`): nine stages — new, first-contact, demo-created, demo-sent, proposal-sent, negotiation, follow-up, deal-won, lost; legacy stages normalize on read.
- CRM Sales Pipeline category filter bar above the pipeline (`כל הלידים`, known Hebrew categories, dynamic future categories, `לא מסווג` when needed) with per-category counts; filtering is display-only for the pipeline section.
- Sales **Work Mode** sticky Current Lead panel above action center: business name, phone, city, category, website status, score, stage, and one-click Call/WhatsApp/Create Demo/Send Demo/Proposal/Notes/Next Lead; pipeline selection updates panel; Next Lead follows current filter/sort order.
- CRM Sales Pipeline import batch filter metadata and compact batch tag on pipeline cards remain on lead records; batch labels visible on cards.
- Pipeline phone numbers and CRM call actions open WhatsApp in a new tab and normalize Israeli local numbers with or without a leading zero to country code `972`.
- Pipeline lead cards include a compact Send Demo action that reuses the existing shareable demo record and shared WhatsApp normalization; it never creates a second demo.
- Demo Website selected images use a responsive full-cover hero background with dark readability layers, desktop right-copy/left-form layout, and mobile stacked copy/actions/form layout.
- Shareable demos persist complete payloads to Supabase `demos.payload`; new links contain only an 8-character ID, while localStorage remains a cache and legacy-link fallback.
- Ideas Vault with revenue potential, time-to-revenue, effort, cost, status, next-action tracking, deterministic scoring, and local persistence shared with Dashboard quick capture.
- Business OS Command Center with task-backed mission, focus mode, compact actionable dashboard metrics, and theme persistence.
- Websites & Assets registry (BS Funds, BS Finder) with production URLs, GitHub repositories, and open/copy actions.
- Plumber sales demo appears in the Businesses hub as an active portfolio asset with its verified public URL.
- BS Hunter with paid, free Google Maps, CSV import, demo, and manual lead modes.
- Paid search fails safely when no production API/billing is configured; it never substitutes fake leads.
- Manual real-lead entry, duplicate prevention, unique IDs, and canonical `bs-hunter-real-leads` persistence via `leadPersistence.js`.
- Real lead records include sales tracking fields (`messageVersion`, `messageSentAt`, `demoOpenCount`, `firstDemoOpenAt`, `lastDemoOpenAt`, `lastContactAt`, `nextAction`, `nextActionDate`, `salesStatus`) with backward-compatible defaults and one-time migration on load.
- CRM/Sales Pipeline manual lead entry and Google Maps paste import with optional images into per-business Media Library.
- CRM lead cards: click-to-edit opens the shared `LeadEditForm`; Manage Images opens from the edit dialog footer; persisted updates via `updatePersistedLead`; Sales Tracking fieldset (`data-testid="lead-sales-tracking"`) sits directly above Notes with immediate save on blur/change.
- Sales page **מרכז פעולות מכירה** (`data-testid="sales-action-center"`) above the pipeline: six actionable categories with real counts, max 5 leads per active category, Call/WhatsApp/Edit Lead actions; single-pass selector from lead sales-tracking fields.
- Sales page layout: one action center + one pipeline; no duplicate urgent/follow-up/command blocks.
- LeadID-only joins for CRM, actions, proposals, demos, media, and real website projects with legacy migration on load.
- CRM V2 pipeline, follow-up center (inside Sales Command), and four-language UI.
- Real Website Builder V1 with Image Manager, Media Library, templates, previews, and localStorage persistence.
- Proposal Generator and Templates V1, Sales Center, Tasks module, Projects Command Center, AI Center, Settings, and four-language RTL/LTR support.
- Proposal drafts support optional payment methods, installment count/first payment/start date, and free-text payment terms; saved options appear in preview and print while legacy drafts remain compatible.
- Terminal Sales stages remain recoverable: closed and lost leads retain previous-stage, stay, edit, notes, call, and WhatsApp controls; previous-stage returns to negotiation and next-stage is hidden.
- Production build is static; Free Mode, CSV, Demo, CRM, and Tasks do not require the local backend for basic operation.

## What Is Incomplete

- Google Maps paste import and lead images are not yet covered by the automated E2E script (manual verification still required).
- No production deployment has been completed or verified on a real hosting provider.
- Paid lead search still needs billing, a deployed backend, and `VITE_API_BASE_URL`.
- BS Funds has no live data integration beyond the production website asset card.
- Global Users & Permissions and Integrations remain placeholder screens.
- Real Website Builder V1 does not yet include section editing, client approvals, publishing, domains, hosting, or payment-triggered delivery.
- No payment integration exists.
- Live AI responses remain unavailable until backend `OPENAI_API_KEY` billing/configuration is added.
- CRM remains localStorage-based.
- No authentication, cloud database, backups, audit permissions, analytics, or multi-device synchronization.
- No automated test suite exists beyond build, lint, and the optional `scripts/verify-lead-e2e.mjs` helper.

## Known Problems

- Pipeline card click selects lead for Current Lead panel (edit via panel or double workflow); drag-and-drop still moves stage manually; E2E script may need update for 9-stage pipeline order.
- Paid lead search requires provider billing and a deployed backend.
- Production deployment is prepared but not smoke-tested on a public URL.
- `VITE_PUBLIC_APP_URL` currently resolves to localhost; configure the public Vercel origin before sending customer demo links.
- Demo website quality still requires improvement before it can be sold as a professional customer website.
- Google Sheets requires a configured public Apps Script web-app endpoint.
- All operational data currently relies on browser localStorage and can be lost if browser storage is cleared.
- AI Center is safely disconnected because no OpenAI API key is currently configured.
- There are no confirmed build or lint failures as of the timestamp above.

## How To Run

```bash
cd /Users/sdfghjklpoiuytrewq/my-website/bs-hunter
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

Verification:

```bash
npm run build
npm run lint
```

Optional paid-search backend for local development:

```bash
cd /Users/sdfghjklpoiuytrewq/my-website/bs-hunter/server
npm install
npm start
```

Optional lead persistence E2E verification (requires running dev server; Playwright auto-installs if missing):

```bash
node scripts/verify-lead-e2e.mjs
```

Covers 12 checks: existing lead count, manual create, duplicate prevention, pipeline-card edit, stage selector, drag-and-drop, browser refresh, dev-server restart, count non-decrease, and canonical `bs-hunter-real-leads` persistence. Does not wipe existing leads.

## Project Structure

- `src/App.jsx` — BS Hunter interface, lead state, source modes, lead actions, and modals.
- `src/components/BusinessOS/` — shell, sidebar, dashboard, navigation hubs, Tasks, Mission Control, filters, and task storage.
- `src/components/BusinessOS/NavigationHub.jsx` — Businesses, BS Finder workspace, BS Funds, Finance, Documents, and asset hubs.
- `src/components/CRM/` — shared CRM & Sales Pipeline, lead cards, edit form, media modal, selectors.
- `src/services/leadPersistence.js` — canonical real-lead store and change notifications.
- `src/services/leadSalesTracking.js`, `leadSalesTrackingMigration.js` — lead-level sales tracking fields and one-time backfill.
- `src/services/leadId.js`, `leadRelationMigration.js` — LeadID normalization and legacy migration.
- `src/components/GoogleMapsImport/` — Google Maps paste import for CRM pipeline.
- `src/components/Projects/` — project status dashboard and markdown-mirrored project facts.
- `src/components/RealWebsiteBuilder/` — paid-customer website builder, Image Manager, Media Library.
- `server/` — optional Express/Apify paid-search backend.
- `dist/` — generated production build; do not edit manually.

## Current Revenue Flow

Lead
→ CRM
→ Demo Site
→ Sales Pitch
→ Proposal
→ WhatsApp
→ Payment
→ Real Website
→ Deployment
→ Customer Support

The flow currently works through WhatsApp opening and local tracking. Payment, real customer website delivery, deployment, and customer support systems remain incomplete.

## Next 10 Tasks

1. Add Real Website Builder page and section editor (RWB-003).
2. Add customer approval workflow for generated websites (RWB-005).
3. Restore and verify reliable real lead acquisition for multiple industries and cities (production billing/deploy still required).
4. Select and configure the real payment provider and payment handoff.
5. Perform full browser interaction QA for every CRM stage and action.
6. Verify proposal acceptance and secure-payment handoff with a real configured URL.
7. Deploy and smoke-test the customer-facing sales flow on a public URL.
8. Add website publish/deploy pipeline after customer approval.
9. Add revenue-critical follow-up reminders and outcome tracking.
10. Extend E2E script to cover Google Maps import and lead images.

## Do Not Touch

Do not change these stable areas without a specific task and verification plan:

- Canonical lead store key `bs-hunter-real-leads` and merge order in `leadPersistence.js`.
- Paid search service and server integration (unless fixing lead acquisition).
- Free Mode query construction and CSV import behavior.
- Google Sheets payload and export behavior.
- Demo-lead exclusion rules.
- Lead IDs, CRM storage keys, action-history keys, or task storage migration.
- Existing 2x2 lead action layout and action behavior.
- WebsiteBuilder, ProposalGenerator, and SalesCenter contracts.
- Language context, all four languages, and RTL/LTR behavior.
- Business OS internal screen-state architecture.
- Production error boundary and static-host fallback.
