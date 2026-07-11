# Business OS Development Guide

## Open The Correct Project

1. Open VS Code.
2. Choose **File → Open Folder**.
3. Open exactly this folder:

   `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`

4. Confirm that `src/App.jsx` and `package.json` are visible.

## Start The Application

Open the VS Code terminal and run:

```bash
cd /Users/sdfghjklpoiuytrewq/my-website/bs-hunter
npm install
npm run dev
```

Open the URL shown in the terminal. It is normally `http://localhost:5173`.

## Stop The Server

Click the terminal that is running Vite. Press `Control + C` once. If asked, confirm that you want to stop it.

## Restart After The Computer Turns Off

1. Open VS Code.
2. Open `/Users/sdfghjklpoiuytrewq/my-website/bs-hunter`.
3. Open a terminal.
4. Run `npm run dev`.
5. Open the URL printed by Vite.

You normally do not need to run `npm install` again unless dependencies changed.

## Main Files

- `src/App.jsx` — BS Hunter and lead actions.
- `src/App.css` — BS Hunter layout.
- `src/components/BusinessOS/` — dashboard, navigation, Tasks, Mission Control, and BS Funds.
- `src/components/LeadCRM/` — CRM controls and action history.
- `src/components/WebsiteBuilder/` — demo websites.
- `src/components/ProposalGenerator.jsx` — proposal modal.
- `src/components/SalesCenter/` — sales scripts.
- `src/i18n/translations.js` — all interface translations.
- `src/context/LanguageContext.jsx` — language and direction.
- `src/services/` — paid search and Google Sheets.
- `server/` — optional paid-search backend.
- `PROJECT_STATUS.md` — current truth about the project.
- `TASKS.md` — roadmap and task status.

## Use Codex Safely

1. Ask Codex to read `PROJECT_STATUS.md`, `TASKS.md`, `DECISIONS.md`, and `DEVELOPMENT_GUIDE.md` first.
2. Give one clear task at a time.
3. Say which files or features must not change.
4. Ask Codex to run build and lint.
5. Read the changed-file report.
6. Test the changed screen yourself before starting another task.
7. Never paste private keys, passwords, payment secrets, or customer data into a prompt.

## Review Changes

Run:

```bash
git status --short
git diff
```

Read the diff. Confirm that only expected files changed. Then test the feature in the browser.

## Restore A Broken File With Git

First inspect the change:

```bash
git diff -- path/to/file
```

To restore one file to the last committed version:

```bash
git restore path/to/file
```

This deletes uncommitted changes in that file. Do not run it if the file contains work you want to keep. Never use `git reset --hard` unless you fully understand the data loss.

## Test After Every Task

Run all three commands:

```bash
npm run build
npm run lint
npm run dev
```

Then test the exact changed workflow in the browser. Also test one nearby workflow to confirm it was not broken.

## Production Build

Run:

```bash
npm run build
```

The static output is created in:

`/Users/sdfghjklpoiuytrewq/my-website/bs-hunter/dist`

Do not edit files inside `dist`. Rebuild them from source.
