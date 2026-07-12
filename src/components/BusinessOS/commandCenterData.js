// Verified local facts for Command Center v2. No external service claims are made here.
import { addIdea, IDEAS_STORAGE_KEY as VAULT_STORAGE_KEY, loadIdeas as loadVaultIdeas } from '../IdeasVault/ideasStorage'
export const COMMAND_CENTER_UPDATED = '2026-07-11'
export const LAST_BACKUP = '2026-07-11 14:53 IDT'
export const IDEA_STORAGE_KEY = VAULT_STORAGE_KEY

export const ecosystemProjects = [
  { id: 'business-os', name: 'Business OS', technicalName: 'Embedded in bs-hunter', purpose: 'Owner management layer for projects, tasks, status, agents, and business operations.', status: 'Active · local', categories: ['Business OS', 'Infrastructure', 'Global Languages', 'Automation', 'Future Development'], currentTask: 'Build Business OS Command Center v2', nextTask: 'Read-only repository inspection', blockers: ['Local source is not protected by Git', 'Intended remote is non-empty and unverified'], repository: 'Intended: kammmartin7-rgb/business-os · not connected', lastUpdate: '2026-07-11', screen: 'dashboard' },
  { id: 'bs-finder', name: 'BS Finder', technicalName: 'BS Hunter / bs-hunter', purpose: 'Primary revenue business for lead discovery, sales, demo sites, and customer websites.', status: 'Active · partially operational', categories: ['BS Hunter', 'Lead Search', 'Demo Websites', 'Sales', 'CRM', 'Proposals', 'WhatsApp', 'Payments'], currentTask: 'Premium Real Website Builder work interrupted', nextTask: 'Protect source before completing Task 19.1', blockers: ['Paid search billing/backend unavailable', 'Payment and delivery are missing'], repository: 'No verified BS Finder repository', lastUpdate: '2026-07-11', screen: 'bs-hunter' },
  { id: 'bs-funds', name: 'BS Funds', technicalName: 'first ever / first-ever', purpose: 'Reusable finance website asset and potential template.', status: 'Preserved · mixed working tree', categories: ['BS Funds'], currentTask: 'Preserve mixed working tree', nextTask: 'Classify mixed files after repository inspection', blockers: ['Uncommitted BS Hunter-related work is mixed into the repository'], repository: 'kammmartin7-rgb/bs-funds · dirty local tree', lastUpdate: '2026-07-11', screen: 'bs-funds' },
]

export const developmentFacts = [
  ['Current local folder', '/Users/sdfghjklpoiuytrewq/my-website/bs-hunter', 'verified'],
  ['Intended repository', 'kammmartin7-rgb/business-os', 'unverified'],
  ['Current branch', 'N/A — local folder is not a Git repository', 'warning'],
  ['Git status', 'Unprotected local source', 'critical'],
  ['Last commit', 'UNKNOWN', 'unknown'],
  ['Backup status', 'PASS · 3 verified local archives', 'good'],
  ['Audit status', 'Complete · 2026-07-11', 'good'],
  ['Architecture status', 'Master architecture documented', 'good'],
  ['Migration status', 'Phase 0 complete · Phase 1 not started', 'warning'],
  ['Documentation status', 'Governance current · project README outdated', 'warning'],
  ['Deployment status', 'Prepared previously · public deployment not verified', 'unknown'],
]

export const commandDocuments = [
  ['PROJECT_MEMORY.md', 'Continuous operational memory', 'Current'], ['PROJECT_AUDIT.md', 'Verified project and repository audit', 'Complete'],
  ['MASTER_ARCHITECTURE.md', 'Permanent ecosystem architecture', 'Current'], ['MIGRATION_PLAN.md', 'Non-destructive separation plan', 'Phase 0 complete'],
  ['BACKUP_REPORT.md', 'Backup checksums and recovery instructions', 'PASS'], ['DEVELOPMENT_STANDARD.md', 'Mandatory development operating rules', 'Current'],
  ['PROJECT_STATUS.md', 'Application status and next priorities', 'Partially outdated'], ['TASKS.md', 'Durable project task roadmap', 'Available'],
  ['DECISIONS.md', 'Permanent technical and product decisions', 'Available'], ['CHANGELOG.md', 'Verified development history', 'Partially outdated'],
  ['AGENTS.md', 'Mandatory coding-agent rules', 'Available'], ['README.md', 'Project setup and identity', 'Generic / outdated'],
]

export const knownCommandIssues = [
  ['critical', 'Unprotected local source', 'The newest combined Business OS and BS Finder source has no Git history.'],
  ['critical', 'Repository mismatch', 'The intended Business OS remote is non-empty and has not been reconciled with local code.'],
  ['high', 'Mixed project structure', 'Business OS and BS Finder share one application while BS Funds contains mixed uncommitted Hunter work.'],
  ['high', 'Incomplete project separation', 'Final source ownership and repository mapping are not approved.'],
  ['high', 'Interrupted website work', 'Task 19.1 is partially implemented and not freshly production-build verified.'],
  ['medium', 'External integrations not verified', 'Paid search, live AI, and Google Sheets depend on external configuration or billing.'],
  ['medium', 'Local-only operational data', 'Leads, CRM, tasks, actions, ideas, and website projects rely on browser storage.'],
  ['medium', 'Missing revenue workflow', 'Payment, approval, publishing, hosting, and delivery remain incomplete.'],
  ['low', 'Documentation drift', 'README and some status/task history do not fully match current source.'],
]

export function loadIdeas() { return loadVaultIdeas() }
export function saveIdea(idea) { return addIdea(idea) }
