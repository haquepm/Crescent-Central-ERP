# Crescent Site Execution PWA

This is the first responsive PWA interface foundation for Crescent Site Execution & Quantity Management.

- Run as a static preview from this directory, or configure a dedicated Vercel project with root directory `site-execution`.
- `index.html` currently contains illustrative mock data and client-side preview interactions only.
- `manifest.webmanifest` and `sw.js` provide the installable shell and basic offline caching.
- `database/schema-draft.sql` is a design draft only; it has not been applied to any Supabase project.
- `../docs/SITE_EXECUTION_ARCHITECTURE.md` contains the data model, workflow, security, screens and rollout plan.

Production activation requires a dedicated Supabase project, RLS/storage policies, authenticated APIs, project mapping, approval functions and end-to-end tests. Do not connect this app to the existing subcontractor billing or attendance database.
