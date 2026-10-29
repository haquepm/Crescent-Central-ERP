-- DESIGN DRAFT ONLY — NOT EXECUTED
-- Flexible engineer-wise crew allocation for Crescent Digital Engineer Daybook.
-- Apply only to a NEW, dedicated Site Execution Supabase project after security review.
-- Never apply to Crescent Subcontractor Billing or Attendance/Payroll databases.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- Import metadata only. Facial images/templates/biometric identifiers are never stored here.
create table public.se_attendance_batches (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  work_date date not null,
  source_system text not null,
  source_batch_key text not null,
  source_file_name text,
  source_checksum text,
  import_status text not null default 'received'
    check (import_status in ('received','validated','imported','partial','rejected')),
  total_rows integer not null default 0,
  matched_rows integer not null default 0,
  exception_rows integer not null default 0,
  imported_by uuid references public.se_profiles(id),
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  unique(project_id, source_system, source_batch_key)
);

create table public.se_attendance_records (
  id uuid primary key default gen_random_uuid(),
  attendance_batch_id uuid not null references public.se_attendance_batches(id),
  project_id uuid not null references public.se_projects(id),
  worker_id uuid not null references public.se_labour_workers(id),
  work_date date not null,
  first_in timestamptz,
  last_out timestamptz,
  source_status text not null,
  eligibility_status text not null default 'eligible'
    check (eligibility_status in ('eligible','exception','unmatched','excluded')),
  exception_reason text,
  source_record_key text not null,
  created_at timestamptz not null default now(),
  unique(project_id, work_date, source_record_key),
  unique(project_id, work_date, worker_id)
);

-- One engineer's crew for a project and date. Crew membership is time-bounded,
-- so the engineer can release/transfer workers during the day.
create table public.se_labour_engineer_allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  work_date date not null,
  engineer_id uuid not null references public.se_profiles(id),
  crew_label text,
  instructions text,
  status text not null default 'active'
    check (status in ('active','closed','cancelled')),
  created_by uuid not null references public.se_profiles(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.se_labour_allocation_members (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.se_labour_engineer_allocations(id),
  attendance_record_id uuid not null references public.se_attendance_records(id),
  worker_id uuid not null references public.se_labour_workers(id),
  allocated_from timestamptz not null,
  allocated_until timestamptz,
  released_at timestamptz,
  release_reason text,
  created_at timestamptz not null default now(),
  check (allocated_until is null or allocated_until > allocated_from)
);

create index se_allocation_member_worker_time_idx
  on public.se_labour_allocation_members(worker_id, allocated_from, allocated_until);

-- A daybook is one engineer's dated log. It can contain many crews/work fronts.
create table public.se_daybook_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  engineer_id uuid not null references public.se_profiles(id),
  work_date date not null,
  entry_no integer not null,
  site_conditions text,
  general_remarks text,
  status text not null default 'draft'
    check (status in ('draft','submitted','returned','closed')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, engineer_id, work_date, entry_no)
);

-- A work front is an activity performed at a drawing-marked location.
-- Multiple fronts/activities can exist for one engineer/day and crew.
create table public.se_work_fronts (
  id uuid primary key default gen_random_uuid(),
  daybook_entry_id uuid not null references public.se_daybook_entries(id),
  project_id uuid not null references public.se_projects(id),
  engineer_allocation_id uuid references public.se_labour_engineer_allocations(id),
  activity_type_id uuid not null references public.se_activity_types(id),
  boq_item_id uuid references public.se_boq_items(id),
  drawing_revision_id uuid references public.se_drawing_revisions(id),
  drawing_element_id uuid references public.se_drawing_elements(id),
  structure_id uuid references public.se_structures(id),
  floor_id uuid references public.se_floors(id),
  grid_id uuid references public.se_grids(id),
  location_label text not null,
  drawing_markup jsonb not null default '{}'::jsonb,
  drawing_page integer,
  work_description text,
  planned_start timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  status text not null default 'planned'
    check (status in ('planned','in_progress','completed','submitted','cancelled')),
  created_at timestamptz not null default now(),
  check (actual_end is null or actual_start is null or actual_end >= actual_start)
);

-- Explicit contribution for each worker at each work front. This is what makes
-- labour productivity accurate when an engineer splits/redeploys the crew.
create table public.se_work_front_labour (
  id uuid primary key default gen_random_uuid(),
  work_front_id uuid not null references public.se_work_fronts(id),
  allocation_member_id uuid not null references public.se_labour_allocation_members(id),
  worker_id uuid not null references public.se_labour_workers(id),
  contribution_start timestamptz not null,
  contribution_end timestamptz,
  worker_hours numeric(10,2),
  contribution_notes text,
  created_at timestamptz not null default now(),
  check (contribution_end is null or contribution_end > contribution_start),
  check (worker_hours is null or worker_hours >= 0),
  unique(work_front_id, allocation_member_id, contribution_start)
);

alter table public.se_measurement_entries
  add column if not exists daybook_entry_id uuid references public.se_daybook_entries(id),
  add column if not exists work_front_id uuid references public.se_work_fronts(id);

create table public.se_qs_verifications (
  id uuid primary key default gen_random_uuid(),
  measurement_entry_id uuid not null references public.se_measurement_entries(id),
  qs_user_id uuid not null references public.se_profiles(id),
  submitted_quantity numeric(18,4) not null,
  accepted_quantity numeric(18,4) not null,
  rejected_quantity numeric(18,4) not null,
  unit_id uuid not null references public.se_units(id),
  decision text not null check (decision in ('verified','partially_verified','returned','rejected')),
  reason text,
  verified_at timestamptz not null default now(),
  check (accepted_quantity >= 0 and rejected_quantity >= 0),
  check (accepted_quantity + rejected_quantity <= submitted_quantity + 0.0001)
);

create table public.se_billing_handoff_batches (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  period_from date not null,
  period_to date not null,
  idempotency_key text not null unique,
  destination_system text not null default 'central_erp',
  status text not null default 'prepared'
    check (status in ('prepared','sent','acknowledged','reconciled','failed','cancelled')),
  item_count integer not null default 0,
  total_quantity numeric(18,4) not null default 0,
  external_batch_ref text,
  created_by uuid not null references public.se_profiles(id),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  check (period_to >= period_from)
);

create table public.se_billing_handoff_items (
  id uuid primary key default gen_random_uuid(),
  handoff_batch_id uuid not null references public.se_billing_handoff_batches(id),
  qs_verification_id uuid not null references public.se_qs_verifications(id),
  measurement_entry_id uuid not null references public.se_measurement_entries(id),
  accepted_quantity numeric(18,4) not null check (accepted_quantity > 0),
  unit_id uuid not null references public.se_units(id),
  external_erp_item_ref text,
  transfer_status text not null default 'queued'
    check (transfer_status in ('queued','sent','acknowledged','failed')),
  unique(qs_verification_id)
);

create index se_attendance_project_date_idx
  on public.se_attendance_records(project_id, work_date, eligibility_status);
create index se_daybook_project_date_idx
  on public.se_daybook_entries(project_id, work_date, engineer_id);
create index se_work_front_daybook_idx
  on public.se_work_fronts(daybook_entry_id, status);
create index se_qs_verification_queue_idx
  on public.se_qs_verifications(decision, verified_at);

-- IMPORTANT production work still required:
-- 1. Implement transaction-safe allocation/transfer RPCs which check attendance
--    eligibility and reject overlapping active worker allocation intervals.
-- 2. Add RLS to every table and private Storage bucket policies.
-- 3. Add immutable audit events/triggers for attendance reconciliation,
--    worker transfers, daybook submissions, QS decisions and billing handoffs.
-- 4. Ensure billing eligibility is based only on the accepted_quantity in the
--    latest valid QS verification, and only untransferred accepted quantities.
-- 5. Review all SQL against the provisioned dedicated project's migration state.
