# Business OS Development Standard

Status: Mandatory  
Applies to: Business OS, BS Finder, BS Funds, every future project, and every human or AI development session  
Factual governance sources: `PROJECT_AUDIT.md`, `MASTER_ARCHITECTURE.md`, `MIGRATION_PLAN.md`, and `BACKUP_REPORT.md`

## 1. Core Mission

Business OS is the parent operating system and management layer for every business, project, user, role, task, agent, metric, document, integration, deployment, and issue.

BS Finder is the primary revenue business. Existing code may still call it BS Hunter. That technical name must remain migration-controlled until source code, repositories, routes, storage, configuration, and deployments are protected.

Development priorities are:

1. Protect working code and business data.
2. Establish correct project and source-control ownership.
3. Make BS Finder operational and revenue-producing.
4. Use Business OS to control and report all activity.
5. Add automation and AI only after the core business process is reliable.
6. Improve BS Funds only when explicitly selected or when it supports revenue.

Revenue comes before unnecessary features. Never lose verified functionality to gain a cleaner architecture or faster implementation. Major architecture work begins only after backups and recovery instructions are verified.

## 2. Project Selection Rule

Before any development, identify and verify:

- Exact official project and current technical name.
- Exact absolute local folder.
- Git repository and remote URL, or confirmed absence of Git.
- Current branch and tracking branch, where applicable.
- Latest local and remote commits.
- Working-tree status, including staged, modified, deleted, and untracked files.
- Required project documentation.
- Current active task and its approval status.

Never assume a folder is correct because its name looks correct. Never assume a remote is correct because it already exists. Never assume the running application comes from the open editor tab.

Current audited mapping remains authoritative until an approved migration changes it:

- Current combined Business OS + BS Finder implementation: `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`
- Separate Business OS starter, not the working system: `/Users/sdfghjklpoiuytrewq/my-website/business-os`
- BS Funds Git checkout with mixed working tree: `/Users/sdfghjklpoiuytrewq/my-website/first ever`

If any mapping is uncertain, stop. Do not write code or run Git write operations.

## 3. Required Reading

Before writing code, read completely:

1. `PROJECT_STATUS.md`
2. `TASKS.md`
3. `DECISIONS.md`
4. `CHANGELOG.md`
5. `MASTER_ARCHITECTURE.md`
6. `PROJECT_AUDIT.md`
7. `MIGRATION_PLAN.md`

Also read `AGENTS.md`, `DEVELOPMENT_GUIDE.md`, `README.md`, and `BACKUP_REPORT.md` when they exist or affect the task.

Source-of-truth order:

1. Actual code
2. Verified GitHub repository
3. `PROJECT_AUDIT.md`
4. `PROJECT_STATUS.md`
5. `TASKS.md`
6. `DECISIONS.md`
7. `CHANGELOG.md`
8. Other notes

If documentation conflicts with code, code wins. Mark the documentation outdated and update it only after the code and task outcome are verified and approval permits the update. Never claim an unfinished, placeholder, disabled, or untested feature exists.

## 4. One Task Rule

Every development session must have:

- One approved task.
- One clear purpose.
- One bounded implementation.
- One verification cycle.
- One final report.

Then stop.

Do not combine cleanup, migration, redesign, new features, repository work, and deployment unless the approved task explicitly and safely includes them. A discovered unrelated problem must be recorded for a later task rather than silently fixed.

New user instructions may replace the active task. When that happens, stop the previous task and report any partial state. Never continue an interrupted implementation invisibly.

## 5. Safety Rules

- Never delete code, projects, data, or archives without a verified backup and explicit approval.
- Never overwrite one project with another.
- Never rename or move folders, repositories, packages, routes, storage keys, environment variables, internal IDs, or deployments without an approved migration plan.
- Never expose, print, log, commit, or place secrets in frontend variables.
- Never force-push.
- Never use destructive Git recovery such as `git reset --hard` without a separate exceptional recovery plan and explicit approval.
- Never modify, connect, merge, fetch into, pull into, or push repositories without verifying the destination and receiving approval.
- Never silently replace real-data failures with demo or fake data.
- Never count demo leads as real leads.
- Never mix Business OS, BS Finder, and BS Funds source accidentally.
- Never edit generated build output as source.
- Always preserve unrelated user changes.
- Always create and verify backups before major architecture, repository, migration, storage, or naming work.
- Always keep environment files private.
- Always use least privilege for people, services, and AI agents.
- Stop when project identity, authority, repository state, or recovery safety is uncertain.

Phase 0 backup archives currently exist and passed verification, as documented in `BACKUP_REPORT.md`. They do not authorize migration, Git changes, cleanup, or deletion.

## 6. Documentation Update Rules

After every completed and verified task, update:

- `PROJECT_STATUS.md`
- `TASKS.md`
- `CHANGELOG.md`

Update only when necessary:

- `DECISIONS.md` for durable product, architecture, security, data, repository, or naming decisions.
- `MASTER_ARCHITECTURE.md` for owner-approved ecosystem architecture changes.
- `MIGRATION_PLAN.md` for owner-approved migration-plan changes.
- `DEVELOPMENT_GUIDE.md` when run, test, deployment, or recovery instructions change.
- `README.md` when project identity, setup, functionality, repository, or deployment changes.
- `AGENTS.md` when mandatory agent operating rules change.

Documentation rules:

- Record verified facts, not intentions.
- Include exact paths, commands, branches, commit hashes, and test results when relevant.
- Label unknown information as **UNKNOWN**.
- Never write secret values.
- Never mark work complete because a file was created; verify the outcome.
- Keep task counts, completion states, and current-task declarations consistent.
- Do not update governance documents during a task that explicitly limits allowed files.

## 7. Git Rules

- Never initialize an unknown or ambiguous project folder.
- Never reconnect, replace, or add a remote without explicit approval.
- Never push before verifying the exact repository owner, name, visibility, branch, history, and destination state.
- Always verify the current branch and upstream.
- Always verify the remote URL.
- Always verify the latest local commit and latest known remote commit.
- Always inspect staged, modified, deleted, and untracked files before committing.
- Never assume local work has been pushed.
- Never commit `.env`, credentials, customer exports, local databases, dependencies, caches, or generated build folders.
- Use focused commits that correspond to one approved task.
- Do not rewrite shared history.
- Do not use force operations to solve normal migration conflicts.
- First pushes, repository creation, history imports, merges between unrelated histories, and branch protection changes require owner approval.
- A Git tag or branch does not preserve uncommitted work by itself; preserve a full backup first.
- When a working tree is dirty, do not discard, stash, or commit unrelated work without an approved preservation plan.

Current restrictions:

- The audited `bs-hunter` folder has no verified Git repository.
- The intended `business-os` remote is non-empty and must be inspected in isolation before connection.
- The BS Funds repository has extensive mixed, uncommitted work and must remain protected.

## 8. Coding Standards

### Structure

- Keep components small and responsible for one concern.
- Separate presentation, business logic, storage, API access, validation, and generated content.
- Prefer reusable services and utilities over duplicated logic.
- Keep stable public component contracts explicit.
- Keep Business OS modular; project integration views must not duplicate whole project source trees.
- Keep BS Finder operational logic owned by BS Finder.
- Keep BS Funds independent unless it is deliberately integrated through a defined contract.

### Naming

- Use clear, descriptive names.
- Distinguish display name, folder name, package name, repository name, deployment name, and stable internal project ID.
- Do not casually replace BS Hunter technical identifiers with BS Finder; follow the naming migration plan.
- Avoid abbreviations unless they are established business terms.

### Data and state

- Define one source of truth per data type.
- Reuse storage utilities and stable IDs.
- Do not duplicate lead, CRM, task, action-history, or project-storage logic.
- Preserve backwards compatibility for persisted localStorage/database keys.
- Validate external and user input.
- Fail safely without blank screens or invented data.

### UI and accessibility

- Preserve English, Hebrew, Arabic, Russian, RTL, and LTR support.
- Avoid horizontal scrolling unless the content genuinely requires it.
- Use semantic elements, keyboard-accessible controls, readable contrast, and clear labels.
- Keep loading, empty, error, disabled, and unavailable states explicit.

### Backend and security

- Enforce permissions on the backend, not only in the interface.
- Keep private keys and provider secrets backend-only.
- Limit request size, validate payloads, and return safe errors.
- Log critical actions without secrets or unnecessary customer data.
- Apply least-privilege integration scopes.

## 9. Business OS Modules

Business OS is intended to contain management and integration modules for:

- Owner Dashboard
- Projects
- Tasks
- Users
- Roles and Permissions
- CRM
- Sales
- Finance
- AI Center
- Agent Activity
- Documents
- Known Issues
- Integrations
- GitHub Status
- Deployments
- Audit Log
- Settings
- Languages
- Themes

Each module must define:

- Purpose and project owner.
- Current factual status.
- Data source and source-of-truth owner.
- User/role permissions.
- Dependencies and blockers.
- Error and unavailable behavior.
- Verification criteria.

Business OS may display BS Finder and BS Funds status through explicit APIs or adapters. It must not absorb accidental copies of their full source code.

## 10. BS Finder Modules

BS Finder owns the revenue workflow:

- Lead Discovery
- Lead Qualification
- Contact Details
- CRM
- Proposal Generator
- Demo Website Builder
- Demo Review
- Real Website Builder
- Sales Pipeline
- Outreach
- Follow-up
- Customer Management
- Payment
- Customer Approval
- Delivery
- Hosting and Maintenance
- Upsell and Retention
- Automation

Each module must protect existing lead IDs, demo-lead rules, CRM records, action history, Google Sheets contracts, website projects, translations, and safe failure behavior.

Payment, customer approval, delivery, hosting, upsell, and retention are currently incomplete or missing and must not be described as working until verified.

## 11. Agent Rules

Every AI agent must have a written record defining:

- Mission.
- Exact project and allowed folders.
- Allowed tools and integrations.
- Allowed reads and writes.
- Allowed outputs and destinations.
- Forbidden actions.
- Data sensitivity level.
- Approval requirements.
- Success criteria.
- Stop condition.
- Audit/logging requirements.

Never grant full project, filesystem, repository, customer, financial, deployment, or secret access by default.

Agent principles:

- Deny by default.
- Use the minimum required scope.
- One assigned task at a time.
- Do not perform external, destructive, financial, messaging, publishing, repository, or deployment actions without the required approval.
- Do not infer permission from technical capability.
- Do not expose secrets in prompts, logs, screenshots, or outputs.
- Make every critical action traceable to the agent, task, project, timestamp, result, and approving person.
- Stop when instructions conflict or authority is unclear.

## 12. Prompt Standard

Every technical prompt must include:

### Project

- Official project name.
- Current technical name when different.
- Exact local folder.
- Verified repository and branch, or explicit statement that Git is unavailable/unknown.

### Goal

- One concrete outcome.
- Business reason and priority.

### Allowed files

- Exact files or folders that may be read or changed.
- Whether documentation, generated files, configuration, backend, or dependencies are in scope.

### Forbidden actions

- Unrelated modules that must not change.
- Git, deployment, installation, external messaging, secrets, deletion, renaming, or migration restrictions.

### Verification

- Exact build, lint, test, runtime, and workflow checks.
- Expected behavior for success, failure, empty, and unavailable states.

### Stop condition

- What defines completion.
- When to stop and request owner input.
- Required changed-file and verification report.

Recommended prompt skeleton:

```text
Project:
Exact folder:
Repository/branch:
Goal:
Allowed files:
Forbidden actions:
Required behavior:
Verification commands:
Documentation updates:
Approval boundaries:
Stop condition:
Final report:
```

## 13. Completion Checklist

A development task is complete only when all applicable items pass:

- [ ] Exact project, folder, repository, and branch were verified.
- [ ] Required documentation was read.
- [ ] The task remained within one approved purpose.
- [ ] Build succeeds.
- [ ] Lint passes without unreviewed errors or warnings.
- [ ] Relevant automated tests pass.
- [ ] Application starts successfully.
- [ ] The requested workflow works in the browser or appropriate runtime.
- [ ] Nearby critical behavior was smoke-tested.
- [ ] Error, empty, disabled, and unavailable states behave safely.
- [ ] No secret value appears in source, output, logs, or build artifacts.
- [ ] No unrelated file was changed.
- [ ] Existing user data and stable storage keys remain compatible or have an approved migration.
- [ ] Documentation was updated with verified facts.
- [ ] Changed files and exact verification results were reported.
- [ ] Commit/push occurred only if separately approved and to the verified destination.
- [ ] Business OS project status was updated only after verification.

If an applicable item fails, the task is incomplete. Report the failure and do not claim success.

## 14. Emergency Recovery

If anything becomes uncertain:

1. **STOP.**
2. Do not run additional writes, cleanup, Git, migration, or deployment commands.
3. Read the required documentation again.
4. Check the exact folder and running process.
5. Check Git repository, branch, remote, commits, and working tree using read-only commands.
6. Check `BACKUP_REPORT.md` and verify backup checksums before recovery.
7. Preserve new evidence without exposing secrets.
8. Ask the Owner for approval when authority, ownership, or recovery choice is unclear.

Never guess. Never extract a backup over an active project. Never delete the uncertain state. Recover into a new empty location, compare, verify, and only then decide the next approved action.

The Phase 0 recovery archives are local only. Their exact paths, SHA-256 checksums, exclusions, and restore commands are recorded in `BACKUP_REPORT.md`.

## 15. Long-term Vision

Business OS becomes the secure operating system for the entire business ecosystem. It gives the Owner full visibility and control while enforcing limited project-specific access for every other role and agent.

BS Finder becomes the primary automated revenue business, operating a complete and measurable pipeline from lead discovery through website delivery, maintenance, upsell, and retention.

BS Funds remains a separate reusable digital asset that can be archived, templated, adapted, or sold without contaminating other codebases.

Additional businesses are added as independent managed projects with clear ownership, repositories, documentation, permissions, status, and business purpose.

Automation replaces manual work gradually. Every automated action remains scoped, observable, reversible where possible, and subject to approval according to risk. The Owner always maintains full visibility and control.

This document is the mandatory operating standard for every future development session.
