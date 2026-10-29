# Crescent Site Execution & Quantity Management
## Architecture and implementation specification

### Product boundary
A first-class module launched from Crescent Central ERP at https://erp.crescentcontractors.com. The existing Central ERP portal is currently a static HTML launcher. The module is isolated under `site-execution/` and must be deployed as its own Vercel project rooted at that directory. Do not change or replace the existing launcher, Subcontractor Billing, Attendance & Payroll, Asset Management, or Quotation applications as part of the initial build.

### Approved decisions
- ERP integration: Central ERP launcher.
- Client: installable responsive PWA.
- Measurement methods: manual and drawing-based.
- Rollout target: all Crescent projects; use controlled project activation and phased onboarding rather than a single untested production cutover.

### Application layers
1. PWA client: Next.js/React production target; responsive mobile-first UX; install prompt; IndexedDB outbox; service worker caches only application shell/static assets.
2. Application/API layer: server-side authorization, measurement calculation, duplicate detection, approval transitions, upload signing, offline idempotency.
3. Dedicated Supabase project: PostgreSQL, Auth, private Storage, Realtime where useful. Never write into the existing subcontractor billing or attendance databases.
4. Central ERP integration adapter: Central ERP remains the launcher and source for project/user references where a supported API/export exists. Start with explicit mapping/import. Implement SSO only after Central ERP's authentication contract is inspected; do not trust browser-supplied role claims.
5. Vercel: separate project with root directory `site-execution`; production domain proposed `site-execution.crescentcontractors.com` (DNS assignment only after project is ready). Keep preview deployments for review.

### Identity and authorization
- Roles: Administrator, Project Manager, Site Engineer, QA/QC Engineer, Quantity Surveyor, Management.
- Access is project-scoped. A user may have different roles on different projects.
- Permissions are server-enforced and repeated in Supabase RLS; UI hiding is not authorization.
- Admin manages access and master data but does not automatically approve measurements.
- Management has consolidated read access, not implicit edit/approval access.
- Store authorization in protected server-side profile/role tables or trusted app metadata, never user-editable auth metadata.
- Central ERP SSO is an integration milestone, not assumed to exist. Until verified, use dedicated authenticated sign-in with user/project mapping.

### Core relational model
- Identity: profiles, roles, permissions, user_roles.
- Project structure: projects, project_members, project_structures, project_floors, project_grids.
- Measurement masters: activity_types, units, measurement_rules.
- BOQ: boq_items, boq_activity_mappings.
- Drawing control: drawings, drawing_revisions, drawing_elements.
- Workforce: labour_trades, labour_workers, labour_allocations, allocation_workers.
- Measurement: measurement_entries, measurement_dimensions, measurement_attachments.
- Workflow: approval_workflows, approval_tasks, approval_events.
- Reliability and audit: offline_sync_events, audit_logs.

### Measurement rules
All calculations are performed by versioned server-side rule keys. Client calculations are previews only.
- Shuttering: configurable face calculation; for a rectangular column with four faces, area = 2 × (length + width) × height × number of elements. Example 0.75 × 0.60 × 3.60 = 9.72 m². Openings/returns and non-rectangular forms require separate rule lines.
- Steel: quantity is verified weight in kg, optionally supported by BBS workbook attachment. Do not calculate weight from shuttering dimensions. BBS file stored privately, not in database.
- Block work: length × height less approved opening deductions; BOQ controls whether unit is m² or m³ and thickness treatment.
- Plastering: measured wall/ceiling surfaces with side and opening deduction rules.
- Waterproofing: area × configured system/coat rules, with location and layer metadata.
- Painting: surface area with primer/putty/coat and side metadata.
- Every saved measurement snapshots the rule version, input dimensions, deduction details, calculated quantity and unit.

### Drawing and revision model
- A drawing is the logical document; each uploaded issue creates an immutable revision.
- Revisions have discipline, drawing number, revision label, issue date, approval state, private storage key, checksum and superseded pointer.
- Drawing elements belong to one specific revision and carry a stable element code, type, building/floor/grid references and optional geometry/annotation metadata.
- Measurement entries link to the exact drawing revision and element used. New revisions do not silently rewrite historic measurements.
- PDF viewing/annotation first; DWG support via a licensed/approved viewer or conversion service selected after testing. AI extraction suggests elements/quantities but a human must verify before submission.

### Duplicate and correction controls
- Drawing-based active measurement uniqueness: project + activity + element + occurrence number. Enforce with a partial unique index for records not rejected/voided.
- A repeat execution/second pour/second work cycle requires an explicitly numbered occurrence authorized by project rules.
- Manual measurements without an element code use a duplicate-warning fingerprint (project, activity, building, floor, grid, location, date, dimensions); QS review is required when a possible match exists.
- Submitted entries are immutable to ordinary users. Corrections create a new revision/adjustment linked to the original, with reason and approval.
- Offline mutation UUID is unique; sync retries return the original result rather than inserting again.

### Approval workflow
Default configurable chain:
1. Site Engineer submits work measurement and evidence.
2. QA/QC inspection where activity/project requires it.
3. Quantity Surveyor verifies dimensions, BOQ mapping, duplicates and evidence.
4. Project Manager approves execution/progress.
5. Optional Management approval for configured thresholds or exceptions.
Each stage is a task with assigned role/user, status, timestamps, comments and event history. Rejection returns to a defined correction state; approval does not erase earlier decisions. Approval rules are configurable per project/activity.

### Evidence and storage
Private buckets: `project-drawings`, `site-evidence`, `bbs-attachments`, `exports`. Storage paths are project-scoped. Signed URLs are short-lived. Validate MIME type, extension and file size; store metadata/checksum in relational tables. Never make buckets public. BBS files are downloadable for verification and are not parsed into a database binary column.

### Offline PWA
- Cache the shell, icons and approved reference data only.
- Save drafts and queued submissions in IndexedDB with UUID, actor, project, payload version and client timestamp.
- Queue photos separately with upload retry state; show pending/synced/failed states.
- Sync through an authenticated API with idempotency keys.
- Server revalidates project membership, drawing revision, measurement rules and duplicates at sync time.
- If a conflict is detected, preserve the local draft and show a resolution task; never silently overwrite server data.
- Offline mode cannot grant approvals or bypass authorization.

### Main screens
1. Sign in / session / project switcher.
2. My Projects and project overview.
3. Project setup: buildings, floors, grids, zones and project team.
4. Drawing register, revision comparison, PDF viewer and element picker.
5. BOQ register and activity mapping.
6. Labour directory, trades and availability.
7. Daily labour allocation and crew assignment.
8. Work-ready / activity execution list.
9. Quantity entry: manual/drawing mode, activity-specific fields, live preview, BOQ balance and duplicate warnings.
10. Site evidence capture, gallery and remarks.
11. My submissions and offline sync queue.
12. QA/QC inspection.
13. QS verification workbench.
14. Project Manager approval queue.
15. Project and management dashboards.
16. Reports, exports and audit trail.
17. Admin masters, roles, workflow rules and integration mappings.

### Reporting definitions
- Executed quantity = sum of approved measurement quantities, adjusted by approved corrections.
- Pending quantity is not counted as completed.
- BOQ balance = BOQ quantity − approved executed quantity; negative values are overrun and must be highlighted, not clipped.
- Physical progress is quantity-weighted by BOQ line and must not be averaged blindly across unlike units.
- Labour productivity = approved output / actual worker-days for the same activity, period and project.
- Keep measured, submitted, verified and approved quantities separately reportable.

### Implementation roadmap
Phase 0 — foundation and integration contract
- Inspect Central ERP repository, deployment configuration and identity/project source.
- Create isolated application folder and separate Vercel project.
- Confirm dedicated Supabase organization/project and cost before provisioning.
- Finalize project/user mapping and SSO decision.

Phase 1 — secure core
- Database migrations, Auth, project membership, RBAC, RLS, private storage, audit log.
- Project switcher, user management, project structure and master data.

Phase 2 — workforce and allocation
- Worker/trade directory, crew allocation, daily assignment, availability and reports.

Phase 3 — quantity engine
- Activity rules, manual entry, calculation snapshots, BOQ balance, duplicate checks, immutable submissions.

Phase 4 — drawings
- PDF viewer, revision control, element directory and drawing-linked entry; validate DWG viewer choice.

Phase 5 — evidence and approvals
- Camera/gallery uploads, QA/QC, QS, PM queues, rejection/correction workflow and notifications.

Phase 6 — PWA offline and analytics
- IndexedDB outbox, idempotent sync, conflict resolution, reports and exports.

Phase 7 — pilot-to-all-projects rollout
- Configure each project, migrate approved master data, train users, reconcile opening BOQ quantities, run parallel validation, then activate project by project.

### Acceptance gates
- Existing Central ERP and sibling modules are unchanged.
- Every table in exposed schemas has RLS; storage buckets are private.
- Unauthorized cross-project reads/writes fail.
- Calculation unit tests cover each activity and rounding/deductions.
- Duplicate and offline retry tests prove no duplicate quantities.
- Approval transitions and audit events are tested.
- PDF/DWG handling, photo upload and poor-connectivity tests pass.
- Dashboard totals reconcile to approved measurement records and BOQ.
- Pilot sign-off precedes broad production activation.

### Current build status
The first interactive UI/PWA shell is in the feature branch `feature/site-execution-quantity-management`. Its figures and records are mock examples. Database provisioning, live authentication, uploads, approvals, offline synchronization and production domain are not yet connected.
