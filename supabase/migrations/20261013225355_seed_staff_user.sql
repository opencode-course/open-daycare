do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_daycare_id uuid;
begin
  select id into v_daycare_id
  from public.daycares
  where name = 'Sala Soles';

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'camilo@gmail.com',
    crypt('111222', gen_salt('bf')),
    now(), now(), now(),
    '{}'::jsonb, '{}'::jsonb
  );

  insert into public.users (id, daycare_id, role, full_name)
  values (v_user_id, v_daycare_id, 'staff', 'Camilo Dávila');
end $$;
