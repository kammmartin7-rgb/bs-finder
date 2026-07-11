# Permanent Project Decisions

1. Business OS is the main application.
2. BS Hunter and BS Funds are modules inside Business OS.
3. Do not create separate projects for new modules.
4. New features must be separate components.
5. Keep `App.jsx` changes minimal.
6. Demo leads must not count in real statistics.
7. Dashboard cards must be clickable and open filtered data.
8. Support Hebrew, Arabic, English, and Russian.
9. Support RTL and LTR.
10. Prefer screens that fit without unnecessary page scrolling.
11. Lead actions use a compact 2x2 layout.
12. Revenue-producing work has priority.
13. Use existing services when they save significant development time.
14. Real paying customers need a professional Website Builder and Deployment flow.
15. Payment integration is planned separately.
16. Never invent completed functionality.
17. Free Mode, CSV Import, and manual entry must never fabricate real leads.
18. Paid API failures must be explicit and must not silently load demo data.
19. Browser localStorage is temporary operational storage, not the final production database.
20. Mission Control displays only the six highest-priority incomplete Tasks records.
21. The Tasks module may contain 100 or more records and uses 20-item pagination.
22. Completion tracking must reuse shared storage utilities and stable lead IDs.
23. Static deployment must work without the optional paid-search backend.
24. Secrets must never be placed in frontend source or committed `.env` files.
