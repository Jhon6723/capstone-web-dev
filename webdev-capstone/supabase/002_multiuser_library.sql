-- ============================================================
-- 002: disponibilidad multiusuario, devolucion con reservas y
-- biblioteca personal (estado de lectura y wishlist).
-- Ejecutar despues de schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- LOANS: un ejemplar por libro en UniLibrary
-- ------------------------------------------------------------

-- Reemplaza la regla por usuario: ahora solo puede existir un
-- prestamo activo por libro, sin importar quien lo tenga.
drop index if exists loans_one_active_per_user_book;

create unique index loans_one_active_per_book
    on loans (work_key)
    where status = 'active';

alter table loans alter column user_id set default auth.uid();

-- El cliente solo envia el snapshot del libro. Estado y fechas
-- los pone la DB, asi nadie puede extender su propio due_at.
revoke insert, update, delete on loans from anon, authenticated;
grant insert (user_id, work_key, edition_key, title, authors, cover_id, first_publish_year)
    on loans to authenticated;

-- La devolucion pasa por return_loan, no por un update directo.
drop policy "cada usuario devuelve sus prestamos" on loans;

-- Disponibilidad: devuelve cuales de los libros pedidos tienen un
-- prestamo activo de cualquier usuario. security definer permite
-- leer todas las filas, pero solo expone work_key, nunca quien.
create function loaned_work_keys(keys text[])
returns setof text
language sql
stable
security definer
set search_path = public
as $$
    select work_key
    from loans
    where status = 'active'
      and work_key = any (keys);
$$;

revoke execute on function loaned_work_keys(text[]) from public;
grant execute on function loaned_work_keys(text[]) to anon, authenticated;

-- ------------------------------------------------------------
-- RESERVATIONS: solo libros prestados por otro usuario
-- ------------------------------------------------------------

alter table reservations alter column user_id set default auth.uid();

revoke insert, update, delete on reservations from anon, authenticated;
grant insert (user_id, work_key, edition_key, title, authors, cover_id, first_publish_year)
    on reservations to authenticated;
grant update (status) on reservations to authenticated;

drop policy "cada usuario crea sus reservas" on reservations;

create policy "cada usuario reserva libros prestados por otros"
    on reservations for insert
    with check (
        auth.uid() = user_id
        and exists (select 1 from loaned_work_keys(array[reservations.work_key]))
        and not exists (
            select 1
            from loans
            where loans.user_id = auth.uid()
              and loans.work_key = reservations.work_key
              and loans.status = 'active'
        )
    );

-- El usuario solo puede pasar sus reservas de pending a cancelled.
drop policy "cada usuario actualiza sus reservas" on reservations;

create policy "cada usuario cancela sus reservas pendientes"
    on reservations for update
    using (auth.uid() = user_id and status = 'pending')
    with check (auth.uid() = user_id and status = 'cancelled');

-- Devolucion: marca el prestamo como devuelto y cumple la reserva
-- pendiente mas antigua del libro en la misma transaccion.
-- security definer permite actualizar la reserva de otro usuario.
create function return_loan(loan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    returned_work_key text;
begin
    update loans
       set status = 'returned',
           returned_at = now()
     where id = loan_id
       and user_id = auth.uid()
       and status = 'active'
    returning work_key into returned_work_key;

    if returned_work_key is null then
        raise exception 'loan_not_returnable';
    end if;

    update reservations
       set status = 'fulfilled',
           notified_at = now()
     where id = (
        select id
        from reservations
        where work_key = returned_work_key
          and status = 'pending'
        order by created_at
        limit 1
        for update
     );
end;
$$;

revoke execute on function return_loan(uuid) from public;
grant execute on function return_loan(uuid) to authenticated;

-- ------------------------------------------------------------
-- LIBRARY_ENTRIES: estado de lectura y wishlist (RF4.2, RF5)
-- ------------------------------------------------------------

create table library_entries (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

    work_key text not null,
    edition_key text,
    title text not null,
    authors text[] not null default '{}',
    cover_id integer,
    first_publish_year integer,

    status text not null check (status in ('reading', 'completed', 'wishlist')),
    updated_at timestamptz not null default now(),

    -- Un estado por libro por usuario; tambien sirve de indice por user_id.
    primary key (user_id, work_key)
);

alter table library_entries enable row level security;

create policy "cada usuario lee su biblioteca"
    on library_entries for select
    using (auth.uid() = user_id);

create policy "cada usuario agrega a su biblioteca"
    on library_entries for insert
    with check (auth.uid() = user_id);

create policy "cada usuario actualiza su biblioteca"
    on library_entries for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "cada usuario quita de su biblioteca"
    on library_entries for delete
    using (auth.uid() = user_id);
