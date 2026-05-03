-- Tabla de ebooks
create table if not exists ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  tagline text,
  description text,
  content jsonb,
  price numeric(10,2) not null default 9.99,
  original_price numeric(10,2),
  pdf_path text,
  cover_image text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'published', 'rejected')),
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- Tabla de órdenes
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid references ebooks(id) on delete set null,
  customer_email text not null,
  customer_name text,
  amount numeric(10,2) not null,
  stripe_session_id text unique,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  pdf_sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- Storage bucket para PDFs
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', false)
on conflict do nothing;

-- RLS: solo service_role puede leer/escribir (acceso desde el servidor)
alter table ebooks enable row level security;
alter table orders enable row level security;

create policy "service_role_all_ebooks" on ebooks
  for all using (auth.role() = 'service_role');

create policy "service_role_all_orders" on orders
  for all using (auth.role() = 'service_role');

-- Anon puede leer ebooks publicados
create policy "public_read_published_ebooks" on ebooks
  for select using (status = 'published');
