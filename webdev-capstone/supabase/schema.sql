
-- ============================================================
-- LOANS: prestamos activos e historial (RF3.1, RF3.2, RF3.4, RF3.5)
-- ============================================================

create table loans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,

    -- Snapshot del libro (BookRef)
    work_key text not null,
    edition_key text,
    title text not null,
    authors text[] not null default '{}',
    cover_id integer,
    first_publish_year integer,

    borrowed_at timestamptz not null default now(),
    due_at timestamptz not null default (now() + interval '14 days'),
    returned_at timestamptz,

    -- 'overdue' no se guarda: se deriva de active + due_at < now()
    status text not null default 'active' check (status in ('active', 'returned'))
);

-- Regla de negocio: un prestamo activo por usuario por libro.
create unique index loans_one_active_per_user_book
    on loans (user_id, work_key)
    where status = 'active';

create index loans_user_idx on loans (user_id);

alter table loans enable row level security;

create policy "cada usuario lee sus prestamos"
    on loans for select
    using (auth.uid() = user_id);

create policy "cada usuario crea sus prestamos"
    on loans for insert
    with check (auth.uid() = user_id);

create policy "cada usuario devuelve sus prestamos"
    on loans for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Sin delete: el historial de prestamos es de solo lectura (RF3.4).

-- ============================================================
-- RESERVATIONS: reservas de libros prestados (RF3.3)
-- ============================================================

create table reservations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,

    -- Snapshot del libro (BookRef)
    work_key text not null,
    edition_key text,
    title text not null,
    authors text[] not null default '{}',
    cover_id integer,
    first_publish_year integer,

    created_at timestamptz not null default now(),
    notified_at timestamptz,

    status text not null default 'pending'
        check (status in ('pending', 'fulfilled', 'cancelled'))
);

-- Regla de negocio: una reserva pendiente por usuario por libro.
create unique index reservations_one_pending_per_user_book
    on reservations (user_id, work_key)
    where status = 'pending';

create index reservations_user_idx on reservations (user_id);

alter table reservations enable row level security;

create policy "cada usuario lee sus reservas"
    on reservations for select
    using (auth.uid() = user_id);

create policy "cada usuario crea sus reservas"
    on reservations for insert
    with check (auth.uid() = user_id);

create policy "cada usuario actualiza sus reservas"
    on reservations for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
