-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles table for app users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.expense_batches (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null references public.users(id),
  batch_name text not null,
  status text not null default 'draft' check (status in ('draft','processing','ready_for_review','finalized','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  recipient_email text,
  cc_email text,
  email_subject text,
  email_body text,
  excel_file_path text,
  draft_status text default 'not_created' check (draft_status in ('not_created','created','failed')),
  sent_status text default 'not_sent' check (sent_status in ('not_sent','sent','failed'))
);

create table if not exists public.expense_files (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null references public.expense_batches(id) on delete cascade,
  original_filename text not null,
  file_type text not null,
  file_path text not null,
  upload_status text not null default 'uploaded' check (upload_status in ('uploaded','failed')),
  processing_status text not null default 'uploaded' check (processing_status in ('uploaded','validating','extracting','needs_review','approved','failed')),
  processed_at timestamptz,
  file_size_bytes bigint,
  checksum text
);

create table if not exists public.extracted_expenses (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null references public.expense_batches(id) on delete cascade,
  file_id uuid not null references public.expense_files(id) on delete cascade,
  vendor_name text,
  expense_date date,
  currency text,
  total_amount numeric(14,2),
  vat_amount numeric(14,2),
  subtotal_amount numeric(14,2),
  payment_method text,
  receipt_number text,
  traveler_name text,
  booking_reference text,
  city text,
  country text,
  category text,
  notes text,
  raw_text text,
  confidence_score numeric(5,2) default 0,
  confidence_by_field jsonb default '{}'::jsonb,
  review_status text not null default 'needs_review' check (review_status in ('needs_review','approved')),
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_drafts (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null references public.expense_batches(id) on delete cascade,
  recipient_email text not null,
  cc_email text,
  subject text not null,
  body_html text not null,
  draft_external_id text,
  status text not null default 'created' check (status in ('created','saved','sent','failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  batch_id uuid references public.expense_batches(id) on delete cascade,
  file_id uuid references public.expense_files(id) on delete cascade,
  event_type text not null,
  event_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id int primary key default 1,
  default_recipient_email text,
  default_cc_email text,
  default_subject_template text default 'Travel expenses batch {{batch_name}} - {{date}}',
  expense_categories text[] default array['Flight','Hotel','Taxi / Transport','Train','Meals','Parking','Fuel','Office / Misc','Other'],
  auto_send boolean default false,
  allowed_file_types text[] default array['application/pdf','image/png','image/jpeg','image/heic'],
  max_file_size_mb int default 15,
  retention_days int default 365,
  updated_at timestamptz default now()
);

insert into public.app_settings(id) values (1) on conflict do nothing;

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('expense-originals', 'expense-originals', false),
  ('expense-excel', 'expense-excel', false)
on conflict (id) do nothing;

-- RLS
alter table public.users enable row level security;
alter table public.expense_batches enable row level security;
alter table public.expense_files enable row level security;
alter table public.extracted_expenses enable row level security;
alter table public.email_drafts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

create policy "users_self" on public.users
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "batches_owned" on public.expense_batches
for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "files_by_batch_owner" on public.expense_files
for all using (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
) with check (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
);

create policy "expenses_by_batch_owner" on public.extracted_expenses
for all using (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
) with check (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
);

create policy "drafts_by_batch_owner" on public.email_drafts
for all using (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
) with check (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
);

create policy "logs_by_batch_owner" on public.audit_logs
for select using (
  exists(select 1 from public.expense_batches b where b.id = batch_id and b.created_by = auth.uid())
);

create policy "settings_admin_read" on public.app_settings
for select using (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger extracted_expenses_updated_at
before update on public.extracted_expenses
for each row execute procedure public.set_updated_at();
