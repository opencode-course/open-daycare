update auth.users
set confirmation_token = ''
where email = 'camilo@gmail.com'
  and confirmation_token is null;
