create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

create policy "daycares_select_authenticated"
  on public.daycares
  for select
  to authenticated
  using (true);
