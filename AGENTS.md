# Mandatory Instructions For AI Coding Agents

1. Before doing any task, read:
   - `PROJECT_STATUS.md`
   - `TASKS.md`
   - `DECISIONS.md`
   - `DEVELOPMENT_GUIDE.md`
2. Work on one task only.
3. Do not change unrelated code.
4. Do not remove existing functionality.
5. Keep new functionality modular.
6. Run build and lint after code changes.
7. At the end of every completed task, update:
   - `PROJECT_STATUS.md`
   - `TASKS.md`
   - `CHANGELOG.md`
8. `PROJECT_STATUS.md` must always contain:
   - current task
   - last completed task
   - next 10 tasks
   - known issues
   - exact run instructions
9. Never claim something works unless verified.
10. Never count demo leads as real leads.
11. Preserve all four languages and RTL/LTR.
12. Revenue-critical tasks come before visual improvements.
13. Real Website Builder and Deployment are required after a customer pays.
14. Do not create a second Business OS project.
15. If instructions conflict, stop and report the conflict instead of guessing.

## Additional Repository Rules

- Preserve user data and stable localStorage keys unless a migration is explicitly required.
- Do not expose or commit secrets or `.env` files.
- Do not silently replace failed real-data operations with demo data.
- Keep `App.jsx` changes small; prefer a separate component or utility.
- Do not edit generated `dist/` files manually.
- Use `apply_patch` for source and documentation edits.
- Report every changed file and the verification commands used.
