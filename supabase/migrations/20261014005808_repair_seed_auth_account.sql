update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change = coalesce(email_change, ''),
    phone = coalesce(phone, ''),
    is_super_admin = coalesce(is_super_admin, false)
where email = 'camilo@gmail.com';

insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
select
  users.id::text,
  users.id,
  jsonb_build_object(
    'sub', users.id::text,
    'email', users.email,
    'email_verified', users.email_confirmed_at is not null,
    'phone_verified', false
  ),
  'email',
  now(),
  now()
from auth.users as users
where users.email = 'camilo@gmail.com'
  and not exists (
    select 1
    from auth.identities as identities
    where identities.user_id = users.id
      and identities.provider = 'email'
  );
