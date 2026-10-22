# Crescent Project Intelligence Dashboard

Separate Next.js application intended for `dashboard.crescentcontractors.com`, deployed from the `project-dashboard/` root directory of the Crescent Central ERP repository.

## Current foundation
- Individual project dashboard first, with project selector and responsive layouts.
- Progress, cost, schedule, workforce and issue-monitoring panels.
- Sample project records are explicitly marked as demo data.
- No production system or existing Supabase database is modified by this UI foundation.

## Run locally
```bash
cd project-dashboard
npm install
npm run dev
```

## Production integration plan
1. Provision a dedicated Crescent Project Dashboard Supabase project/database.
2. Confirm the project master and authorised project/user mapping.
3. Connect verified project, BOQ, progress and cost feeds.
4. Replace sample data with read-only reporting views / secure APIs.
5. Add RLS policies and role-based access before enabling production data.
6. Configure `dashboard.crescentcontractors.com` in Vercel and add the link to Central ERP.

## Environment variables (to be configured after the dedicated database is approved)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Never put a Supabase secret/service-role key in browser-exposed environment variables.
