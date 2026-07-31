-- ============================================================
-- THERMOSYS v3 — Configuration table des utilisateurs
-- ============================================================

-- 1. Table des profils (statut d'approbation, infos complémentaires)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  status text not null default 'pending' check (status in ('pending','approved','disabled')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- 2. Sécurité : chaque utilisateur ne peut voir/lire que SON PROPRE profil
alter table public.profiles enable row level security;

create policy "Un utilisateur peut voir son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

-- 3. Création automatique d'un profil (statut "pending") à chaque inscription
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, status)
  values (new.id, new.email, 'pending');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
