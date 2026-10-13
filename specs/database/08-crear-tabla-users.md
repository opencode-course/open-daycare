# SPEC 08 — Crear tabla users con enums y usuario staff de prueba

> **Estado:** Approved
> **Depende de:** SPEC 07
> **Fecha:** 2026-10-13
> **Objetivo:** Crear los enums `user_role` y `user_status` y la tabla `public.users` según el documento de schema, con RLS activado sin policies, y sembrar un usuario staff de prueba (`camilo@gmail.com`) vinculado a `auth.users` y a la guardería Sala Soles.

## Scope

**In:**

- Migración `create_users` vía Supabase MCP `apply_migration`: crear los enums `user_role` y `user_status`, la tabla `public.users` según el documento de schema y activar RLS sin policies.
- Columnas de `users`: `id uuid primary key references auth.users(id) on delete cascade`, `daycare_id uuid not null references public.daycares(id)`, `role user_role not null`, `status user_status not null default 'active'`, `full_name text not null`, `avatar_url text` nullable, `notify_on_post boolean not null default true`, `daily_summary_enabled boolean not null default true`, `created_at timestamptz not null default now()` y `updated_at timestamptz not null default now()`.
- Migración `seed_staff_user`: crear directamente un usuario en `auth.users` con email `camilo@gmail.com`, contraseña `111222` hasheada con `crypt`/`gen_salt('bf')` y email confirmado; insertar su perfil en `public.users` con el mismo UUID, nombre `Camilo Dávila`, rol `staff` y la guardería Sala Soles.
- Espejar cada migración en `supabase/migrations/<versión>_<nombre>.sql` usando la versión exacta devuelta por MCP, según el patrón de SPEC 07.
- Verificar la estructura, el seed, las migraciones remotas y los avisos de seguridad mediante Supabase MCP.

**Fuera de alcance (para specs futuras):**

- Trigger `AFTER INSERT` en `auth.users`, función `SECURITY DEFINER` y lectura de `raw_user_meta_data`; el flujo de auth e invitaciones queda para otra spec.
- Policies de RLS; se definirán cuando la app consuma la DB.
- Los enums `relationship_type`, `invitation_status`, `post_type` y `child_status`, y sus tablas.
- Trigger `moddatetime` para actualizar `updated_at` automáticamente.
- Integración app↔DB, `server/`, `@supabase/supabase-js`, login real o sesiones; los mocks quedan intactos.

## Data model

```sql
-- supabase/migrations/<versión>_create_users.sql
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  daycare_id uuid not null references public.daycares (id),
  role public.user_role not null,
  status public.user_status not null default 'active',
  full_name text not null,
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
```

```sql
-- supabase/migrations/<versión>_seed_staff_user.sql
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
```

Convenciones:

- `pgcrypto` está instalada en el schema `extensions`; `crypt` y `gen_salt` están disponibles sin crear la extensión.
- El seed busca Sala Soles por nombre, no por UUID; genera un solo UUID y lo comparte entre `auth.users` y `public.users`.
- Email y contraseña se guardan solo en `auth.users`; `public.users` contiene los datos de dominio según el documento de schema.

## Implementation plan

1. Aplicar mediante Supabase MCP `apply_migration` la migración `create_users` con los enums, tabla y RLS; registrar la versión devuelta. Verificar con `list_tables` verbose las diez columnas, la PK y ambas FK.
2. Crear `supabase/migrations/<versión>_create_users.sql` con el SQL exacto aplicado y comprobar que su prefijo coincide con la versión remota.
3. Aplicar mediante Supabase MCP `apply_migration` la migración `seed_staff_user`; registrar la versión devuelta. Verificar mediante `execute_sql` que existe el usuario confirmado y su perfil asociado, con los valores acordados y el mismo UUID.
4. Crear `supabase/migrations/<versión>_seed_staff_user.sql` con el SQL exacto aplicado. Verificar `list_migrations` contra los prefijos locales y consultar `get_advisors` de seguridad.

## Acceptance criteria

- [ ] `supabase/migrations/` agrega exactamente dos archivos: `<versión>_create_users.sql` y `<versión>_seed_staff_user.sql`; `list_migrations` muestra ambas migraciones con las mismas versiones.
- [ ] `list_tables` verbose muestra `public.users` con las diez columnas, PK en `id`, FK `id` → `auth.users(id)` con `ON DELETE CASCADE` y FK `daycare_id` → `daycares(id)`.
- [ ] Existen en `public` los enums `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`); `role` y `status` usan esos tipos, y `status` tiene default `active`.
- [ ] RLS está activado en `users` y no hay policies; `get_advisors` no agrega hallazgos WARN/ERROR para esta tabla. Se acepta el aviso INFO `rls_enabled_no_policy`.
- [ ] `execute_sql` confirma exactamente un usuario `camilo@gmail.com` en `auth.users`, con email confirmado y contraseña verificable mediante `encrypted_password = crypt('111222', encrypted_password)`.
- [ ] `execute_sql` confirma exactamente una fila relacionada en `public.users`: rol `staff`, estado `active`, nombre `Camilo Dávila`, `avatar_url` nulo, ambos booleanos en `true`, guardería Sala Soles y el mismo UUID que `auth.users`.
- [ ] El cambio local agrega únicamente los dos archivos de migración; no modifica `app/`, `components/`, `features/` ni `package.json`.
- [ ] El SQL local de cada migración coincide con el SQL aplicado mediante MCP.

## Decisions

- **Sí:** enums nativos de Postgres; coinciden con la notación del documento de schema y representan conjuntos pequeños y estables.
- **Sí:** crear solo `user_role` y `user_status`; cada tabla futura incorpora sus propios enums en su spec.
- **No:** crear los otros cuatro enums ahora; pertenecen a tablas futuras.
- **Sí:** activar RLS sin policies, igual que en `daycares`; las policies se definirán cuando la app consuma la DB.
- **Sí:** crear el staff directamente en `auth.users` y `public.users`, sin trigger; auth e invitaciones quedan fuera de esta spec.
- **No:** agregar ahora el trigger `AFTER INSERT`, la función `SECURITY DEFINER` ni el flujo con `raw_user_meta_data`.
- **No:** agregar `moddatetime`; `updated_at` queda a cargo de futuras operaciones de actualización.
- **Sí:** usar `camilo@gmail.com`, contraseña de prueba `111222`, nombre `Camilo Dávila` y guardería Sala Soles, según lo definido por el usuario.
- **Sí:** confirmar el email al crear el usuario porque todavía no existe flujo de confirmación.
- **Sí:** buscar Sala Soles por nombre y no codificar su UUID generado.
- **Sí:** `full_name` es obligatorio, `avatar_url` nullable y ambos booleanos tienen default `true`, de acuerdo con el schema.
- **No:** guardar email o contraseña en `public.users`; Supabase Auth administra esos datos.

## Risks

| Riesgo                                                                                                                   | Mitigación                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| La contraseña `111222` es débil y quedará versionada en git.                                                             | Limitarla al usuario de prueba del curso y rotarla si el proyecto pasa a un entorno real.                                                 |
| Sin trigger, un signup futuro no creará automáticamente una fila en `public.users`.                                      | Implementar la función y el trigger en la futura spec de auth/invitaciones.                                                               |
| El insert directo en `auth.users` puede depender de campos requeridos por la versión actual del schema de Supabase Auth. | Validar la migración en la DB remota antes de espejarla localmente; adaptar el SQL a los defaults y restricciones reales de `auth.users`. |
| Las versiones de los archivos locales dependen de la respuesta de `apply_migration`.                                     | Aplicar primero, registrar la versión y crear después el archivo local correspondiente.                                                   |

## What is **not** in this spec

- Trigger de perfil, signup, activación e invitaciones.
- Policies de RLS.
- Resto de tablas y enums del documento de schema.
- Integración app↔DB, login real y sesiones.
