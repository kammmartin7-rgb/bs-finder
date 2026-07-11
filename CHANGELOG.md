# Changelog

Exact completion dates for earlier work are not available. Verified existing work is recorded under **Unreleased**.

## Unreleased

### Added

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

### Changed

- Lead action buttons use a compact 2x2 grid.
- Dashboard and lead table layouts were compacted for standard desktop screens.
- Google Maps Free Mode query uses `businessType city` without a hardcoded “in”.
- Paid API production flow now fails safely when billing/backend configuration is absent.
- Paid API failures no longer replace results with demo leads.
- AI Center now loads backend configuration status and sends the selected language separately from its constrained project context.
- BS Hunter can open Real Website Builder with a copied lead payload while preserving the original lead and existing demo-site workflow.
- Business OS now opens on the owner Command Center while preserving direct BS Hunter, BS Funds, Projects, Tasks, AI Center, and Real Website Builder navigation.
- Replaced the mixed sidebar of businesses, assets, and individual builders with 13 system categories. BS Finder moved under Businesses; BS Funds, demo sites, and customer sites moved under Websites & Assets; lead-specific builders remain accessible from the BS Finder workspace. The BS Finder card uses existing live counts, BS Funds is absent from Dashboard project cards, and display-only Open BS Hunter text now reads Open BS Finder.

### Verified

- Latest application build passed with `npm run build` after this documentation task.
- Latest lint passed with `npm run lint` after this documentation task.
- No-key AI status, connection test, chat failure, and empty-message validation passed against the running local backend.
