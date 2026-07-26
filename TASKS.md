# Business OS Roadmap

This is the durable project roadmap. Mission Control shows only the top 6 incomplete tasks. The Tasks module may contain 100 or more tasks.

Priority: **RED** = revenue-critical/blocking; **ORANGE** = important; **GREEN** = verified complete; **GRAY** = future/paused.

| ID | Title | Category | Project | Priority | Status | Revenue impact | Blocking | Dependency | Notes |
|---|---|---|---|---|---|---:|---|---|---|
| BOS-001 | Deploy static production build | Deployment | Business OS | RED | Open | High | Yes | Production host | Upload `dist`, configure rewrite, smoke-test public URL. |
| BOS-002 | Integrate customer payment checkout | Payments | Business OS | RED | Open | High | Yes | Payment provider account | Payment is not implemented. |
| BOS-003 | Record paid customer state | Payments | Business OS | RED | Open | High | Yes | BOS-002 | Must trigger post-sale workflow. |
| BOS-004 | Define paid website delivery workflow | Real Website Builder | Business OS | RED | Open | High | Yes | Customer requirements | Cover intake through support. |
| BOS-005 | Build production customer Website Builder | Real Website Builder | Business OS | RED | Open | High | Yes | BOS-004 | Demo builder is not enough for paid delivery. |
| BOS-006 | Add website editor and approval state | Real Website Builder | Business OS | RED | Open | High | Yes | BOS-005 | Customer revision workflow. |
| BOS-007 | Add website publish/deploy pipeline | Deployment | Business OS | RED | Open | High | Yes | BOS-005 | Domain, hosting, rollback. |
| BOS-008 | Move operational data to cloud database | Infrastructure | Business OS | RED | Open | High | Yes | Data model | localStorage is temporary. |
| BOS-009 | Add authentication and tenant ownership | Infrastructure | Business OS | RED | Open | High | Yes | BOS-008 | Required before customer data. |
| BOS-010 | Add revenue-flow integration tests | Infrastructure | Business OS | RED | Open | High | Yes | Stable flows | Test lead through payment/deployment. |
| AUTH-001 | Centralize multi-role authorization | Infrastructure | Business OS | GREEN | Completed | High | No | Supabase Auth | Active profiles enter the app; owner, admin, sales, client, and demo permissions centrally protect Business OS screens. Authorization regression script, build, and lint verified. |
| AUTH-002 | Build SaaS user-management foundation | Infrastructure | Business OS | GREEN | Completed | High | No | AUTH-001 | Added businesses, memberships, compatible profile fields, database authorization helpers/RLS, backend Supabase client foundation, and business-aware Users directory; foundation/authorization tests, build, and lint passed. |
| AUTH-003 | Add trusted Auth user provisioning | Infrastructure | Business OS | ORANGE | In Progress | High | Yes | AUTH-002 | Local implementation and deterministic verification are complete: protected invite/update/activate/safe-disable/password-reset endpoints, password setup UI, audit, business scope, immediate profile refresh, and Users screen workflow. Migration application, server-only secret configuration, and live verification remain. |
| BOS-011 | Maintain Business OS shell | Business OS | Business OS | GREEN | Completed | High | No | None | Fixed sidebar and screens verified. |
| BOS-012 | Maintain clickable dashboard metrics | Business OS | Business OS | GREEN | Completed | Medium | No | Lead data | Real-lead filters verified. |
| BOS-013 | Persist active Business OS screen | Business OS | Business OS | ORANGE | Open | Low | No | Screen-state design | Refresh currently returns to Dashboard. |
| BOS-014 | Add user-configurable dashboard widgets | Business OS | Business OS | GRAY | Future | Low | No | Authentication | Future customization. |
| BOS-015 | Add global activity feed | Business OS | Business OS | ORANGE | Open | Medium | No | Cloud event model | Include leads, tasks, payments. |
| BOS-016 | Establish permanent project memory | Business OS | Business OS | GREEN | Completed | High | No | None | Six root memory files created and verified. |
| BOS-017 | Add Projects status module | Business OS | Business OS | GREEN | Completed | Medium | No | BOS-016 | Live task progress and mirrored project facts verified. |
| BOS-018 | Upgrade Project Command Center | Business OS | Business OS | GREEN | Completed | Medium | No | BOS-017 | Compact translated command view and rich task details verified. |
| BOS-019 | Maintain proposal payment instructions | Payments | Business OS | GREEN | Completed | Medium | No | Proposal Generator | Static Bit, PayBox, and bank-transfer details render in the existing proposal payment section. |
| BOS-020 | Add GrowthPilot services section | Sales | Business OS | GREEN | Completed | Medium | No | Existing proposal and WhatsApp flows | Compact RTL service cards with quote and WhatsApp actions verified by build/lint. |
| BOS-021 | Update GrowthPilot visible branding | Brand | Business OS | GREEN | Completed | Low | No | None | Visible titles, headers, proposal footer, and navigation labels updated without changing internal identifiers. |
| BOS-022 | Clean remaining visible legacy branding | Brand | Business OS | GREEN | Completed | Low | No | BOS-021 | Visible legacy labels updated; internal historical identifiers intentionally preserved. |
| BOS-023 | Enforce customer branding boundary | Brand | Business OS | GREEN | Completed | Low | No | BOS-022 | Customer-facing proposal, WhatsApp, and public title use GrowthPilot only; private module labels remain intact. |
| BOS-024 | Extend proposal pricing draft fields | Proposals | Business OS | GREEN | Completed | Medium | No | Existing Proposal Generator | Added compatible price, discount, VAT, and extra-line-item draft fields; existing proposal flow preserved. |
| BOS-025 | Fix editable proposal pricing controls | Proposals | Business OS | GREEN | Completed | Medium | No | Existing Proposal Generator | Visible מחיר ההצעה input, discount/VAT controls, live totals, and saved draft behavior verified by build/lint. |
| BOS-026 | Integrate GrowthPilot logo assets | Brand | Business OS | GREEN | Completed | Low | No | Provided brand assets | Circular logo added to sidebar; horizontal logo added to proposal/payment/shared-demo surfaces. |
| BOS-027 | Polish proposal logo placement | Brand | Business OS | GREEN | Completed | Low | No | BOS-026 | Header logo and compact footer styling added; payment-section banner removed. |
| BOS-028 | Add proposal send workflow action | Proposals | Business OS | GREEN | Completed | High | No | Existing WhatsApp and shared-link utilities | Send button saves draft, opens prefilled WhatsApp, and advances only after confirmation. |
| BOS-019 | Add secure AI Center and backend | Business OS | Business OS | GREEN | Completed | Medium | No | None | Backend-only SDK, safe no-key flow, and translated UI verified. |
| BOS-020 | Clean and localize Project Command Center | Business OS | Business OS | GREEN | Completed | Medium | No | BOS-018 | Known starter and roadmap task content localized for display; compact Overview verified. |
| BOS-021 | Complete AI Center Business OS integration | Business OS | Business OS | GREEN | Completed | Medium | No | BOS-019 | Status endpoint, four AI actions, constrained context, navigation, validation, and no-key behavior verified. |
| BOS-022 | Build Real Website Builder V1 | Real Website Builder | Business OS | GREEN | Completed | High | No | RWB-001,RWB-002 | Separate real-site workflow, lead handoff, previews, statuses, and local persistence verified. |
| BOS-023 | Build Business OS Command Center v2 | Business OS | Business OS | GREEN | Completed | High | No | BOS-016 | Owner mission, project visibility, local facts, task actions, focus mode, themes, navigation, and responsive layout verified. |
| BOS-024 | Restructure Business OS navigation hierarchy | Business OS | Business OS | GREEN | Completed | Medium | No | BOS-023 | Final 10-item sidebar verified: Dashboard, Businesses, Sales, Finance, Tasks, AI Center, Documents, Users, Integrations, Settings. Projects/Websites/Ideas/Development relocated to business hubs or Settings; single shared CRM & Sales Pipeline. |
| BOS-027 | Stabilize Sales pipeline layout and shared CRM access | Business OS | Business OS | GREEN | Completed | High | No | BOS-024 | Sales tab opens existing `crm` route; fixed-height pipeline rows with internal scroll; content-driven lead cards; build and lint passed. |
| BOS-028 | Fully stabilize lead persistence E2E | Business OS | Business OS | GREEN | Completed | High | No | BOS-027 | `scripts/verify-lead-e2e.mjs` expanded to 12 checks (existing count, manual create, duplicate block, pipeline-card edit, stage selector, drag-and-drop, refresh, dev-server restart, count non-decrease, canonical storage); lead edit via pipeline card click; same browser context survives vite restart; 12/12 passed; build/lint passed; no production code changes. Google Maps import and images remain manual-only. |
| BOS-030 | Redesign sales workflow (stages = completed states) | CRM | Business OS | GREEN | Completed | High | No | BOS-028 | Nine-stage pipeline in `salesWorkflow.js`; per-card primary/secondary actions; manual prev/stay/next; no auto stage moves; Send Demo / Save Proposal confirm optional advance; legacy stage normalize; build/lint passed. |
| BOS-029 | Add plumber demo to Businesses hub | Business OS | Business OS | GREEN | Completed | Medium | No | Businesses hub | Registered the verified Sites production URL as an active portfolio asset beside BS Finder and BS Funds. |
| BOS-025 | Build revenue-first Ideas Vault | Business OS | Business OS | GREEN | Completed | Medium | No | BOS-023 | Compact CRUD, status changes, deterministic revenue scoring, shared localStorage persistence, translations, RTL/LTR, and light/dark styles verified. |
| BOS-026 | Build owner Settings screen | Business OS | Business OS | GREEN | Completed | Low | No | BOS-023 | Language, theme, default opening screen, compact mode, reset, persistence, four-language UI, RTL/LTR, build, and lint verified. |
| BSH-001 | Preserve existing BS Hunter module | BS Hunter | BS Hunter | GREEN | Completed | High | No | None | Existing workflows verified by build/lint. |
| BSH-002 | Persist all real lead source results | BS Hunter | BS Hunter | GREEN | Completed | High | No | Cloud/local data design | CSV import and paid search merge/upsert into `bs-hunter-real-leads`; related CRM/proposal/media/demo/project data keys exclusively on LeadID with legacy migration. |
| BSH-006 | Extend Lead model with sales tracking fields | BS Hunter | BS Hunter | GREEN | Completed | High | No | BSH-002 | `messageVersion`, `messageSentAt`, demo open/contact timestamps, `nextAction`, `nextActionDate`, `salesStatus` enum, defaults, load enrichment, and one-time migration verified; no UI changes. |
| BSH-007 | Add sales tracking fields to Lead Details panel | BS Hunter | BS Hunter | GREEN | Completed | High | No | BSH-006 | LeadEditForm fields with immediate `updatePersistedLead` save; four-language labels; build and lint passed. |
| BSH-008 | Clean up duplicate lead edit UI | BS Hunter | BS Hunter | GREEN | Completed | Medium | No | BSH-007 | Removed unreachable legacy full-card edit branch in CRM; one shared LeadEditForm for Sales and CRM; Manage Images wired through edit dialog; build and lint passed. |
| BSH-009 | Sales Command Center MVP | BS Hunter | BS Hunter | GREEN | Completed | High | No | BSH-008 | Unified **מרכז פיקוד מכירות** at top of Sales page (requires-attention + follow-up tabs); removed duplicate mission/urgent/revenue/header-toolbar sections; pipeline and shared Lead Edit dialog preserved; build/lint passed; no storage changes. |
| BSH-003 | Add lead deletion and archive | BS Hunter | BS Hunter | ORANGE | Open | Medium | No | Persistence | Preserve history. |
| BSH-004 | Add bulk lead actions | BS Hunter | BS Hunter | GRAY | Future | Medium | No | Stable CRM | Bulk status and export. |
| BSH-005 | Add lead detail drawer | BS Hunter | BS Hunter | ORANGE | Open | Medium | No | Component design | Reduce table density. |
| LSR-001 | Keep Paid API client available | Lead Search | BS Hunter | GREEN | Completed | High | No | Backend | Client remains guarded in production. |
| LSR-002 | Enable paid provider billing | Lead Search | BS Hunter | RED | Blocked | High | Yes | Billing card/provider | External blocker. |
| LSR-003 | Deploy paid search backend | Lead Search | BS Hunter | RED | Open | High | Yes | LSR-002 | Configure CORS and API URL. |
| LSR-004 | Verify paid results in production | Lead Search | BS Hunter | RED | Open | High | Yes | LSR-003 | Never substitute demo data. |
| LSR-005 | Add paid-search usage and cost limits | Lead Search | BS Hunter | ORANGE | Open | High | No | LSR-003 | Prevent runaway cost. |
| CRM-001 | Maintain lead-level CRM controls | CRM | Business OS | GREEN | Completed | High | No | localStorage | Status, notes, follow-up keyed by LeadID only; legacy CRM keys migrate on load. |
| CRM-002 | Build full CRM pipeline screen | CRM | Business OS | GREEN | Completed | High | No | Data persistence | Tasks 1-4 verified: responsive shell, existing real lead/CRM/action data, pipeline cards, legacy-stage display mapping, and urgent-action ordering. |
| CRM-003 | Add follow-up calendar view | CRM | Business OS | GREEN | Completed | High | No | CRM-002 | Overdue, today, upcoming, and no-date groups with existing-record date updates verified. |
| CRM-004 | Add lead owner assignment | CRM | Business OS | ORANGE | Open | Medium | No | Authentication | Person or agent ownership. |
| CRM-005 | Add CRM history timeline | CRM | Business OS | ORANGE | In Progress | Medium | No | Action events | Latest recorded activity is visible; a complete chronological timeline remains future work. |
| CRM-006 | Keep terminal leads recoverable | CRM | Business OS | GREEN | Completed | High | No | CRM-002 | Closed and lost stages retain previous-stage, stay, edit, notes, call, and WhatsApp controls; both return to negotiation; build, lint, and workflow assertion passed. |
| TSK-001 | Maintain Tasks CRUD | Tasks | Business OS | GREEN | Completed | Medium | No | localStorage | Add/edit/delete/complete verified. |
| TSK-002 | Maintain 100-task roadmap migration | Tasks | Business OS | GREEN | Completed | Medium | No | Storage flag | Deduplicates six starters. |
| TSK-003 | Add cloud task synchronization | Tasks | Business OS | ORANGE | Open | Medium | No | BOS-008 | Multi-device tasks. |
| TSK-004 | Add task owner notifications | Tasks | Business OS | GRAY | Future | Medium | No | Authentication | Email/in-app reminders. |
| TSK-005 | Add task templates by project | Tasks | Business OS | ORANGE | Open | Low | No | Task taxonomy | Reusable workflows. |
| MC-001 | Maintain top-six Mission Control | Mission Control | Business OS | GREEN | Completed | High | No | Tasks storage | Compact dashboard verified. |
| MC-002 | Generate per-lead sales-stage tasks | Mission Control | Business OS | ORANGE | Open | High | No | CRM/action history | Current Mission Control is task-record based. |
| MC-003 | Add one-click task deep links | Mission Control | Business OS | ORANGE | Open | Medium | No | Screen focus state | Open exact record/action. |
| MC-004 | Add task snooze | Mission Control | Business OS | GRAY | Future | Low | No | Task schema | Preserve priority order. |
| MC-005 | Add daily digest | Mission Control | Business OS | GRAY | Future | Medium | No | Notifications | Top priorities summary. |
| DEM-001 | Maintain demo Website Builder engine | Demo Websites | BS Hunter | GREEN | Completed | High | No | Lead data | Templates and sections exist. |
| DEM-002 | Improve demo copy by business type | Demo Websites | BS Hunter | ORANGE | Open | High | No | Business taxonomy | Current content is generic. |
| DEM-003 | Add professional images and branding | Demo Websites | BS Hunter | ORANGE | Open | High | No | Asset strategy | Selected per-lead images now use a verified responsive full-cover hero with dark overlays and glass contact form; broader branding controls remain open. |
| DEM-004 | Add demo customization controls | Demo Websites | BS Hunter | ORANGE | Open | Medium | No | DEM-002 | Colors, services, content. |
| DEM-005 | Add shareable demo links | Demo Websites | BS Hunter | GREEN | Completed | High | No | Demo Website Builder | Supabase-backed `demos` payloads, random 8-character ID-only routes, cross-browser load, refresh persistence, selected-image data, local cache, and legacy `?data=` compatibility verified. Public app URL still needs the deployed Vercel origin. |
| RWB-001 | Create customer intake form | Real Website Builder | Business OS | GREEN | Completed | High | No | None | Manual and lead-prefilled customer intake verified. |
| RWB-002 | Create real website project model | Real Website Builder | Business OS | GREEN | Completed | High | No | RWB-001 | Separate versioned localStorage project model verified. |
| RWB-003 | Add page and section editor | Real Website Builder | Business OS | RED | Open | High | Yes | RWB-002 | Production-grade editing. |
| RWB-004 | Add asset library | Real Website Builder | Business OS | GREEN | Completed | Medium | No | RWB-002 | Per-lead Media Library (`lead-{leadId}`), ImageManager slot sync, legacy business-name key migration, and generator wiring verified. |
| RWB-005 | Add customer approval workflow | Real Website Builder | Business OS | RED | Open | High | Yes | RWB-003 | Versioned approvals. |
| DEP-001 | Keep Vite static build healthy | Deployment | Business OS | GREEN | Completed | High | No | None | Current build passes. |
| DEP-002 | Keep top-level error boundary | Deployment | Business OS | GREEN | Completed | Medium | No | None | Prevents blank render failures. |
| DEP-003 | Configure production host | Deployment | Business OS | RED | Open | High | Yes | Host account | Public deployment not completed. |
| DEP-004 | Add environment configuration checklist | Deployment | Business OS | ORANGE | Open | Medium | No | DEP-003 | API and Sheets URLs. |
| DEP-005 | Add deployment rollback procedure | Deployment | Business OS | ORANGE | Open | Medium | No | DEP-003 | Preserve known-good build. |
| SAL-001 | Maintain Sales Center | Sales | BS Hunter | GREEN | Completed | High | No | Lead data | Scripts and copying exist. |
| SAL-002 | Improve scripts by industry | Sales | BS Hunter | ORANGE | Open | High | No | Industry taxonomy | Avoid generic outreach. |
| SAL-003 | Add sales outcome tracking | Sales | BS Hunter | ORANGE | Open | High | No | CRM timeline | Meeting/no answer/reject. |
| SAL-004 | Add call scheduling | Sales | Business OS | ORANGE | Open | Medium | No | Calendar integration | Customer booking. |
| SAL-005 | Add sales conversion analytics | Sales | Business OS | ORANGE | Open | High | No | Cloud database | Measure revenue funnel. |
| PRP-001 | Maintain Proposal Generator | Proposals | BS Hunter | GREEN | Completed | High | No | Lead data | Existing modal works. |
| PRP-002 | Create editable proposal templates | Proposals | Business OS | GREEN | Completed | High | No | PRP-001 | Basic, Business, and Premium templates with customer/date autofill, editable price/content, and local draft saving verified. |
| PRP-003 | Add proposal PDF export | Proposals | Business OS | ORANGE | Open | High | No | PRP-002 | Shareable artifact. |
| PRP-004 | Add proposal delivery confirmation | Proposals | Business OS | ORANGE | Open | High | No | Messaging/email | “Opened” is not delivery proof. |
| PRP-005 | Add proposal acceptance state | Proposals | Business OS | RED | In Progress | High | Yes | PRP-002 | Acceptance now updates CRM to `deal-won` with proposal amount. |
| PRP-006 | Add proposal payment options | Proposals | Business OS | GREEN | Completed | High | No | PRP-002 | Existing proposal drafts now support multiple payment methods, installment details, and payment terms in editor, preview, and print; backward compatibility, browser regression, build, and lint verified. |
| WAP-001 | Maintain WhatsApp action | WhatsApp | BS Hunter | GREEN | Completed | High | No | Phone number | Personalized WhatsApp Web URL. |
| WAP-002 | Maintain action history | WhatsApp | BS Hunter | GREEN | Completed | Medium | No | Lead IDs | Open events persist. |
| WAP-003 | Verify message delivery externally | WhatsApp | Business OS | ORANGE | Open | High | No | WhatsApp API/provider | Open is not sent confirmation. |
| WAP-004 | Add approved message templates | WhatsApp | Business OS | ORANGE | Open | Medium | No | WAP-003 | Send Demo now uses the approved concise Hebrew sales copy with the existing demo URL; broader localized templates remain open. |
| WAP-005 | Add reply tracking | WhatsApp | Business OS | GRAY | Future | High | No | WAP-003 | CRM automation. |
| PAY-001 | Select payment provider | Payments | Business OS | RED | Open | High | Yes | Business/legal choice | Compare fees and regions. |
| PAY-002 | Build secure checkout | Payments | Business OS | RED | Open | High | Yes | PAY-001 | Server-side secrets only. |
| PAY-003 | Verify payment webhook | Payments | Business OS | RED | Open | High | Yes | PAY-002 | Idempotent processing. |
| PAY-004 | Create invoice/receipt flow | Payments | Business OS | ORANGE | Open | High | No | PAY-003 | Meet legal requirements. |
| PAY-005 | Trigger website project after payment | Payments | Business OS | RED | Open | High | Yes | PAY-003,RWB-001 | Core revenue handoff. |
| BSF-001 | Maintain BS Funds placeholder | BS Funds | BS Funds | GREEN | Completed | Medium | No | None | Module and translations exist. |
| BSF-002 | Define BS Funds lead schema | BS Funds | BS Funds | ORANGE | Open | High | No | Business requirements | Financial lead fields. |
| BSF-003 | Connect BS Funds real data | BS Funds | BS Funds | RED | Open | High | Yes | BSF-002 | Current metrics are zero. |
| BSF-004 | Add application pipeline | BS Funds | BS Funds | ORANGE | Open | High | No | BSF-003 | New through closed. |
| BSF-005 | Add BS Funds revenue analytics | BS Funds | BS Funds | ORANGE | Open | High | No | BSF-004 | Approved/closed revenue. |
| MKT-001 | Define target industries | Marketing | Business OS | ORANGE | Open | High | No | Sales data | Prioritize profitable niches. |
| MKT-002 | Create landing page | Marketing | Business OS | RED | Open | High | Yes | Public deployment | Sell Business OS service. |
| MKT-003 | Add campaign tracking | Marketing | Business OS | ORANGE | Open | Medium | No | Analytics | Source attribution. |
| MKT-004 | Build case-study format | Marketing | Business OS | ORANGE | Open | High | No | Customer results | Trust and proof. |
| MKT-005 | Create referral program | Marketing | Business OS | GRAY | Future | Medium | No | Paying customers | Post-launch growth. |
| AUT-001 | Auto-create follow-up tasks | Automation | Business OS | ORANGE | Open | High | No | CRM/Tasks | Use CRM dates. |
| AUT-002 | Auto-create post-payment project | Automation | Business OS | RED | Open | High | Yes | PAY-005 | Avoid manual handoff. |
| AUT-003 | Auto-remind overdue leads | Automation | Business OS | ORANGE | Open | Medium | No | Notifications | Do not spam. |
| AUT-004 | Auto-generate weekly report | Automation | Business OS | GRAY | Future | Medium | No | Cloud analytics | Leads, sales, revenue. |
| AUT-005 | Add safe automation audit log | Automation | Business OS | ORANGE | Open | Medium | No | Event model | Explain every action. |
| INF-001 | Keep `.env` ignored | Infrastructure | Business OS | GREEN | Completed | High | No | None | Never commit secrets. |
| INF-002 | Add cloud database backups | Infrastructure | Business OS | RED | Open | High | Yes | BOS-008 | Restore customer data. |
| INF-003 | Add monitoring and error reporting | Infrastructure | Business OS | ORANGE | Open | High | No | Deployment | Production visibility. |
| INF-004 | Add rate limiting | Infrastructure | Business OS | ORANGE | Open | Medium | No | Backend deployment | Protect paid APIs. |
| INF-005 | Add security review | Infrastructure | Business OS | RED | Open | High | Yes | Auth/payment | Before customer launch. |
| LNG-001 | Maintain four-language selector | Global Languages | Business OS | GREEN | Completed | Medium | No | None | EN/HE/AR/RU verified in code. |
| LNG-002 | Maintain RTL/LTR direction | Global Languages | Business OS | GREEN | Completed | Medium | No | None | Document direction persists. |
| LNG-003 | Translate generated website copy | Global Languages | Business OS | ORANGE | Open | Medium | No | Content generation | Currently English. |
| LNG-004 | Translate generated sales content | Global Languages | Business OS | ORANGE | Open | Medium | No | Sales templates | Currently English. |
| LNG-005 | Add translation completeness test | Global Languages | Business OS | ORANGE | Open | Low | No | Test framework | Catch missing keys. |
| CS-001 | Create customer onboarding checklist | Client Success | Business OS | RED | Open | High | Yes | Payment workflow | Start after payment. |
| CS-002 | Add customer project status | Client Success | Business OS | ORANGE | Open | High | No | RWB-002 | Visible milestones. |
| CS-003 | Add support request tracking | Client Success | Business OS | ORANGE | Open | Medium | No | Authentication | Post-launch support. |
| CS-004 | Add website maintenance plans | Client Success | Business OS | ORANGE | Open | High | No | Payments | Recurring revenue. |
| CS-005 | Add satisfaction and testimonial flow | Client Success | Business OS | GRAY | Future | Medium | No | Delivered customers | Build proof. |
| AI-001 | Define future AI-agent permissions | Future AI Agents | Business OS | GRAY | Future | Medium | No | Auth/audit | No autonomous writes yet. |
| AI-002 | Add AI website copy assistant | Future AI Agents | Business OS | GRAY | Future | High | No | RWB-003 | Human approval required. |
| AI-003 | Add AI sales assistant | Future AI Agents | Business OS | GRAY | Future | High | No | CRM timeline | No unsupervised outreach. |
| AI-004 | Add AI task prioritizer | Future AI Agents | Business OS | GRAY | Future | Medium | No | Reliable task data | Preserve deterministic fallback. |
| AI-005 | Add AI customer-support assistant | Future AI Agents | Business OS | GRAY | Future | Medium | No | CS-003 | Escalation required. |

## Roadmap Maintenance Rules

- Add new tasks with a unique ID and every required field.
- Never mark a task GREEN/Completed without code or operational evidence.
- Update dependencies when a blocker changes.
- Keep the first incomplete RED tasks aligned with `PROJECT_STATUS.md` → Next 10 Tasks.
- Preserve at least 100 tasks; archive completed work only in the changelog, not by silently deleting history.
