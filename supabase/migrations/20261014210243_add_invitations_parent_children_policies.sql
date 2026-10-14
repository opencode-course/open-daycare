create or replace function public.current_user_daycare_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select daycare_id from public.users where id = auth.uid()
$$;

revoke all on function public.current_user_daycare_id() from public, anon;
grant execute on function public.current_user_daycare_id() to authenticated;

create policy users_select_same_daycare
  on public.users for select to authenticated
  using (daycare_id = (select public.current_user_daycare_id()));

create policy parent_children_select_staff_daycare
  on public.parent_children for select to authenticated
  using (
    exists (
      select 1
      from public.children c
      join public.rooms r on r.id = c.room_id
      join public.users u on u.daycare_id = r.daycare_id
      where c.id = parent_children.child_id
        and u.id = (select auth.uid())
        and u.role in ('staff', 'admin')
    )
  );

create policy invitations_select_staff_daycare
  on public.invitations for select to authenticated
  using (
    exists (
      select 1
      from public.children c
      join public.rooms r on r.id = c.room_id
      join public.users u on u.daycare_id = r.daycare_id
      where c.id = invitations.child_id
        and u.id = (select auth.uid())
        and u.role in ('staff', 'admin')
    )
  );

create policy invitations_insert_staff_daycare
  on public.invitations for insert to authenticated
  with check (
    exists (
      select 1
      from public.children c
      join public.rooms r on r.id = c.room_id
      join public.users u on u.daycare_id = r.daycare_id
      where c.id = invitations.child_id
        and u.id = (select auth.uid())
        and u.role in ('staff', 'admin')
    )
  );
