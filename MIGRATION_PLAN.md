# Business Ecosystem Migration Plan

Plan date: 2026-07-11  
Factual sources: `PROJECT_AUDIT.md` and `MASTER_ARCHITECTURE.md`  
Execution status: **PLAN ONLY — NOT STARTED**  

This document defines a non-destructive migration from the current mixed folder/repository state into separately owned Business OS, BS Finder, and BS Funds projects. Commands shown below are future commands for an approved execution task. They have not been run as part of this plan.

## 1. Current State Map

### Business OS

| Field | Current fact |
|---|---|
| Official display name | Business OS |
| Current technical name | Business OS UI is embedded in package/folder `bs-hunter`; a separate `business-os` starter also exists |
| Exact local folder | Working implementation: `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`; unused starter: `/Users/sdfghjklpoiuytrewq/my-website/business-os` |
| Git status | Neither folder is a Git repository |
| GitHub repository | Intended: `https://github.com/kammmartin7-rgb/business-os.git`; verified non-empty; content/latest message **UNKNOWN** |
| Current purpose | Owner dashboard and control layer for projects, tasks, status, leads, AI, and future business operations |
| Code currently present | Dashboard, sidebar, Project Command Center, Tasks, Mission Control, BS Funds shell, AI Center, translations, placeholders, and BS Finder screens/data in the same application |
| Documentation present | Complete project-memory set exists in `bs-hunter`; standalone `business-os` has only generic Vite README |
| Known risks | Correct Business OS code is outside Git; intended remote is non-empty; standalone folder is misleading; separation can break shared state/navigation |

### BS Finder

| Field | Current fact |
|---|---|
| Official display name | BS Finder |
| Current technical name | BS Hunter / `bs-hunter` |
| Exact local folder | `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter` |
| Git status | Not a Git repository; current work is not protected by commits |
| GitHub repository | `kammmartin7-rgb/bs-finder` and `kammmartin7-rgb/bs-hunter` were not found |
| Current purpose | Primary revenue business: lead discovery through demo, outreach, proposal, follow-up, payment, real website, and customer delivery |
| Code currently present | Lead sources/search, imports, lead table, filters/scoring, CRM, Google Sheets, proposals, demo builder, Sales Center, WhatsApp, action tracking, and Real Website Builder V1 |
| Documentation present | Combined Business OS/BS Hunter documentation in the current root; no separate BS Finder documentation set |
| Known risks | No source-control history; official/technical names differ; operational code is coupled to Business OS shell; Task 19.1 is interrupted and not build-verified |

### BS Funds

| Field | Current fact |
|---|---|
| Official display name | BS Funds |
| Current technical name | Local folder `first ever`, package `first-ever` |
| Exact local folder | `/Users/sdfghjklpoiuytrewq/my-website/first ever` |
| Git status | Git repository on branch `2026-07-03-4wn4`; committed tip matches its origin branch; very large dirty working tree with modified, added, deleted, and untracked files |
| GitHub repository | `https://github.com/kammmartin7-rgb/bs-funds.git` |
| Current purpose | Hebrew finance/loan example website and reusable asset |
| Code currently present | Finance marketing site plus uncommitted dashboard, BS Hunter/lead-finder, server, and agent code that does not belong in the final BS Funds project |
| Documentation present | Generic Vite README only; no complete project-memory set |
| Known risks | Highest immediate loss/mis-push risk: uncommitted mixed work could be lost or accidentally published to BS Funds |

### Other ambiguous copies

- `/Users/sdfghjklpoiuytrewq/my-website` is both the parent folder and a separate generic finance React project.
- `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter.zip` is a snapshot, not authoritative source control.
- `/Users/sdfghjklpoiuytrewq/my-website/first ever.zip`, both `first ever_fixed` folders, and `bs-funds-bdi-fixed.zip` overlap with BS Funds.
- `/Users/sdfghjklpoiuytrewq/Downloads/business-os-deploy.zip` is compiled output, not source.

## 2. Target Final Structure

Recommended final local structure after approved migration:

```text
/Users/sdfghjklpoiuytrewq/Business/
├── business-os/       # Owner management application only
├── bs-finder/         # Revenue-producing operational application
├── bs-funds/          # Independent reusable finance asset
└── archives/          # Read-only, dated pre-migration backups and manifests
```

The repositories should remain separate. Business OS may display BS Finder and BS Funds data through explicit APIs/integration packages; it must not contain accidental full source copies.

### Target identity records

| Project | Recommended local folder | Package name | GitHub repository | Internal project ID | Display name |
|---|---|---|---|---|---|
| Business OS | `/Users/sdfghjklpoiuytrewq/Business/business-os` | `business-os` | `kammmartin7-rgb/business-os` | `business-os` | Business OS |
| BS Finder | `/Users/sdfghjklpoiuytrewq/Business/bs-finder` | `bs-finder` | `kammmartin7-rgb/bs-finder` | `bs-finder` | BS Finder |
| BS Funds | `/Users/sdfghjklpoiuytrewq/Business/bs-funds` | `bs-funds` | `kammmartin7-rgb/bs-funds` | `bs-funds` | BS Funds |

`kammmartin7-rgb/bs-finder` does not currently exist. Repository creation requires owner approval. Until the naming migration phase, the stable internal ID and technical package may temporarily remain `bs-hunter` to protect routes and stored data.

### Target responsibilities

#### Business OS

- Owner dashboard and management layer.
- Projects, users, roles, permissions, tasks, agents, issues, documents, integrations, GitHub status, deployments, sales/financial summaries, and audit logs.
- Holds integration views/contracts, not duplicated operational source.

#### BS Finder

- Lead discovery and qualification.
- Demo website generation and review.
- Outreach, proposals, follow-up, payment, real website delivery, hosting/maintenance, and customer management.
- Owns lead/CRM operational data and exposes approved summaries to Business OS.

#### BS Funds

- Independent finance website asset/template.
- Contains only its website, its own services/configuration, and project documentation.
- Contains no accidental Business OS or BS Finder source.

## 3. Code Ownership Map

Classification applies to the current authoritative combined source at `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter` unless stated otherwise.

| Current area | Owner classification | Explanation / migration treatment |
|---|---|---|
| `src/components/BusinessOS/` | Business OS | Dashboard, sidebar, Tasks, Mission Control, BS Funds summary shell, and OS navigation. Move conceptually to Business OS; replace direct BS Finder implementation coupling with integration contracts. |
| `src/components/AICenter/` | Business OS | Central project/task assistant. Its backend contract may become shared, but the management UI belongs to Business OS. |
| `src/components/LeadCRM/` | BS Finder | Lead-level operational CRM and action history. Business OS should consume summaries rather than own duplicate storage. |
| `src/components/ManualLead/` | BS Finder | Lead acquisition and deduplication workflow. |
| `src/components/Projects/` | Business OS | Project Command Center and project status presentation. |
| `src/components/RealWebsiteBuilder/` | BS Finder | Paid-customer production website workflow. Preserve interrupted Task 19.1 state until verified. |
| `src/components/SalesCenter/` | BS Finder | Prospect sales scripts and sales workflow. |
| `src/components/WebsiteBuilder/` | BS Finder | Demo website generator and preview. |
| `src/components/ProposalGenerator.jsx` | BS Finder | Lead proposal workflow. |
| `src/components/LanguageSwitcher/` | Shared | Reusable language UI; initially copy with provenance into each app or extract only after both apps work independently. |
| `src/components/ProductionErrorBoundary*` | Shared | Generic production safety component; can be retained independently in each app or extracted later. |
| `src/context/` | Shared | Current language context is reusable. Do not prematurely create a shared package before independent builds work. |
| `src/i18n/` | Shared with project-specific content | Translation infrastructure is shared; strings must be separated by owning project/module. |
| `src/services/leads.js` | BS Finder | Lead-search client and mapping. |
| `src/services/googleSheets.js` | BS Finder | Lead export integration. |
| `src/services/` overall | Mixed | Inspect each file. Current known services are BS Finder; future GitHub/project integrations belong to Business OS. |
| `src/utils/leadScore.js`, `src/utils/csvImport.js` | BS Finder | Lead qualification/import logic. |
| `src/utils/` overall | Mixed/Shared | Classify file-by-file; generic helpers may be shared, lead helpers remain BS Finder. |
| `src/App.jsx` | Mixed | Contains BS Finder application state and lead UI wrapped by Business OS. Must be decomposed carefully rather than copied blindly. |
| `src/App.css` | Mixed | Contains BS Finder and lead-action styles; Business OS styles are mostly component-local. Audit selectors before separation. |
| `src/main.jsx`, `src/index.css` | Shared/bootstrap | Each target app needs its own entry point and global styles. Preserve providers/error boundary behavior. |
| `server/services/apify.js` | BS Finder | Paid lead-search backend provider. |
| `server/services/openaiService.js` | Shared service / Business OS initially | Secure AI backend is currently used by AI Center. If BS Finder later uses AI, expose a scoped service rather than duplicate secrets. |
| `server/index.js` | Mixed | Hosts BS Finder lead routes and Business OS AI routes. Split by route ownership after behavior tests exist. |
| `server/` overall | Mixed | Separate into project backends or a deliberately governed API service; do not copy secrets. |
| `google-apps-script/` | BS Finder | Receives lead export data. |
| `public/_redirects` | Shared deployment pattern | Each independently deployed SPA may need its own verified rewrite configuration. |
| `public/favicon.svg`, `public/icons.svg` | Unknown/Shared | Verify branding and consumers before copying. Do not assume the same assets fit all projects. |
| `public/` overall | Mixed | Classify branding and deployment files individually. |
| `PROJECT_AUDIT.md`, `MASTER_ARCHITECTURE.md`, `MIGRATION_PLAN.md` | Shared governance / Business OS root | Preserve as ecosystem-level governance documents; each project should also have project-specific docs. |
| `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md`, `DEVELOPMENT_GUIDE.md`, `CHANGELOG.md`, `AGENTS.md` | Mixed transitional documentation | Current files describe the combined app. Split into factual Business OS and BS Finder copies only after code separation and verification. |
| `README.md` | Legacy | Generic Vite README; replace later with accurate project-specific README after separation. |
| `.env` | Mixed/Secret configuration | Never copy blindly or commit. Inventory variable names only, then create target-specific local environment files manually. |
| `.env.example` | Mixed documentation | Split variable names by owning backend/frontend; ensure it contains no values. |
| `.gitignore`, lint/Vite/package files | Shared pattern, project-specific output | Recreate/adjust for each target; do not assume package names or commands remain identical. |
| `dist/` | Build output / Legacy | Never use as source. Regenerate independently after migration. |
| `node_modules/`, `server/node_modules/` | Build dependency output / Duplicate | Never migrate as source; reinstall only after an approved execution phase. |
| `bs-hunter.zip`, deploy ZIPs | Backup/Legacy | Retain as labeled evidence until recovery is verified; never merge as source. |
| `/my-website/business-os` source | Legacy/Unknown | Unused Vite starter. Preserve for comparison, but do not treat it as the developed Business OS. |
| `/my-website/first ever` finance UI | BS Funds | Authoritative local Git checkout subject to dirty-worktree preservation. |
| BS Hunter files inside `first ever` | Duplicate/Mixed | Potential earlier work or experiments. Preserve and compare; do not assume they are newer than `bs-hunter`. |

## 4. Repository Reconciliation Plan

All steps in this section are read-only until the owner approves a later write phase.

### 4.1 Verify `kammmartin7-rgb/business-os`

Use a new isolated inspection directory outside every active project. Future approved read-only commands:

```bash
git ls-remote --heads --tags https://github.com/kammmartin7-rgb/business-os.git
git clone --no-checkout https://github.com/kammmartin7-rgb/business-os.git /approved/inspection/business-os-remote
git -C /approved/inspection/business-os-remote log --all --oneline --decorate --graph
git -C /approved/inspection/business-os-remote branch -a -vv
git -C /approved/inspection/business-os-remote remote -v
```

Then inspect its tree, package identity, documentation, commit dates, branches, and any deployment files. Do not add the remote to local `bs-hunter` yet.

### 4.2 Verify `kammmartin7-rgb/bs-funds`

From the current checkout, capture only read-only evidence:

```bash
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' status --short --branch
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' remote -v
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' branch -vv
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' log --all -n 20 --oneline --decorate
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' diff --stat
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' diff --cached --stat
```

Compare committed BS Funds paths against uncommitted additions and identify every BS Hunter-related file before any cleanup.

### 4.3 Verify any BS Hunter / BS Finder repository

Current audit result: no requested repository exists. Recheck immediately before migration because remote state can change:

```bash
git ls-remote https://github.com/kammmartin7-rgb/bs-hunter.git
git ls-remote https://github.com/kammmartin7-rgb/bs-finder.git
```

If either exists, stop and inspect it independently. Do not create or push until the owner selects the final repository relationship.

### 4.4 Verify local `bs-hunter`

Capture:

- Full file manifest and hashes, excluding nothing from the backup manifest.
- Separate source manifest excluding `node_modules`, `dist`, logs, and `.env` values.
- Package names and lockfile versions.
- Source modification times.
- Current lint/build state.
- Environment-variable names only.
- Existing archives and their hashes.

Confirm again that no parent `.git` directory controls the folder.

### 4.5 Determine newest/authoritative code

Do not decide by folder name or modification time alone. For each overlapping area:

1. Compare functionality and tests.
2. Compare source hashes and structural differences.
3. Compare commit history where available.
4. Compare documentation evidence.
5. Identify unique code that exists in only one location.
6. Mark uncertain ownership **UNKNOWN**.
7. Require owner selection before discarding any variant.

### 4.6 Secret exposure inspection

- List environment-variable names only.
- Confirm `.env`, credentials, tokens, private keys, local databases, and customer exports are ignored.
- Search tracked history for secret patterns using a dedicated scanner only after approval.
- Never print matches containing values into chat or project documents.
- If a secret may have been committed, rotate it before repository publication.

## 5. Backup Plan

Backups must precede every Git or filesystem write.

### 5.1 Backup location

Owner must approve an external or dedicated location with sufficient free space, for example:

```text
/Users/sdfghjklpoiuytrewq/BusinessMigrationBackups/2026-07-11-pre-migration/
```

An external drive or separately protected cloud backup is preferred. The current ZIPs are useful but are not sufficient as the only backup.

### 5.2 Full local folder backups

Future approved commands should preserve metadata and include hidden files:

```bash
ditto '/Users/sdfghjklpoiuytrewq/my-website/bs-hunter' '/approved/backup/bs-hunter-full'
ditto '/Users/sdfghjklpoiuytrewq/my-website/business-os' '/approved/backup/business-os-full'
ditto '/Users/sdfghjklpoiuytrewq/my-website/first ever' '/approved/backup/bs-funds-full'
```

Also back up the generic root project and all relevant ZIP/extracted copies because they may contain unique history.

### 5.3 Git safety snapshots

For BS Funds, first preserve the entire folder. Then, only with approval, create both:

- A binary diff/patch plus untracked-file inventory.
- A dedicated safety branch with a preservation commit that is **not pushed** until reviewed.

Potential future commands:

```bash
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' diff --binary > /approved/backup/bs-funds-working.patch
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' diff --cached --binary > /approved/backup/bs-funds-index.patch
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' ls-files --others --exclude-standard > /approved/backup/bs-funds-untracked.txt
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' switch -c safety/pre-separation-2026-07-11
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' add -A
git -C '/Users/sdfghjklpoiuytrewq/my-website/first ever' commit -m 'Safety snapshot before project separation'
```

The folder copy is mandatory because a patch does not inherently include untracked file contents. A tag alone cannot preserve uncommitted work.

For `bs-hunter` and the starter `business-os`, no Git snapshot is currently possible without creating repositories. Preserve full folder backups and hash manifests first.

### 5.4 Environment inventory

Create a redacted manifest containing only:

- Variable name.
- Owning project.
- Frontend-visible or backend-only classification.
- Required/optional classification.
- Environment where it is used.

Never include values. Confirm `.env` files are included only in encrypted/private backup storage, never in migration source commits.

### 5.5 Recovery checkpoint

Before continuing, verify:

- Backup folder counts and byte sizes match sources within expected metadata differences.
- Random file samples and every critical source/document hash match.
- Git repositories in backups preserve `.git` and pass `git fsck`.
- BS Funds backup reproduces the exact dirty `git status`.
- Environment files exist in the protected backup but not in publishable source archives.
- A written restore command/path exists for each project.
- Owner signs off on the checkpoint manifest.

## 6. Safe Migration Phases

Every phase is a separate approved task. Do not batch phases.

### Phase 0 — Freeze and Backup

- **Purpose:** Stop state drift and preserve every version before changes.
- **Source folders:** `my-website/bs-hunter`, `my-website/business-os`, `my-website/first ever`, root project, related ZIPs/copies.
- **Destination:** Owner-approved dated backup location.
- **Files affected:** Backup copies and manifests only; active sources unchanged.
- **Future commands:** `ditto`, `find`, `shasum`, read-only Git status/log; optional approved safety branch only after full copy.
- **Risks:** Incomplete copy, insufficient disk space, accidental secret exposure in a public location.
- **Verification:** Counts, sizes, hashes, `git fsck`, dirty-state reproduction, restore test.
- **Rollback:** No source change; discard/recreate incomplete backup.
- **Owner approval required:** **YES** — backup location and handling of secret-bearing files.

### Phase 1 — Verify Every Repository

- **Purpose:** Establish authoritative remote contents and histories.
- **Source:** GitHub `business-os`, `bs-funds`, any newly existing `bs-hunter`/`bs-finder`; local Git metadata.
- **Destination:** Isolated read-only inspection directories.
- **Files affected:** Inspection clones only.
- **Future commands:** `git ls-remote`, isolated `git clone --no-checkout`, `git log`, `git branch`, `git remote`, tree comparisons.
- **Risks:** Cloning into a wrong/active folder; accidentally exposing private code.
- **Verification:** Remote URL, HEAD, branches, tags, latest commits, tree manifests recorded.
- **Rollback:** Delete only the approved inspection copy after evidence is preserved; active sources remain unchanged.
- **Owner approval required:** **YES** — private remote inspection and destination.

### Phase 2 — Protect Current `bs-hunter` Code

- **Purpose:** Put the current valuable combined source under recoverable version control without touching verified remotes.
- **Source:** `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`.
- **Destination:** A new local protected working copy, not the active folder and not yet connected to GitHub.
- **Files affected:** Copied source, new local `.git`, redacted ignore configuration; no active source edits.
- **Future commands:** `ditto`/`rsync`, `git init`, `git add`, `git commit`, local tag after secret scan.
- **Risks:** Committing `.env`, customer exports, dependencies, build output, or interrupted code without labeling it.
- **Verification:** Secret scan, clean Git status after commit, source hash equivalence, lint/build evidence labeled with exact commit.
- **Rollback:** Delete the new protected copy and restore from Phase 0; original remains untouched.
- **Owner approval required:** **YES** — creation of Git history and inclusion/exclusion manifest.

### Phase 3 — Separate Business OS Management Code

- **Purpose:** Create a Business OS-only application from the combined code.
- **Source:** Protected combined copy from Phase 2.
- **Destination:** `/Users/sdfghjklpoiuytrewq/Business/business-os` or owner-approved equivalent.
- **Files affected:** BusinessOS, Projects, Tasks, Mission Control, AI Center, shared bootstrapping, selected translations/styles, documentation, package files.
- **Future commands:** File-copy tools, explicit patches, package script updates; no blind recursive move.
- **Risks:** Breaking dashboard lead metrics, task storage, navigation, translations, AI context, or Project Command Center assumptions.
- **Verification:** Independent start/build/lint; dashboard/projects/tasks/status work; no full BS Finder lead application bundled; integration placeholders fail safely.
- **Rollback:** Remove destination only after confirming source and backups remain; restore destination from phase-start tag.
- **Owner approval required:** **YES** — ownership boundary and destination.

### Phase 4 — Preserve BS Finder Operational Code

- **Purpose:** Create an independent revenue application without losing current behavior.
- **Source:** Protected combined copy from Phase 2.
- **Destination:** `/Users/sdfghjklpoiuytrewq/Business/bs-finder`.
- **Files affected:** Lead UI/state, CRM, ManualLead, demo/real Website Builders, Sales Center, Proposal Generator, lead services/utils, Apify backend, Google Apps Script, relevant translations/styles/docs.
- **Future commands:** Explicit copy/patch, package and entry-point creation; retain temporary `bs-hunter` technical IDs where migration-sensitive.
- **Risks:** Losing localStorage compatibility, lead IDs, dashboard handoff, action tracking, source modes, Google Sheets payload, or Real Website Builder work.
- **Verification:** Full BS Finder checklist in Section 8 plus stored-data compatibility test.
- **Rollback:** Restore destination from phase-start tag/copy; combined protected source remains unchanged.
- **Owner approval required:** **YES** — project boundary and new repository identity.

### Phase 5 — Clean BS Funds Safely

- **Purpose:** Return BS Funds to an independent finance asset while preserving every mixed change for comparison.
- **Source:** `/Users/sdfghjklpoiuytrewq/my-website/first ever` plus Phase 0 backup/safety branch.
- **Destination:** `/Users/sdfghjklpoiuytrewq/Business/bs-funds` or an approved clean checkout/worktree.
- **Files affected:** Only after classification: remove unrelated BS Hunter code from the clean BS Funds target; never delete it from backups/safety branch.
- **Future commands:** `git worktree` or clean clone, path-by-path comparison, selective commit; never `reset --hard`.
- **Risks:** Highest risk phase—unique uncommitted work could be lost or incorrectly assigned.
- **Verification:** Original finance site features/start/build; no BS Finder routes/services/agents; safety snapshot still reproduces all removed content.
- **Rollback:** Return to safety branch/worktree or restore full backup.
- **Owner approval required:** **YES** — every removal/ownership decision and commit.

### Phase 6 — Establish Correct Git Remotes

- **Purpose:** Connect each verified project to exactly one correct repository.
- **Source:** Independently verified local target projects.
- **Destination:** `business-os`, new/approved `bs-finder`, existing `bs-funds` repositories.
- **Files affected:** `.git/config`, branches, commits; no source changes unless reconciliation requires reviewed conflict resolution.
- **Future commands:** `git remote add`, `git fetch`, comparison branches, reviewed merges/imports, `git push` only after separate approval.
- **Risks:** Non-empty Business OS remote conflict, wrong-repository push, history overwrite, secret publication.
- **Verification:** Remote URLs, branch tracking, `git log`, `git status`, secret scan, remote branch comparison; no force operations.
- **Rollback:** Remove incorrect local remote mapping; restore local repository backup. Remote rollback requires a separate owner-approved plan.
- **Owner approval required:** **YES** — remote mapping, repository creation, reconciliation, and every first push.

### Phase 7 — Update Documentation

- **Purpose:** Make every project self-describing and align ecosystem governance.
- **Source:** Current governance docs and verified separated code.
- **Destination:** Required seven-file documentation set in each project; ecosystem master docs in Business OS governance scope.
- **Files affected:** README and required markdown only.
- **Future commands:** Explicit file edits and documentation validation.
- **Risks:** Copying combined/outdated claims into separated projects.
- **Verification:** Every claim checked against code; paths/remotes/commands work; unknowns labeled.
- **Rollback:** Revert documentation commit.
- **Owner approval required:** **NO** for factual updates within approved mappings; **YES** for new architecture/naming decisions.

### Phase 8 — Test All Projects Independently

- **Purpose:** Prove separation did not lose functionality.
- **Source:** Three target projects.
- **Destination:** Generated test/build artifacts only.
- **Files affected:** `dist`, logs, test artifacts; source changes require a new scoped fix task.
- **Future commands:** project-specific install, lint, build, dev/smoke tests after approval.
- **Risks:** Hidden reliance on combined imports, localStorage, shared ports, environment files, or backend routes.
- **Verification:** Section 8 checklists with evidence and exact commit hashes.
- **Rollback:** Restore phase-start tags; do not patch multiple projects in one task.
- **Owner approval required:** **YES** for package installation/network/external integration tests; **NO** for already-installed local lint/build if authorized.

### Phase 9 — Connect Project Status into Business OS

- **Purpose:** Display BS Finder and BS Funds state centrally without source duplication.
- **Source:** Verified project metadata/APIs/GitHub data.
- **Destination:** Business OS integration layer.
- **Files affected:** Project registry, integration adapters, status UI, backend authorization/audit code.
- **Future commands:** Focused implementation and tests, not filesystem copying.
- **Risks:** Leaking secrets/customer data, creating a second source of truth, excessive permissions.
- **Verification:** Read-only status matches repositories/projects; scoped permissions; failures do not corrupt project data.
- **Rollback:** Disable/revert adapter; independent projects remain operational.
- **Owner approval required:** **YES** — data access, GitHub credentials, user permissions.

### Phase 10 — Controlled BS Hunter → BS Finder Naming Migration

- **Purpose:** Align display and technical names without breaking persisted data or integrations.
- **Source:** Stable, tested BS Finder project.
- **Destination:** Approved BS Finder identities and repository/deployment names.
- **Files affected:** See Section 7 inventory; performed in staged commits.
- **Future commands:** Search inventory, compatibility aliases/migrations, repository/deployment rename only after owner approval.
- **Risks:** Broken imports, routes, localStorage, API URLs, environment configuration, bookmarks, deployments, and history.
- **Verification:** Old links/data remain supported or migrated; all builds/tests/deployments pass; rollback aliases documented.
- **Rollback:** Revert staged commits and repository/deployment rename where provider permits; restore aliases.
- **Owner approval required:** **YES** — every external or persistent identifier rename.

## 7. Naming Migration Plan

Do not rename anything until Phases 0–9 are complete enough to protect and independently test BS Finder.

### Change difficulty and risk

| Identifier | Proposed result | Risk | Plan |
|---|---|---|---|
| Display text | BS Finder | Low | Change translations/UI first while retaining technical IDs. |
| Documentation | BS Finder with “formerly BS Hunter” migration note | Low | Update after code/repository mapping is verified. |
| Local folder | `bs-finder` | Medium | Change only when no process/tool depends on absolute path; update guides and deployment scripts. |
| Package name | `bs-finder` | Medium | Update package/lock metadata and CI references; rebuild. |
| GitHub repository | `kammmartin7-rgb/bs-finder` | High | Repository does not exist; owner must decide/create and preserve redirects/history. |
| Imports/components | Prefer neutral or BS Finder names | Medium/High | Inventory all `BsHunter`, `BSHunter`, `bsHunter` symbols; change in staged commits with tests. |
| Environment-variable prefixes | `BS_FINDER_*` where project-specific | High | Support old names temporarily; secrets/config must be updated in every environment. |
| Deployment name | `bs-finder` | High | Hosting URLs, DNS, CI, CORS, and API base URLs can break. Use provider aliases/redirects. |
| URLs/routes | `/bs-finder` | High | Keep `/bs-hunter` compatibility redirect/alias until usage is proven migrated. |
| localStorage/database keys | Stable IDs preferred | Critical | Do not rename directly. Add versioned read-old/write-new migration with backup and idempotent tests. |
| Internal project ID | `bs-finder` recommended | Critical if existing data exists | Current persisted usage is **UNKNOWN**. Establish stable ID through a migration record; never infer from display name. |
| CSV/export filenames | `bs-finder-*` | Low | Change after display migration; does not change lead schema. |

### Required order

1. Inventory every exact case/format of Hunter identifiers.
2. Define permanent internal ID and compatibility duration.
3. Change display text and documentation.
4. Add route/storage/config compatibility aliases.
5. Change code symbols/imports in small commits.
6. Change package/folder only after tools and deployments are mapped.
7. Create/rename repository and deployment only with owner approval.
8. Monitor old route/config/storage reads before removing aliases.

## 8. Verification Checklist

### Business OS

- [ ] Starts independently from its authoritative folder.
- [ ] Production build and lint pass at the recorded commit.
- [ ] Dashboard renders without BS Finder being locally mounted as the full child application.
- [ ] Projects registry displays Business OS, BS Finder, and BS Funds accurately.
- [ ] Tasks, Mission Control, progress, blockers, and project status work.
- [ ] AI Center fails safely without backend configuration.
- [ ] Four languages and RTL/LTR work.
- [ ] Does not bundle the complete lead table, demo builder, proposal generator, Sales Center, or BS Finder backend accidentally.
- [ ] Any BS Finder metrics arrive through an explicit, permission-scoped integration.

### BS Finder

- [ ] Starts independently from its authoritative folder.
- [ ] Production build and lint pass at the recorded commit.
- [ ] Free Mode, CSV import, demo mode, and manual lead entry still work.
- [ ] Paid search fails safely when unavailable and works only when correctly configured.
- [ ] Lead results display with filters, sorting, and scoring.
- [ ] Phone and website copy controls work.
- [ ] Google Sheets save works where configured and fails clearly otherwise.
- [ ] Proposal Generator opens with the selected lead.
- [ ] Demo website generation and modal preview work.
- [ ] Sales Center and WhatsApp action work.
- [ ] CRM status, notes, follow-up, and action history persist with existing data.
- [ ] Real Website Builder projects, drafts, statuses, lead prefill, and full preview remain intact.
- [ ] Task 19.1 is either completed and verified or explicitly reverted; no ambiguous partial state remains.
- [ ] No demo lead affects real statistics.
- [ ] No Business OS-only project/task management source is accidentally bundled.

### BS Funds

- [ ] Starts independently from the verified BS Funds repository/worktree.
- [ ] Production build and lint pass at the recorded commit.
- [ ] Original finance homepage, calculator, eligibility, contact, document upload, FAQ, testimonials, WhatsApp, and privacy behavior remain.
- [ ] No accidental BS Finder routes, lead providers, agents, API client, or server code remains in the clean target.
- [ ] Every removed mixed file remains recoverable in backup/safety branch.
- [ ] Remote remains `kammmartin7-rgb/bs-funds`.
- [ ] The project can be archived, templated, or reused without depending on Business OS/BS Finder source.

## 9. Do Not Lose List

### Ecosystem governance

- `PROJECT_AUDIT.md`
- `MASTER_ARCHITECTURE.md`
- `MIGRATION_PLAN.md`
- Existing `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md`, `DEVELOPMENT_GUIDE.md`, `CHANGELOG.md`, and `AGENTS.md`
- The complete 100+ task roadmap and project-status rules

### Business OS

- Dashboard live counts and demo-lead exclusion.
- Clickable dashboard filters.
- Sidebar/internal navigation.
- Project Command Center, progress calculation, active/next tasks, issues, revenue flow, and documents view.
- Tasks CRUD, sorting, categories, pagination, starter-roadmap migration, and localStorage keys.
- Mission Control top-priority selection.
- BS Funds summary shell.
- AI Center frontend, backend status/chat endpoints, safe no-key behavior, four actions, and non-sensitive activity log.
- Four-language translation system, language persistence, and RTL/LTR behavior.
- Production error boundary and static rewrite fallback.

### BS Finder / BS Hunter

- `src/App.jsx` lead state and every current source mode.
- Lead mapping, scoring, filtering, sorting, and demo exclusion.
- CSV parsing/export and manual lead duplicate protection.
- Google Maps query construction and Maps URLs.
- Google Sheets payload/service and Apps Script receiver.
- Lead CRM storage keys, safe lead ID fallback, statuses, notes, and follow-up dates.
- Lead action storage key/history and guarded CRM transitions.
- Proposal Generator.
- Demo Website Builder templates, sections, generator, CSS, and modal integration.
- Sales Center scripts, prompts, copy actions, and CSS.
- WhatsApp URL cleaning/personalized action.
- Real Website Builder templates, generator, storage key, statuses, customer fields, lead prefill, live/full preview, and interrupted premium Task 19.1 work.
- Apify backend code and paid-mode safe error handling.
- OpenAI backend secret isolation if the service is moved/shared.
- `.env.example` variable names, without copying secret values.

### BS Funds

- Git history and every remote branch.
- Current dirty working tree in a full backup and safety snapshot.
- Original finance site components: home, eligibility, privacy, calculator, contact, upload, statistics, FAQ, testimonials, WhatsApp, and dashboard.
- Google Apps Script/configuration files that genuinely belong to BS Funds.
- All mixed BS Hunter files until ownership/newest-version comparison is complete.

### Recovery assets

- Existing ZIPs and extracted copies until checksums and authoritative versions are approved.
- Environment files in a private protected backup only.
- Lead exports as business data, not source code.

## 10. Recommended First Execution Task

### Task

Create a verified, read-only pre-migration backup and recovery checkpoint.

### Exact project scope

All three current project folders, beginning with the authoritative combined source:

- `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`
- `/Users/sdfghjklpoiuytrewq/my-website/business-os`
- `/Users/sdfghjklpoiuytrewq/my-website/first ever`

### Exact repositories

- Intended Business OS remote: `https://github.com/kammmartin7-rgb/business-os.git` — inspection only, no connection/push.
- BS Funds remote: `https://github.com/kammmartin7-rgb/bs-funds.git` — no push.
- BS Finder remote: **UNKNOWN / not created**.

### Exact goal

Produce full metadata-preserving copies, file/hash manifests, a redacted environment-variable-name inventory, Git evidence, and a tested recovery checkpoint without changing any active source or remote.

### Future files/commands

- Owner-approved backup directory.
- `ditto` for full folder copies.
- `find` plus `shasum` for manifests.
- Read-only `git status`, `git log`, `git remote`, `git branch`, and `git fsck`.
- Redacted environment-name inventory that never reads values into the report.
- No `git init`, commit, branch, remote add, fetch into active folders, push, pull, merge, reset, rename, move, or delete in this first task.

### Expected result

- Every current source and dirty state is independently recoverable.
- The owner receives a signed-off checkpoint manifest.
- Later repository inspection/separation can proceed without risking the only copy of completed work.

### Rollback

The task changes no active project. If a backup is incomplete, discard only that new incomplete backup and recreate it. Never delete or alter a source folder.

### Why this is safest

The most valuable code has no Git history, while the only Git-backed project has a highly mixed dirty working tree. No reconciliation, cleanup, or source-control action is safe until both states are preserved outside their current locations.

### Owner approval

**Required before execution:** backup destination, available storage, handling/encryption of environment files, whether an external drive/cloud copy is required, and permission to create backup copies/manifests.

## 11. Owner Approval Register

The following actions require explicit owner approval:

1. Backup destination and secret-bearing backup handling.
2. Any read-only clone of the private `business-os` repository and its inspection location.
3. Creation of a BS Funds safety branch, patch, preservation commit, or tag.
4. Creation of local Git history for `bs-hunter`.
5. The authoritative folder/repository mapping for all projects.
6. Creation of a new `bs-finder` GitHub repository.
7. Any remote addition, fetch into active work, merge, import, or first push.
8. Every source ownership decision where classification is Unknown, Duplicate, or Mixed.
9. Separation destination folders and final folder structure.
10. Removal of mixed BS Finder files from the clean BS Funds target.
11. Package installation, private integration testing, or external deployment testing where it changes state or incurs cost.
12. GitHub credentials, API integrations, secrets, user/customer data access, and Business OS status connections.
13. Folder, package, repository, deployment, route, environment prefix, storage key, database ID, or URL renaming.
14. Whether BS Finder remains a Business OS module or becomes an independently deployed/repository-owned application.
15. Whether interrupted Task 19.1 is completed or reverted after protection.
16. Any deletion, archive relocation, cleanup, destructive Git command, or force operation. Force-push and `git reset --hard` are not recommended even with routine approval; they require a separate exceptional recovery plan.
