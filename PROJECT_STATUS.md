# Business OS Project Status

## Last Updated

2026-07-16 IDT

## Current Main Goal

Launch a working revenue-producing Business OS with one shared CRM and a stable lead system.

## Current Active Task

Fully stabilize lead persistence E2E (BOS-028): verify manual creation, Google Maps import, editing, images, server restart, and that no leads disappear. Pipeline stage selector and drag-and-drop now share `updateLeadStage` via `onUpdateLead` / `updatePersistedLead`.

## Last Completed Task

Added “אתר אינסטלטור – דמו למכירה” to the existing Businesses hub beside BS Finder and BS Funds, backed by the shared website asset registry and its verified public Sites URL. Repository controls are optional for hosted assets without a GitHub repository.

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
- Businesses hub lists BS Finder and BS Funds; BS Finder workspace links to Overview, Lead Sources, CRM & Sales Pipeline, Proposal, Demo Builder, Real Website Builder, Media Library, and Customers.
- Projects, Websites & Assets, Ideas Vault, and Development remain accessible via business hubs, dashboard links, deep routes, or Settings — not as duplicate top-level modules.
- Sales Pipeline uses two fixed-height rows (primary 420px / secondary 270px); lead lists scroll inside each stage column.
- Pipeline lead cards use dynamic height from available data; compact stage selector on every card; drag-and-drop and selector share `updateLeadStage`; empty optional fields do not reserve space.
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
- CRM/Sales Pipeline manual lead entry and Google Maps paste import with optional images into per-business Media Library.
- CRM lead cards: click-to-edit, optional fields when present, LeadEditForm, Manage Images, persisted updates via `updatePersistedLead`.
- LeadID-only joins for CRM, actions, proposals, demos, media, and real website projects with legacy migration on load.
- CRM V2 pipeline, urgency ordering, follow-up center, revenue summary, search/filter/sort, and four-language UI.
- Real Website Builder V1 with Image Manager, Media Library, templates, previews, and localStorage persistence.
- Proposal Generator and Templates V1, Sales Center, Tasks module, Projects Command Center, AI Center, Settings, and four-language RTL/LTR support.
- Production build is static; Free Mode, CSV, Demo, CRM, and Tasks do not require the local backend for basic operation.

## What Is Incomplete

- Lead persistence E2E stabilization (next task): drag-and-drop verification, server-restart checks, and full regression across all lead entry paths.
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

- Lead persistence must be re-verified end-to-end after navigation and pipeline UI changes (active task); pipeline stage selector and DnD persistence verified; full E2E script still fails on pipeline Edit Lead button (cards open edit on click, not via button).
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

Optional lead persistence verification script (browser must be running with app loaded):

```bash
node scripts/verify-lead-e2e.mjs
```

## Project Structure

- `src/App.jsx` — BS Hunter interface, lead state, source modes, lead actions, and modals.
- `src/components/BusinessOS/` — shell, sidebar, dashboard, navigation hubs, Tasks, Mission Control, filters, and task storage.
- `src/components/BusinessOS/NavigationHub.jsx` — Businesses, BS Finder workspace, BS Funds, Finance, Documents, and asset hubs.
- `src/components/CRM/` — shared CRM & Sales Pipeline, lead cards, edit form, media modal, selectors.
- `src/services/leadPersistence.js` — canonical real-lead store and change notifications.
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

1. Fully stabilize lead persistence and verify manual creation, Google Maps import, editing, images, status changes, drag-and-drop, refresh, and server restart (no disappearing leads).
2. Add Real Website Builder page and section editor (RWB-003).
3. Add customer approval workflow for generated websites (RWB-005).
4. Restore and verify reliable real lead acquisition for multiple industries and cities (production billing/deploy still required).
5. Select and configure the real payment provider and payment handoff.
6. Perform full browser interaction QA for every CRM stage and action.
7. Verify proposal acceptance and secure-payment handoff with a real configured URL.
8. Deploy and smoke-test the customer-facing sales flow on a public URL.
9. Add website publish/deploy pipeline after customer approval.
10. Add revenue-critical follow-up reminders and outcome tracking.

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
