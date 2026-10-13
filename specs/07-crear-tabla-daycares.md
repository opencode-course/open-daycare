# SPEC 07 — Crear tabla daycares con patrón de migraciones

> **Estado:** Approved
> **Depende de:** — (primera spec de base de datos)
> **Fecha:** 2026-10-10
> **Objetivo:** Establecer el patrón de migraciones SQL versionadas en git y aplicadas vía Supabase MCP, creando la tabla `daycares` con RLS activado y seed de 4 guarderías.

## Scope

**In:**

- Patrón de migraciones: cada cambio de schema se aplica con `apply_migration` (Supabase MCP, nombre en snake*case) y luego se espeja en `supabase/migrations/<versión>*<nombre>.sql` usando la versión exacta que devolvió el MCP.
- Migración `create_daycares`: `create table public.daycares` según `07-DB-Schema/opendaycare-database-schema.md` (`id`, `name`, `created_at`) y `alter table … enable row level security` sin policies.
- Migración `seed_daycares`: INSERT de cuatro guarderías — Sala Soles (registro principal, primero), Arcoíris, Exploradores y Mundo Feliz.
- Creación del directorio `supabase/migrations/`.
- Verificación remota mediante Supabase MCP: `list_tables`, `execute_sql` y `get_advisors` de seguridad.

**Fuera de alcance (para specs futuras):**

- Cualquier otra tabla del esquema (`users`, `rooms`, `children`, `invitations`, `posts`…), enums y triggers.
- Policies de RLS; se agregan con la spec de users/auth.
- `server/`, cliente DB y `@supabase/supabase-js`; la app sigue con mocks, sin consumir la DB.
- `supabase/config.toml`, `supabase init`, CLI o stack local.
- Espejar localmente las migraciones de prueba preexistentes (`create_test_table` / `drop_test_table`), cuyo SQL exacto no es recuperable; quedan solo en el historial remoto.

## Data model

```sql
-- supabase/migrations/<versión>_create_daycares.sql
create table public.daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.daycares enable row level security;
```

```sql
-- supabase/migrations/<versión>_seed_daycares.sql
insert into public.daycares (name) values
  ('Sala Soles'),
  ('Arcoíris'),
  ('Exploradores'),
  ('Mundo Feliz');
```

Convenciones:

- `<versión>` es el timestamp que devuelve `apply_migration`; no se inventa.
- `id` usa `gen_random_uuid()` y `created_at` usa `timestamptz`, según el documento de schema. `daycares` no lleva `updated_at` porque no está listado para esta tabla.
- RLS activado sin policies aplica deny-by-default en `public`; la tabla no es accesible vía Data API hasta que se agreguen policies.

## Implementation plan

1. Aplicar mediante MCP `apply_migration` la migración `create_daycares` con el DDL de tabla y RLS; registrar la versión devuelta. Verificar con `list_tables` en modo verbose que `public.daycares` tenga sus tres columnas y la PK en `id`.
2. Crear `supabase/migrations/<versión>_create_daycares.sql` con el SQL exacto aplicado. Verificar que el nombre local coincide con la versión y el nombre de la migración remota.
3. Aplicar mediante MCP `apply_migration` la migración `seed_daycares` con los cuatro registros; registrar la versión devuelta. Verificar con `execute_sql` que existan los cuatro nombres acordados.
4. Crear `supabase/migrations/<versión>_seed_daycares.sql` con el SQL exacto aplicado. Verificar con `list_migrations` que las versiones remotas coincidan con los prefijos de ambos archivos y consultar `get_advisors` de seguridad para revisar la tabla.

## Acceptance criteria

- [x] `supabase/migrations/` contiene exactamente dos archivos: `<versión>_create_daycares.sql` y `<versión>_seed_daycares.sql`.
- [x] `list_migrations` muestra las dos migraciones nuevas y sus versiones coinciden con los prefijos de los archivos locales.
- [x] `list_tables` en modo verbose muestra `public.daycares` con `id uuid` como PK y default `gen_random_uuid()`, `name text not null` y `created_at timestamptz not null default now()`.
- [x] RLS está activado en `daycares` y la tabla no tiene policies.
- [x] Una consulta a `public.daycares` devuelve exactamente Sala Soles, Arcoíris, Exploradores y Mundo Feliz.
- [x] No hay hallazgos WARN/ERROR para `daycares`; se acepta el INFO `rls_enabled_no_policy` como esperado.
- [x] El cambio del repo solo agrega `supabase/migrations/`; no modifica `app/`, `components/` ni `package.json`.
- [x] El SQL de cada archivo local coincide con el aplicado mediante MCP.

## Decisions

- **Sí:** aplicar migraciones vía Supabase MCP y espejar el SQL en git con la versión devuelta; versiona el schema sin instalar tooling nuevo.
- **No:** instalar Supabase CLI y usar `db push` en esta spec; requiere tooling global y login, mientras que MCP ya está disponible.
- **Sí:** activar RLS sin policies en la misma migración; la tabla queda cerrada por defecto hasta definir el modelo de acceso con users/auth.
- **Sí:** mantener el seed separado del DDL para distinguir estructura y datos iniciales.
- **Sí:** `name text not null`; una guardería sin nombre no es un registro válido.
- **No:** agregar `updated_at`; el documento de referencia no lo define para `daycares`.
- **Sí:** insertar Sala Soles primero como guardería de referencia para specs futuras.
- **No:** espejar las migraciones de prueba preexistentes; no se conoce el SQL exacto que se aplicó.
- **No:** agregar grants para `anon` o `authenticated`; RLS sin policies mantiene el acceso cerrado hasta que se defina la autorización.

## Risks

| Riesgo                                                                     | Mitigación                                                                                                            |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| La versión del archivo local depende de la respuesta de `apply_migration`. | Aplicar primero, registrar la versión y nombrar el archivo después.                                                   |
| Divergencia local/remota si se aplica SQL fuera del patrón.                | Aplicar cambios de schema mediante migraciones y verificar `list_migrations` contra los archivos locales.             |
| RLS sin policies deja la tabla inaccesible vía Data API.                   | Es intencional; la app todavía no consume la DB y las policies se definirán con users/auth.                           |
| El seed genera UUIDs que no son conocidos de antemano.                     | Las specs futuras localizan Sala Soles por nombre al establecer referencias, o definen IDs estables si los necesitan. |

## What is **not** in this spec

- Otras tablas, enums, triggers y policies del documento de schema.
- `server/`, `@supabase/supabase-js` o integración de la app; los mocks quedan intactos.
- CLI de Supabase, `config.toml` o stack local.
- Limpieza o réplica local del historial de migraciones de prueba preexistente.
