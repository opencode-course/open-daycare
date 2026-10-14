# SPEC 10 — Mantenimiento de niños con salas y datos reales

> **Estado:** Approved
> **Depende de:** SPEC 02, SPEC 04, SPEC 07, SPEC 08, SPEC 09
> **Fecha:** 2026-10-14
> **Objetivo:** Crear `rooms` y `children`, sembrar tres salas para Sala Soles e integrar `/kids` con listado, alta y perfil reales contra Supabase.

## Scope

**In:**

- Crear `public.rooms`, `public.children` y el enum `public.child_status` según `07-DB-Schema/opendaycare-database-schema.md`; habilitar RLS e índices en las claves foráneas.
- Sembrar las salas «Soles», «Lunas» y «Estrellas» para la guardería «Sala Soles», sin insertar niños.
- Agregar policies RLS: lectura de salas de la guardería del usuario; lectura e inserción de niños para `staff`/`admin` de la misma guardería.
- Reemplazar los mocks de `features/kids/data.ts` por lecturas reales de salas, niños y perfiles.
- Conectar el diálogo existente a una Server Action de alta. `enrolled_at` se fija a la fecha actual del servidor.
- Hacer que `/kids` muestre el contador real y una lista vacía cuando no haya niños.
- Cambiar el perfil a `/kids/[id]`, con datos reales y 404 para UUID inexistente.
- Mantener el diálogo de vinculación de padre sin persistencia, como mock.
- Aplicar cada cambio persistente mediante Supabase MCP `apply_migration` y espejar el SQL exacto en `supabase/migrations/<versión>_<nombre>.sql`, usando la versión devuelta por MCP.

**Fuera de alcance (para specs futuras):**

- Edición, archivado y eliminación de niños; CRUD de salas.
- `parent_children`, invitaciones y vinculación real de padres.
- Búsqueda funcional, filtros por sala y resumen del día.
- Feed real, fotos, interfaz de consentimiento fotográfico y trigger `moddatetime`.

## Data model

```sql
-- create_rooms
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares (id),
  name text not null,
  created_at timestamptz not null default now()
);

create index rooms_daycare_id_idx on public.rooms (daycare_id);
alter table public.rooms enable row level security;

-- create_children
create type public.child_status as enum ('active', 'archived');

create table public.children (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id),
  full_name text not null,
  birth_date date not null,
  enrolled_at date not null,
  medical_notes text,
  allergy_tags text[],
  photo_consent boolean not null default true,
  status public.child_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index children_room_id_idx on public.children (room_id);
alter table public.children enable row level security;
```

```ts
// features/kids/data.ts
export type Room = { id: string; name: string };

export type Kid = {
  id: string;
  fullName: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  age: number;
  allergyTags: string[];
  roomName: string;
  birthDate: string;
  enrolledAt: string;
  medicalNotes: string | null;
};

export async function getRooms(): Promise<Room[]>;
export async function getKids(): Promise<Kid[]>;
export async function getKidById(id: string): Promise<Kid | null>;
```

```ts
// features/kids/schema.ts
export function parseAllergyTags(input: string): string[];
export function validateAddKid(values: AddKidValues): AddKidErrors;
```

Convenciones:

- Los nombres persistidos y códigos de `allergy_tags` van en inglés; la UI traduce los valores conocidos (`peanut` → «Maní», `lactose` → «Lactosa», `gluten` → «Gluten», `egg` → «Huevo», `sesame` → «Sésamo», `soy` → «Soja»). El input se separa por comas; valores desconocidos se guardan en minúsculas y se muestran tal cual, en mayúsculas en los badges.
- `enrolled_at` recibe la fecha del día en la Server Action; no se agrega un campo al diálogo.
- Edad e inicial se derivan de los datos persistidos. El tono se deriva determinísticamente de `full_name` y reutiliza la paleta actual.
- Fechas visibles: nacimiento «d mmm yyyy» (por ejemplo, «12 mar 2022»); ingreso «mmm yyyy» (por ejemplo, «feb 2025»), con abreviaturas españolas.
- `ParentRole` y `parentRoleLabels` se conservan en `features/kids/data.ts` mientras los consuma `LinkParentDialog`.
- Migraciones locales con versiones exactas devueltas por `apply_migration`; nunca inventar versiones.

Policies previstas (ajustar el SQL final tras inspeccionar el schema remoto):

- `rooms_select_same_daycare`: `authenticated` puede leer salas cuyo `daycare_id` coincide con el de su fila en `public.users`.
- `children_select_staff_daycare`: `authenticated` con rol `staff` o `admin` puede leer niños cuyas salas pertenecen a su guardería.
- `children_insert_staff_daycare`: solo `staff` o `admin` puede insertar niños en una sala de su guardería.
- Los chequeos de identidad usan `(select auth.uid())` y las policies limitan acceso al tenant. Padres no acceden a `children` en esta spec.

## Implementation plan

1. Inspeccionar tablas, migraciones y policies remotas relevantes. Aplicar `create_rooms`, `create_children`, `seed_rooms` y `add_rooms_children_policies` mediante MCP; registrar versiones, espejar SQL y verificar estructura, seed, policies y advisors. Debe quedar ejecutable con tres salas y cero niños.
2. Crear `features/kids/schema.ts` con validación de alta y mapeo de alergias ES↔EN, manteniendo los mensajes de SPEC 04. Verificar `npm run build`.
3. Reemplazar los mocks en `features/kids/data.ts` por tipos y consultas reales de salas, lista y perfil; implementar derivaciones de edad, inicial, tono y labels de alergias. Verificar `npm run build`.
4. Crear `features/kids/actions.ts` con la Server Action de alta: validar, resolver sala, insertar con `enrolled_at` del día y revalidar `/kids`. Verificar que la app compila.
5. Conectar `AddKidDialog` y `/kids`: cargar salas reales, enviar el formulario a la acción, mostrar errores y conservar cierre/reset; renderizar contador y lista desde DB. Probar el estado inicial vacío y una alta.
6. Cambiar `KidCard` al identificador UUID y reemplazar `app/(app)/kids/[slug]/` por `app/(app)/kids/[id]/` con perfil real, formato de datos, estado sin padres y 404 para ID inexistente.
7. Validar con Playwright el estado vacío, alta válida e inválida, alergias conocidas y desconocidas, perfil y 404; ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] `supabase/migrations/` contiene cuatro migraciones nuevas: `create_rooms`, `create_children`, `seed_rooms` y `add_rooms_children_policies`; las versiones coinciden con `list_migrations`.
- [ ] `rooms` y `children` tienen columnas, tipos, claves foráneas y defaults según el schema; existe `child_status` con `active` y `archived`.
- [ ] Existen los índices `rooms_daycare_id_idx` y `children_room_id_idx`; RLS está habilitado y las tres policies respetan rol y guardería.
- [ ] La DB contiene exactamente las salas Soles, Lunas y Estrellas asociadas a Sala Soles, y cero filas en `children` antes del primer alta.
- [ ] `/kids` con sesión staff muestra «SALA SOLES · 0 niños» y la grilla vacía; el select ofrece las tres salas desde la DB.
- [ ] Un alta válida crea un registro, cierra el diálogo y lo muestra en `/kids`; el contador se incrementa y aparecen sus badges y «VINCULAR».
- [ ] Las etiquetas «Maní» y «Lactosa» se almacenan como `peanut` y `lactose`; una etiqueta desconocida como «Polen» se guarda en minúsculas y se muestra como «POLEN».
- [ ] El perfil `/kids/[id]` muestra nombre, edad derivada, fecha de nacimiento, sala, fecha de ingreso y alergias/notas reales; si no hay alergias ni notas muestra «Sin alergias ni notas registradas.»
- [ ] El perfil no muestra padres enlazados; «Vincular otro padre» conserva el diálogo mock. «Editar» y «Resumen del día» siguen con `href="#"`.
- [ ] Un ID inexistente devuelve 404; las rutas antiguas basadas en slug ya no resuelven perfiles.
- [ ] La validación conserva los mensajes de SPEC 04, el formulario no se cierra si hay errores y el error se limpia al corregir el campo.
- [ ] `features/kids/data.ts` ya no exporta `kids` ni `kidDetail` y conserva los exports que requiere `LinkParentDialog`.
- [ ] `npm run lint` y `npm run build` terminan correctamente y los flujos no generan errores de consola.

## Decisions

- **Sí:** usar tres salas «Soles», «Lunas» y «Estrellas» para Sala Soles; insertar primero «Soles» como sala de referencia.
- **Sí:** sembrar las salas sin niños; los registros de `children` se crean desde el alta real de `/kids`.
- **Sí:** Server Action en `features/kids/actions.ts`, de acuerdo con la arquitectura feature-driven y sin Route Handler interno.
- **Sí:** perfil identificado por UUID (`/kids/[id]`); se elimina `generateStaticParams` y los slugs anteriores dejan de ser rutas válidas.
- **Sí:** alergias en inglés en DB con traducción en UI; desconocidos se conservan en minúsculas.
- **Sí:** `enrolled_at` se fija a la fecha del día en el servidor; el mockup de alta no agrega un campo de ingreso.
- **Sí:** policies RLS scopeadas por guardería y rol, con `(select auth.uid())`; padres no tienen acceso a `children` hasta que exista `parent_children`.
- **Sí:** índices explícitos para ambas claves foráneas.
- **Sí:** avatar con inicial y tono determinístico derivados del nombre, sin agregar columnas ajenas al schema.
- **Sí:** lista vacía sin copy adicional; el mockup no define un estado vacío.
- **No:** edición/archivado, CRUD de salas, búsqueda, filtros, vinculación persistente de padres o feed real.

## Risks

| Riesgo                                                                | Mitigación                                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Las lecturas reales afectan prerenderizado con `cacheComponents`.     | Usar `export const instant = false` y `connection()` antes de leer, siguiendo SPEC 09; verificar `npm run build`.  |
| Policies incorrectas podrían exponer datos entre guarderías.          | Inspeccionar tablas existentes y verificar policies/RLS y advisors antes de dar por terminada la migración.        |
| Diferencia horaria entre servidor y guardería al fijar `enrolled_at`. | Aceptar fecha del servidor para esta versión; definir zona horaria por guardería en una spec futura si hace falta. |
| El cambio de `[slug]` a `[id]` invalida URLs viejas.                  | No hay links externos definidos; las URLs antiguas responderán 404.                                                |

## What is **not** in this spec

- Edición, archivado o eliminación de niños; CRUD de salas.
- Vinculación real de padres e invitaciones.
- Búsqueda, filtros y resumen diario.
- Feed real, fotos y configuración de consentimiento fotográfico.

Cada una de esas capacidades, si se implementa, va en su propia spec.
