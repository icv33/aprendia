-- Tabla de transacciones financieras
create table if not exists finance_transactions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('income', 'expense')),
  amount      numeric(10,2) not null,
  description text not null,
  category    text not null,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

alter table finance_transactions enable row level security;

create policy "service_role_all_finance" on finance_transactions
  for all using (auth.role() = 'service_role');
