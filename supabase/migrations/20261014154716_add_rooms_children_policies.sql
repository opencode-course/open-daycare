create policy rooms_select_same_daycare
  on public.rooms
  for select
  to authenticated
  using (
    daycare_id in (
      select u.daycare_id
      from public.users u
      where u.id = (select auth.uid())
    )
  );

create policy children_select_staff_daycare
  on public.children
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.rooms r
      join public.users u on u.daycare_id = r.daycare_id
      where r.id = children.room_id
        and u.id = (select auth.uid())
        and u.role in ('staff', 'admin')
    )
  );

create policy children_insert_staff_daycare
  on public.children
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.rooms r
      join public.users u on u.daycare_id = r.daycare_id
      where r.id = children.room_id
        and u.id = (select auth.uid())
        and u.role in ('staff', 'admin')
    )
  );
