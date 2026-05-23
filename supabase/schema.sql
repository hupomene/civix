create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  name text not null,
  location text,
  project_type text,
  status text not null default 'Permit Review',
  risk_level text not null default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  file_type text,
  file_size bigint,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  design_change text not null,
  impact_summary text not null,
  affected_documents jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  model_used text,
  created_at timestamptz not null default now()
);

create index if not exists projects_created_at_idx
on public.projects(created_at desc);

create index if not exists uploaded_documents_project_id_idx
on public.uploaded_documents(project_id);

create index if not exists ai_reviews_project_id_idx
on public.ai_reviews(project_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;

create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();