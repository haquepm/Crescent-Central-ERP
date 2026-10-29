# Build status

- Initial responsive Site Execution UI committed.
- PWA manifest and service worker committed.
- Architecture and implementation roadmap committed under `docs/SITE_EXECUTION_ARCHITECTURE.md`.
- Database schema design draft committed under `site-execution/database/schema-draft.sql`; not executed.
- Dedicated Vercel project `crescent-site-execution` is linked to this repository with root directory `site-execution`.
- This branch is for preview and review; production branch remains `main` until the user approves the build.


## Flexible engineer-wise crew allocation update

- User confirmed flexible allocation: engineers may split assigned labourers across multiple work fronts/activities/areas in one day.
- Work Allocation prototype now includes present-labour pool, engineer assignment/transfer, work-front creation and per-front worker selection.
- Added operating-model specification and SQL design draft for attendance import, time-bounded crew membership, work-front labour contributions, QS partial verification and billing handoff.
- Preview deployment for the UI commit is READY and returned HTTP 200: https://crescent-site-execution-emhlq32h8-haquepm-1737.vercel.app
- UI and sample data remain prototype-only. SQL is not executed; live attendance feed, server persistence, transactional overlap controls, RLS and billing integration are not connected.
