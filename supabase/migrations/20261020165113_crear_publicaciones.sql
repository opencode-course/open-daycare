-- Create enum post_type
create type public.post_type as enum (
  'meal',
  'nap',
  'activity',
  'achievement',
  'mood',
  'photo',
  'announcement'
);

-- Create posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id),
  room_id uuid references public.rooms(id),
  type public.post_type not null,
  title text,
  body text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_author_id_idx on public.posts(author_id);
create index posts_published_at_idx on public.posts(published_at desc);
create index posts_room_id_idx on public.posts(room_id);

alter table public.posts enable row level security;

create policy posts_select_authenticated on public.posts
  for select to authenticated
  using (true);

create policy posts_insert_staff on public.posts
  for insert to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('staff', 'admin')
    )
    and author_id = auth.uid()
  );

-- Create post_children table
create table public.post_children (
  post_id uuid not null references public.posts(id) on delete cascade,
  child_id uuid not null references public.children(id),
  primary key (post_id, child_id)
);

create index post_children_child_id_idx on public.post_children(child_id);

alter table public.post_children enable row level security;

create policy post_children_select_authenticated on public.post_children
  for select to authenticated
  using (true);

create policy post_children_insert_staff on public.post_children
  for insert to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('staff', 'admin')
    )
    and exists (
      select 1 from public.posts
      where id = post_id
      and author_id = auth.uid()
    )
  );

-- Create post_photos table
create table public.post_photos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  width int,
  height int,
  position int not null,
  created_at timestamptz not null default now()
);

create index post_photos_post_id_idx on public.post_photos(post_id);

alter table public.post_photos enable row level security;

create policy post_photos_select_authenticated on public.post_photos
  for select to authenticated
  using (true);

create policy post_photos_insert_staff on public.post_photos
  for insert to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('staff', 'admin')
    )
    and exists (
      select 1 from public.posts
      where id = post_id
      and author_id = auth.uid()
    )
  );
