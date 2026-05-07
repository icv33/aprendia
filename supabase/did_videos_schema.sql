create table if not exists did_videos (
  id         uuid        primary key default gen_random_uuid(),
  did_id     text        not null,
  topic      text        not null,
  script     text        not null,
  status     text        not null default 'processing'
               check (status in ('pending', 'processing', 'done', 'error')),
  result_url text,
  created_at timestamptz not null default now()
);

alter table did_videos enable row level security;

create policy "service_role_all_did_videos" on did_videos
  for all using (auth.role() = 'service_role');
