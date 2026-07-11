# Business Ecosystem Master Architecture

Document date: 2026-07-11  
Authority: permanent operating structure for Business OS, BS Finder, BS Funds, and future projects.  
Factual baseline: `PROJECT_AUDIT.md`. Unknown information is explicitly labeled **UNKNOWN**.

## 1. Business Structure

### Business OS

Business OS is the parent management system and owner control center. It is responsible for presenting and eventually managing every business, project, user, role, permission, task, agent, sales process, financial record, issue, document, deployment, integration, and progress indicator in the ecosystem.

The Owner has unrestricted access. Every current and future business, product, digital asset, internal initiative, or agent must be registered as a project under Business OS, even when its code and deployment remain separate.

Current factual implementation: the developed Business OS shell and Project Command Center live inside the local `bs-hunter` codebase. The separately named local `business-os` folder is only a Vite starter and is not the working system.

### BS Finder

BS Finder is the primary revenue-generating business and the highest business priority. Existing code currently calls it BS Hunter. It is designed to:

- Discover businesses without websites through Google Maps and other approved sources.
- Collect, normalize, qualify, score, and store lead data.
- Generate automatic demo websites.
- Support outreach, proposals, follow-up, and sales progression.
- Collect payment.
- Create, review, deliver, host, and maintain real customer websites.
- Manage customers, retention, maintenance, and upsells.

Current factual implementation: most implemented revenue-workflow functionality is located in `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`. Payment, verified outreach delivery, production publishing, hosting, and complete customer delivery remain missing.

### BS Funds

BS Funds is a previous example website and reusable digital asset. It is not the primary business and not the Business OS dashboard. It may later be used as a template, demo, separately deployed product, or saleable copy.

It must remain separate and unchanged unless an owner-approved task explicitly selects it. Its current Git repository is `kammmartin7-rgb/bs-funds`. Its local working tree contains accidentally mixed BS Hunter work, which must be preserved before any cleanup.

### Future Projects

Every future business, product, website, agent, experiment, or operational project must be registered under Business OS. Each project must have:

- A clear business purpose.
- An accountable owner.
- A status and risk level.
- One authoritative local folder.
- One verified GitHub repository.
- A current task and next task.
- Required project documentation.
- Explicit user and agent access rules.

Registration in Business OS does not require source-code duplication. Business OS may display centralized data from a project while that project retains its own repository and deployment.

## 2. Project Relationships

```text
Owner
└── Business OS — management and governance layer
    ├── BS Finder — primary operating and revenue business
    ├── BS Funds — reusable asset / optional separate product
    └── Future Projects — registered businesses, products, agents, and initiatives
```

- Business OS governs, reports, prioritizes, and controls access.
- BS Finder operates the lead-to-customer website business.
- BS Funds remains an independently versioned asset managed from Business OS.
- Future projects are registered centrally but retain clear source ownership.
- Business OS must not contain accidental copies of other projects.
- Intentional modules may exist inside Business OS when they are integration or management views, not duplicate source trees.
- Every active codebase must map to exactly one authoritative local folder and one verified GitHub repository.
- Central data display is allowed; accidental source mixing is prohibited.

### Current physical relationship

The current physical layout does not yet match the target architecture:

- The working Business OS and BS Finder code are combined under `my-website/bs-hunter`.
- The local `my-website/business-os` folder is an unrelated starter.
- The BS Funds Git checkout contains uncommitted mixed BS Hunter work.
- These facts must be reconciled through a controlled, non-destructive source-control plan.

## 3. Users and Permissions

### Owner

- Full access to every business, project, user, role, permission, task, customer, lead, financial record, integration, repository, agent, report, deployment, and setting.
- Can grant and revoke project access.
- Can approve critical system, repository, deployment, payment, and automation actions.
- Ownership transfer requires explicit confirmation and audit logging.

### Manager

- Access to assigned projects, tasks, users, operations, reports, and performance data.
- May coordinate assigned teams and operational workflows.
- Cannot change ownership, global permissions, secrets, repositories, billing, or critical settings unless separately granted.

### Sales Agent

- Access only to assigned leads, customers, calls, follow-ups, proposals, outreach, and sales activity.
- May update permitted CRM fields for assigned records.
- Cannot access source code, global settings, private company-wide finances, secrets, unrelated leads, or unrelated projects.

### Developer

- Access only to assigned technical projects, repositories, code tasks, bugs, technical documents, deployments, and approved development tools.
- Cannot access private sales conversations, customer financial data, business-wide finances, or unrelated projects unless explicitly granted.
- Deployment and production-secret access must be separate permissions, not implied by the Developer role.

### AI Agent

- Access only to the assigned task, project, tools, and minimum necessary data.
- Receives no global access by default.
- Cannot access secrets unless a narrowly scoped backend capability explicitly requires them.
- Cannot perform destructive, financial, publishing, messaging, repository, or external actions without the required approval policy.
- Every request, tool call, result, failure, and approval must be traceable.

### Permission model rules

- Backend authorization is mandatory. Hiding interface elements is not security.
- Role and project access are independent concepts:
  - A role defines what categories of action a user may perform.
  - Project membership defines where those actions may be performed.
- Effective access is the intersection of role permissions, project membership, record assignment, and explicit grants.
- Deny by default when permission is unclear.
- Critical actions must be logged with actor, project, action, target, timestamp, result, and approval identity.
- Users may belong to multiple projects with different permissions.
- Secrets, private finances, repositories, deployments, and user administration require specific permissions.

## 4. Source of Truth

Official conflict-resolution order:

1. Actual code
2. GitHub repository
3. `PROJECT_AUDIT.md`
4. `PROJECT_STATUS.md`
5. `TASKS.md`
6. `DECISIONS.md`
7. `CHANGELOG.md`
8. Other notes

Rules:

- Executable code determines whether a feature exists.
- GitHub determines the protected technical history only after the local folder-to-repository mapping is verified.
- A feature is not complete merely because documentation says it is complete.
- When documentation conflicts with code, label the documentation outdated.
- Do not infer that unfinished, placeholder, or planned functionality works.
- Update documentation only after approval and verification.
- Never overwrite higher-authority evidence to make lower-authority documentation appear correct.
- Current exception: the authoritative local code in `bs-hunter` is not yet under Git. Until recovery is approved, actual local code remains first and the GitHub relationship remains unverified.

## 5. Required Project Files

Every active project should eventually contain:

| File | Required purpose |
|---|---|
| `PROJECT_STATUS.md` | Current factual state: active task, last completed task, verified capabilities, incomplete work, blockers, next priorities, exact run/test instructions, and deployment state. |
| `TASKS.md` | Durable task register with unique IDs, priority, status, owner/agent, dependencies, blockers, evidence, and completion conditions. |
| `DECISIONS.md` | Permanent architecture, product, security, naming, repository, data, and workflow decisions with rationale and date. |
| `DEVELOPMENT_GUIDE.md` | Beginner-safe instructions for setup, development, testing, recovery, deployment, and common troubleshooting. |
| `CHANGELOG.md` | Chronological record of verified changes. It is not a future-task list and must not claim unverified work. |
| `AGENTS.md` | Mandatory operating and safety rules for Codex, AI agents, and other coding tools working in the project. |
| `README.md` | Accurate project identity, purpose, architecture summary, prerequisites, local start instructions, tests, environment-variable names, repository, and deployment links. |

These files must describe the project that actually occupies the folder. Generic framework READMEs are not acceptable for active projects.

## 6. Standard Project Record

Every Business OS project record must include:

| Field | Definition |
|---|---|
| Project name | Official display name. |
| Project type | Business, product, asset, internal system, client project, agent, infrastructure, or experiment. |
| Business purpose | Operational reason the project exists. |
| Revenue purpose | Direct revenue, supporting revenue, cost reduction, compliance, or no direct revenue. |
| Local folder path | Exact authoritative absolute path. |
| GitHub repository | Exact verified owner/repository URL. |
| Current branch | Active Git branch or **UNKNOWN**. |
| Current status | Planned, Active, Blocked, Review, Ready, Deployed, Maintenance, Archived. |
| Completion percentage | Evidence-based weighted progress, with calculation method. |
| Current active task | One task ID/title or None. |
| Next 10 tasks | Ordered, dependency-aware list. |
| Known blockers | Technical, financial, account, approval, legal, or external blockers. |
| Assigned people or agents | Named actors and scoped responsibilities. |
| Last update | Timestamp and actor. |
| Last commit | Hash, message, branch, and push state. |
| Deployment URL | Verified environment URL or **UNKNOWN**. |
| Documentation status | Complete, Partial, Outdated, Missing, or Contradictory. |
| Risk level | Low, Medium, High, or Critical, with reason. |

Project records must distinguish verified facts from user-entered plans and automated inferences.

## 7. Workflow Between ChatGPT, Codex, GitHub, and Business OS

### ChatGPT

- Planning and prioritization.
- Architecture and product reasoning.
- Decision support and risk review.
- Prompt preparation.
- Review of results and tradeoffs.

ChatGPT does not replace code verification, repository history, backend authorization, or owner approval.

### Codex / Work

- Opens the exact approved project.
- Reads required documentation completely.
- Inspects actual code before making claims.
- Performs one approved technical task.
- Protects unrelated work and secrets.
- Tests in proportion to risk.
- Updates required documentation after verification.
- Commits and pushes only when explicitly approved and only to the verified repository.

### GitHub

- Stores official technical history.
- Keeps unrelated projects separate.
- Records branches, commits, reviews, releases, and deployment references.
- Provides rollback and collaboration history.
- Must not be treated as correct until the local project-to-remote mapping is verified.

### Business OS

- Shows project status, tasks, blockers, progress, people, agents, business metrics, GitHub status, and deployment status.
- Becomes the operational control center.
- Displays integrated data without duplicating project source code.
- Records task outcomes only after verification.

### Required sequence for every technical task

1. Identify the exact project, local path, and repository.
2. Read the project documentation.
3. Confirm the current task and scope.
4. Inspect actual code and working-tree state.
5. State the files expected to change.
6. Wait for approval when repository, data, external action, security, cost, or destructive risk exists.
7. Implement one focused task.
8. Test the result and relevant nearby behavior.
9. Update project documentation with verified facts.
10. Commit and push to the correct repository only when approved.
11. Record the verified result in Business OS.

If any step reveals an incorrect folder, remote, branch, project identity, or dirty worktree risk, stop before implementation.

## 8. Naming Rules

Official display names:

- **Business OS**
- **BS Finder**
- **BS Funds**

### BS Hunter migration rule

BS Hunter is the previous/current technical name of BS Finder. Existing references must not be renamed automatically. A controlled migration plan must first inventory and protect:

- Local folders and package names.
- Imports and component names.
- URLs and internal routes.
- localStorage keys and persisted data.
- Environment variables.
- API paths and backend identifiers.
- CSV/export names.
- GitHub repositories and branches.
- Deployment names and URLs.
- Documentation and user-visible text.

### Required project identity fields

Every project must distinguish:

- Display name: user-facing official name.
- Local folder name: filesystem identifier.
- Package name: package-manager identifier.
- GitHub repository name: source-history identifier.
- Deployment name: hosting-provider identifier.
- Internal system ID: stable database/API identifier that should not change when display names change.

These names may differ temporarily but must be explicitly mapped in the project record.

## 9. Current Priority

Official order:

1. Establish accurate project structure and source control.
2. Protect all completed work.
3. Make BS Finder operational and revenue-producing.
4. Use Business OS to control all activity.
5. Add automation and AI agents gradually.
6. Improve BS Funds only when it directly supports revenue.

Repository recovery and source protection take precedence over new features because the authoritative application is currently outside Git and the BS Funds repository has mixed uncommitted work.

## 10. BS Finder Business Pipeline

Status is based strictly on `PROJECT_AUDIT.md`.

| Pipeline step | Status | Factual basis |
|---|---|---|
| Lead discovery | Partial | Paid API and backend code exist but require billing/configuration; free Google Maps workflow, CSV import, demo data, and manual entry work. |
| Qualification | Existing | Lead scoring, rating/website filters, sorting, and dashboard prioritization exist. |
| Contact details | Existing | Phone, website, address, Maps URL, copy controls, CSV/manual normalization exist. Data completeness depends on source. |
| Demo website generation | Existing | Separate demo Website Builder and generated preview exist. |
| Demo review | Partial | Modal preview exists; no formal approval/revision workflow or shareable hosted review link. |
| Outreach | Partial | Sales scripts and WhatsApp opening exist; no automated outreach or verified delivery. |
| Proposal | Partial | Proposal Generator and action tracking exist; no editable templates, acceptance, verified delivery, or complete PDF workflow. |
| Follow-up | Partial | Lead CRM notes, status, dates, and priority logic persist locally; no global/cloud/multi-user follow-up system. |
| Payment | Missing | No payment checkout or paid-customer state. |
| Real website creation | Partial | Real Website Builder V1 intake, templates, generation, project storage, status, and preview exist. Task 19.1 premium upgrade is interrupted and not production-build verified. |
| Customer approval | Missing | No formal approval/revision/sign-off workflow. |
| Delivery | Missing | No production delivery workflow. |
| Hosting / maintenance | Missing | No domain, hosting, publishing, rollback, or maintenance system. |
| Upsell | Missing | No implemented upsell workflow. |
| Retention | Missing | No customer-success, support, renewal, or retention system. |

No pipeline step may be upgraded to Existing without code and workflow verification.

## 11. Business OS Core Modules

Priority: **P0** critical foundation/revenue, **P1** high, **P2** medium, **P3** later.

| Module | Purpose | Current factual status | Priority | Dependencies |
|---|---|---|---|---|
| Owner Dashboard | Unified owner view of businesses, revenue, risks, work, and next actions. | Partial: live lead cards and Mission Control exist; not global or multi-business. | P1 | Project registry, CRM, finance, auth. |
| Projects | Register and monitor every project. | Partial: Project Command Center exists, but no authoritative multi-project registry or live repository connection. | P0 | Source mapping, task data, GitHub integration. |
| Tasks | Create, prioritize, assign, filter, and complete work. | Existing locally with CRUD, sorting, categories, pagination, and localStorage; no cloud sync or authorization. | P1 | Authentication, database for production. |
| Users | Manage people and memberships. | Missing. | P0 | Authentication, database. |
| Roles & Permissions | Enforce role, project, record, and action access. | Missing. | P0 | Users, backend authorization, audit log. |
| Sales Center | Support outreach scripts and sales activity. | Partial: lead-specific scripts/copy actions exist; no full activity/outcome system. | P1 | CRM, assignments, audit log. |
| CRM | Manage leads, customers, stages, follow-ups, and history. | Partial: lead-level local controls exist; global CRM screen is placeholder. | P0 | Database, users, assignments. |
| Finance | Track payments, revenue, costs, cash flow, and performance. | Missing except zero placeholders and task revenue-impact values. | P0 | Payment, database, permissions. |
| AI Center | Provide controlled AI assistance. | Partial: UI/backend/status/chat/actions exist; requires key/billing for live responses. | P2 | Backend deployment, billing, permissions, audit log. |
| Agent Activity | Show agent assignments, actions, approvals, and failures. | Missing; only labels/activity metadata exist. | P2 | Agent framework, permissions, audit log. |
| Documents | Central project and operational documentation. | Partial: summary cards exist; browser does not read/write markdown documents. | P2 | Document service, permissions, storage. |
| Known Issues | Register and prioritize confirmed issues. | Partial: static known-issue list exists in project data. | P1 | Project registry, tasks. |
| Integrations | Manage external systems and configuration status. | Partial: Google Sheets, Apify, and OpenAI code exist; no central integration manager. | P1 | Backend, secrets management, permissions. |
| GitHub Status | Show repositories, branches, commits, dirty/push/deployment state. | Missing. | P0 | Verified source mapping, GitHub integration. |
| Deployments | Track environments, releases, health, and rollback. | Missing except static-build preparation. | P0 | Verified repository, host, CI/CD, audit log. |
| Audit Log | Trace critical user, agent, repository, financial, and deployment actions. | Missing. | P0 | Authentication, backend event model. |
| Settings | Manage project/system preferences and controlled integrations. | Placeholder. | P1 | Permissions, secure backend configuration. |
| Light/Dark Mode | User-selectable accessible appearance. | Missing; current Business OS is light-only. | P3 | Stable design system. |
| Language Settings | Manage English, Hebrew, Arabic, Russian, RTL/LTR. | Existing for the current interface with persisted language; generated content remains uneven in some modules. | P2 | Translation governance/testing. |

## 12. Safety Rules

- Never delete a project without a confirmed, tested backup.
- Never overwrite one project with another.
- Never push to an unverified repository.
- Never print or commit secret values.
- Never rename folders, repositories, packages, routes, storage keys, environment variables, or deployments without a migration plan.
- Never mix Business OS, BS Finder, and BS Funds source unintentionally.
- Never mark a feature complete without inspecting and testing the code.
- Never start a feature before identifying the exact project, repository, branch, working-tree state, and current task.
- Never force-push or use destructive Git recovery during project reconciliation.
- Preserve dirty working trees before cleanup.
- Keep operational data access least-privileged.
- Require owner approval for destructive, financial, repository, deployment, secret, external messaging, and autonomous-agent actions.

## 13. Decision Log

Confirmed decisions:

1. Business OS is the parent management system.
2. BS Finder is the primary revenue business.
3. BS Hunter is the old/current technical name and requires a controlled migration.
4. BS Funds is a reusable asset, not the main business.
5. Future projects belong under Business OS.
6. Owner access is unrestricted.
7. Manager, Sales Agent, Developer, and AI Agent access is limited by role and project.
8. Permissions must be enforced by the backend.
9. Revenue comes before unnecessary feature expansion.
10. Automation and AI agents come after the core business process works reliably.
11. Central management data does not justify accidental source duplication.
12. Every project requires an authoritative local folder, verified repository, documentation set, and task state.

## 14. Current Factual Project Mapping

| Official project | Current authoritative local folder | Package | Repository | Mapping status |
|---|---|---|---|---|
| Business OS + BS Finder current combined implementation | `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter` | `bs-hunter` | Recommended destination: `kammmartin7-rgb/business-os` | **UNVERIFIED**: local folder has no Git; remote is non-empty and must be inspected first. |
| Standalone Business OS folder | `/Users/sdfghjklpoiuytrewq/my-website/business-os` | `business-os` | None | Not the real Business OS; unused starter. |
| BS Funds | `/Users/sdfghjklpoiuytrewq/my-website/first ever` | `first-ever` | `kammmartin7-rgb/bs-funds` | Verified remote mapping, but working tree is dirty and contains mixed BS Hunter work. |
| BS Finder standalone repository | **UNKNOWN** | **UNKNOWN** | No `kammmartin7-rgb/bs-finder` or `bs-hunter` repository found | Architectural decision pending: module inside Business OS or later separate repository. |

## 15. Next Action

### One safest next action

Perform a **read-only repository reconciliation and backup plan** before any feature work or push.

### Exact project folder

`/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`

### Exact intended repository

`https://github.com/kammmartin7-rgb/business-os.git`

### Expected outcome

- Preserve the current combined Business OS + BS Finder implementation.
- Inspect the non-empty private `business-os` remote in isolation.
- Compare remote and local histories/content without overwriting either.
- Produce an approved import/branch strategy.
- Preserve the dirty BS Funds working tree before separating mixed code.
- Establish an authoritative local-folder-to-repository map.

### Risks

- The `business-os` remote is non-empty and its contents/latest message are **UNKNOWN**.
- Initializing or pulling directly into `bs-hunter` could create history conflicts or overwrite work.
- Pushing `bs-hunter` without reconciliation could replace or conflict with remote Business OS code.
- The BS Funds working tree contains large uncommitted mixed changes that could be lost or accidentally pushed.
- Task 19.1 is interrupted and the latest source lacks fresh production-build verification.

### Owner approval required

The Owner must approve:

1. Creation and location of backups.
2. Read-only cloning/inspection of the private Business OS remote.
3. The authoritative source-of-truth mapping.
4. The Git import/branch/merge strategy.
5. Preservation and separation strategy for the dirty BS Funds tree.
6. Whether BS Finder remains a module in Business OS or later receives a separate repository.
7. Whether interrupted Task 19.1 should be completed or reverted after source protection.

No push, rename, move, cleanup, reset, merge, or new feature should begin before these approvals.
