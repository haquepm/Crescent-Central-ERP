-- DESIGN DRAFT ONLY — NOT EXECUTED
-- Requires a dedicated Crescent Site Execution Supabase project.
-- Do not apply to the existing Crescent Subcontractor Billing or Attendance databases.
create extension if not exists pgcrypto;

create table public.se_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  employee_code text unique,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.se_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  role_name text not null
);

create table public.se_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.se_profiles(id),
  role_id uuid not null references public.se_roles(id),
  project_id uuid,
  unique(user_id, role_id, project_id)
);

create table public.se_projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  project_name text not null,
  central_erp_project_ref text unique,
  location text,
  status text not null default 'active' check (status in ('active','mobilising','on_hold','completed','archived')),
  start_date date,
  planned_end_date date,
  created_at timestamptz not null default now()
);

alter table public.se_user_roles add constraint se_user_roles_project_fk
  foreign key (project_id) references public.se_projects(id);

create table public.se_project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  user_id uuid not null references public.se_profiles(id),
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  unique(project_id,user_id)
);

create table public.se_structures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  structure_code text not null,
  structure_name text not null,
  unique(project_id,structure_code)
);

create table public.se_floors (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.se_structures(id),
  floor_code text not null,
  floor_name text not null,
  sort_order integer not null default 0,
  unique(structure_id,floor_code)
);

create table public.se_grids (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.se_floors(id),
  grid_code text not null,
  description text,
  unique(floor_id,grid_code)
);

create table public.se_units (
  id uuid primary key default gen_random_uuid(),
  unit_code text not null unique,
  unit_name text not null,
  dimension text
);

create table public.se_activity_types (
  id uuid primary key default gen_random_uuid(),
  activity_code text not null unique,
  activity_name text not null,
  default_unit_id uuid references public.se_units(id),
  is_active boolean not null default true
);

create table public.se_measurement_rules (
  id uuid primary key default gen_random_uuid(),
  activity_type_id uuid not null references public.se_activity_types(id),
  version integer not null,
  rule_key text not null,
  rule_config jsonb not null default '{}'::jsonb,
  effective_from date not null default current_date,
  is_active boolean not null default true,
  unique(activity_type_id,version)
);

create table public.se_boq_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  boq_code text not null,
  description text not null,
  unit_id uuid not null references public.se_units(id),
  tender_quantity numeric(18,4) not null default 0,
  revised_quantity numeric(18,4),
  rate numeric(18,4),
  source_ref text,
  is_active boolean not null default true,
  unique(project_id,boq_code)
);

create table public.se_boq_activity_mappings (
  id uuid primary key default gen_random_uuid(),
  boq_item_id uuid not null references public.se_boq_items(id),
  activity_type_id uuid not null references public.se_activity_types(id),
  unique(boq_item_id,activity_type_id)
);

create table public.se_drawings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  drawing_number text not null,
  title text not null,
  discipline text not null check (discipline in ('architectural','structural','mep','other')),
  created_at timestamptz not null default now(),
  unique(project_id,drawing_number)
);

create table public.se_drawing_revisions (
  id uuid primary key default gen_random_uuid(),
  drawing_id uuid not null references public.se_drawings(id),
  revision_label text not null,
  issue_date date,
  approval_status text not null default 'under_review' check (approval_status in ('draft','under_review','approved','superseded','rejected')),
  storage_bucket text not null default 'project-drawings',
  storage_key text not null,
  file_name text not null,
  mime_type text,
  checksum_sha256 text,
  uploaded_by uuid references public.se_profiles(id),
  uploaded_at timestamptz not null default now(),
  supersedes_revision_id uuid references public.se_drawing_revisions(id),
  unique(drawing_id,revision_label)
);

create table public.se_drawing_elements (
  id uuid primary key default gen_random_uuid(),
  drawing_revision_id uuid not null references public.se_drawing_revisions(id),
  element_code text not null,
  element_type text not null,
  structure_id uuid references public.se_structures(id),
  floor_id uuid references public.se_floors(id),
  grid_id uuid references public.se_grids(id),
  geometry jsonb,
  attributes jsonb not null default '{}'::jsonb,
  unique(drawing_revision_id,element_code)
);

create table public.se_labour_trades (
  id uuid primary key default gen_random_uuid(),
  trade_code text not null unique,
  trade_name text not null
);

create table public.se_labour_workers (
  id uuid primary key default gen_random_uuid(),
  worker_code text not null unique,
  full_name text not null,
  phone text,
  trade_id uuid references public.se_labour_trades(id),
  employment_type text,
  is_active boolean not null default true
);

create table public.se_labour_allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.se_projects(id),
  structure_id uuid references public.se_structures(id),
  floor_id uuid references public.se_floors(id),
  activity_type_id uuid not null references public.se_activity_types(id),
  allocation_date date not null,
  site_engineer_id uuid not null references public.se_profiles(id),
  instructions text,
  status text not null default 'assigned' check (status in ('assigned','in_progress','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table public.se_allocation_workers (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.se_labour_allocations(id) on delete cascade,
  worker_id uuid not null references public.se_labour_workers(id),
  attendance_status text,
  worker_days numeric(8,2) not null default 1,
  unique(allocation_id,worker_id)
);

create table public.se_measurement_entries (
  id uuid primary key default gen_random_uuid(),
  client_mutation_id uuid not null unique,
  project_id uuid not null references public.se_projects(id),
  activity_type_id uuid not null references public.se_activity_types(id),
  boq_item_id uuid references public.se_boq_items(id),
  drawing_revision_id uuid references public.se_drawing_revisions(id),
  drawing_element_id uuid references public.se_drawing_elements(id),
  structure_id uuid references public.se_structures(id),
  floor_id uuid references public.se_floors(id),
  grid_id uuid references public.se_grids(id),
  element_code text,
  measurement_method text not null check (measurement_method in ('manual','drawing')),
  occurrence_no integer not null default 1 check (occurrence_no > 0),
  measured_on date not null default current_date,
  dimensions jsonb not null default '{}'::jsonb,
  deductions jsonb not null default '[]'::jsonb,
  calculation_snapshot jsonb not null default '{}'::jsonb,
  rule_version integer,
  calculated_quantity numeric(18,4) not null check (calculated_quantity >= 0),
  unit_id uuid not null references public.se_units(id),
  remarks text,
  status text not null default 'draft' check (status in ('draft','submitted','qa_review','qs_review','pm_review','approved','rejected','correction_required','voided')),
  submitted_by uuid references public.se_profiles(id),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  corrects_entry_id uuid references public.se_measurement_entries(id)
);

create unique index se_unique_active_element_occurrence
on public.se_measurement_entries(project_id,activity_type_id,drawing_element_id,occurrence_no)
where drawing_element_id is not null and status not in ('rejected','voided');

create index se_measurement_project_date_idx
on public.se_measurement_entries(project_id,measured_on desc);

create table public.se_measurement_attachments (
  id uuid primary key default gen_random_uuid(),
  measurement_entry_id uuid not null references public.se_measurement_entries(id) on delete cascade,
  attachment_type text not null check (attachment_type in ('site_photo','document','bbs_workbook','other')),
  storage_bucket text not null default 'site-evidence',
  storage_key text not null,
  file_name text not null,
  mime_type text,
  checksum_sha256 text,
  uploaded_by uuid references public.se_profiles(id),
  uploaded_at timestamptz not null default now()
);

create table public.se_approval_workflows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.se_projects(id),
  activity_type_id uuid references public.se_activity_types(id),
  workflow_name text not null,
  version integer not null default 1,
  steps jsonb not null,
  is_active boolean not null default true,
  unique(project_id,activity_type_id,workflow_name,version)
);

create table public.se_approval_tasks (
  id uuid primary key default gen_random_uuid(),
  measurement_entry_id uuid not null references public.se_measurement_entries(id),
  step_order integer not null,
  stage_key text not null,
  assigned_role_id uuid references public.se_roles(id),
  assigned_user_id uuid references public.se_profiles(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected','skipped','reassigned')),
  decision_remarks text,
  decided_by uuid references public.se_profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  unique(measurement_entry_id,step_order)
);

create table public.se_approval_events (
  id uuid primary key default gen_random_uuid(),
  approval_task_id uuid not null references public.se_approval_tasks(id),
  event_type text not null,
  actor_id uuid references public.se_profiles(id),
  remarks text,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.se_offline_sync_events (
  id uuid primary key default gen_random_uuid(),
  client_mutation_id uuid not null unique,
  user_id uuid not null references public.se_profiles(id),
  project_id uuid not null references public.se_projects(id),
  entity_type text not null,
  entity_id uuid,
  payload_hash text,
  sync_status text not null default 'received' check (sync_status in ('received','processed','conflict','failed')),
  response jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.se_audit_logs (
  id bigint generated always as identity primary key,
  project_id uuid references public.se_projects(id),
  actor_id uuid references public.se_profiles(id),
  entity_table text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- RLS, storage policies, trusted approval functions, updated_at triggers,
-- role seed data and project-scoped policy predicates must be added and tested
-- before any production deployment. This file is an architecture draft only.
