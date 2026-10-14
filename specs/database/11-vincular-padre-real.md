# SPEC 11 — Vinculación real de padres: invitaciones con código y activación de cuenta

> **Estado:** Approved
> **Depende de:** SPEC 05, SPEC 09, SPEC 10
> **Fecha:** 2026-10-14
> **Objetivo:** Crear `invitations` y `parent_children` con RLS, generar y persistir el código al enviar la invitación desde el diálogo de `/kids/[id]`, y activar la cuenta del padre con ese código en `/auth/activate-account` (email, contraseña y consentimiento de fotos), dejando la sesión iniciada y al padre visible en PADRES VINCULADOS.

## Scope

**In:**

- Migraciones vía Supabase MCP `apply_migration` + espejo local exacto en `supabase/migrations/<versión>_<nombre>.sql`:
  - `create_parent_children`: enum `relationship_type` (`father`/`mother`/`guardian`), tabla con FKs a `users` y `children`, `relationship`, `created_at`, `unique (parent_id, child_id)`, índices en ambas FKs, RLS.
  - `create_invitations`: enum `invitation_status` (`pending`/`accepted`/`expired`/`cancelled`), tabla con FKs a `children` y `users`, `full_name`, `email`, `relationship`, `code text unique`, `status` default `pending`, `expires_at`, `accepted_at` nullable, `created_at`, índice en `child_id`, RLS.
  - `add_invitations_parent_children_policies`: función `current_user_daycare_id()` (SECURITY DEFINER) + policies `users_select_same_daycare`, `parent_children_select_staff_daycare`, `invitations_select_staff_daycare` e `invitations_insert_staff_daycare` (staff/admin de la guardería del niño, vía `children → rooms → daycares`).
- Service role: `SUPABASE_SERVICE_ROLE_KEY` nueva en `.env` y `.env.template` (secreto, nunca en git ni logs); `shared/lib/supabase-env.ts` la lee y valida; nuevo `server/db/service-client.ts` con `createServiceClient()` (`server-only`).
- `features/kids/parent.ts`: `RelationshipType` + maps `relationshipByRole` / `roleByRelationship` (`tutor` ↔ `guardian`); labels «Mamá/Papá/Tutor/a» sin cambio.
- `features/kids/actions.ts`: `inviteParentAction({ childId, parentName, email, role })` — `requireUser` staff/admin, validación con los mensajes de SPEC 05, renovación de duplicadas (misma email lowercase + niño: pendiente anterior → `cancelled`), código de 5 mayúsculas del alfabeto de 32 sin `0/O/1/I` (único en `invitations`, reintentos), insert con `expires_at` = ahora + 7 días, `revalidatePath` de `/kids` y `/kids/[id]`, devuelve `{ success, code }` o errores.
- `features/kids/components/LinkParentDialog.tsx`: nueva prop `childId`; submit llama a `inviteParentAction` (errores inline como SPEC 05); al éxito **no se cierra**: estado de éxito con el código real en la caja (estilo actual «7K4P9»), «Vence en 7 días» y botón «Copiar» (clipboard, label → «¡Copiado!»); el cierre (X/Esc/backdrop) resetea al form limpio (patrón existente).
- `features/kids/data.ts`: `getParentsForKid(childId)` — activos (`parent_children` + `users.full_name`) y pendientes (`invitations` con `status = 'pending'` y `expires_at > now()`), mapeados a `ParentLink` (avatar inicial/tono derivados del nombre como `Kid`); activos primero, orden por nombre.
- `app/(app)/kids/[id]/page.tsx`: PADRES VINCULADOS renderiza la lista estilo mockup `perfil-nino.dc.html` — avatar 40px con tono, nombre, «{Parentesco} · {estado}» (`parentRoleLabels` + `parentStatusText`), badge ACTIVA (`#CFEBD8`/`#3E9B6C`) o PENDIENTE (`#F7E7A6`/`#9A7B1E`), luego «Vincular otro padre»; vacío → solo el link (patrón SPEC 10).
- `features/auth/schema.ts`: `validateActivation({ code, email, password })` con copy: «Ingresá el código», «Escribí tu email», «Ingresá un email válido», «Escribí tu contraseña», «La contraseña debe tener al menos 6 caracteres».
- `features/auth/actions.ts`:
  - `activateAccountAction` (anónima, `useActionState`): valida campos → normaliza código (trim + mayúsculas) y email (trim + minúsculas) → service client busca la invitación: inexistente/`cancelled` → «El código no es válido»; `accepted` → «Este código ya fue usado.»; `pending` vencida → se actualiza a `expired` + «La invitación venció. Pedí una nueva.»; email ≠ invitación → «El email no coincide con la invitación.» → `auth.admin.createUser` (si falla por email ya registrado → «Ya existe una cuenta con este email. Iniciá sesión.») → insert `public.users` (role `parent`, guardería del niño, `full_name` de la invitación) → insert `parent_children` (parentesco de la invitación) → actualizar `children.photo_consent` según el checkbox → invitación `accepted` + `accepted_at` → `revalidatePath` → `signInWithPassword` (cliente normal, cookies de sesión) → redirect a `/`.
  - `checkInvitationCodeAction(code)`: devuelve `{ childName, roomName }` si el código es una `pending` no vencida; si no, `null`.
- `features/auth/components/ActivateAccountForm.tsx` (nuevo, client): replica labels, placeholders, checkbox y estilos actuales de `app/auth/activate-account/page.tsx`; submit deshabilitado mientras envía; errores inline + `formError` bajo el form; sección «Te invitaron a seguir a» oculta hasta que el código (5 caracteres) verifica OK contra `checkInvitationCodeAction` — entonces muestra avatar con inicial/tono + «{Niño} · {Sala}» reales.
- `app/auth/activate-account/page.tsx`: mantiene branding/estilo; el form pasa a `<ActivateAccountForm />` (patrón login de SPEC 09). `proxy.ts` sin cambios (anónima accesible; con sesión redirige a `/`).

**Fuera de alcance (para specs futuras):**

- Envío real de email con el código (el staff lo comparte a mano).
- Vincular una cuenta ya existente a otro niño (se rechaza con mensaje).
- family-feed (vista del padre): tras activar, el padre ve el feed actual de `/`.
- Expiración proactiva (cron) y UI de gestión de invitaciones (listar/cancelar/ver código desde la lista).
- Feed real, resumen del día, edición de niños, OAuth/magic links.

## Data model

```sql
-- create_parent_children
create type public.relationship_type as enum ('father', 'mother', 'guardian');

create table public.parent_children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users (id),
  child_id uuid not null references public.children (id),
  relationship public.relationship_type not null,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id)
);

create index parent_children_parent_id_idx on public.parent_children (parent_id);
create index parent_children_child_id_idx on public.parent_children (child_id);
alter table public.parent_children enable row level security;

-- create_invitations
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'cancelled');

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id),
  invited_by uuid not null references public.users (id),
  full_name text not null,
  email text not null,
  relationship public.relationship_type not null,
  code text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index invitations_child_id_idx on public.invitations (child_id);
alter table public.invitations enable row level security;
```

```sql
-- add_invitations_parent_children_policies
create or replace function public.current_user_daycare_id()
returns uuid language sql stable security definer set search_path = ''
as $$ select daycare_id from public.users where id = auth.uid() $$;

create policy users_select_same_daycare
  on public.users for select to authenticated
  using (daycare_id = public.current_user_daycare_id());

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
```

```ts
// features/kids/actions.ts
export type InviteParentValues = {
  childId: string;
  parentName: string;
  email: string;
  role: ParentRole;
};

export type InviteParentActionResult = {
  errors: { parentName?: string; email?: string; role?: string };
  formError?: string; // "No se pudo enviar la invitación. Intentá de nuevo."
  code?: string; // código generado, solo con success
  success: boolean;
};

// features/kids/data.ts
export async function getParentsForKid(childId: string): Promise<ParentLink[]>;

// features/auth/schema.ts + actions.ts
export type ActivationFieldErrors = {
  code?: string;
  email?: string;
  password?: string;
};

export type ActivationState = {
  errors: ActivationFieldErrors;
  formError?: string;
};

export async function activateAccountAction(
  _prev: ActivationState,
  formData: FormData, // code, email, password, photoConsent
): Promise<ActivationState>;

export type InvitationPreview = { childName: string; roomName: string } | null;
export async function checkInvitationCodeAction(
  code: string,
): Promise<InvitationPreview>;
```

Convenciones:

- Email persistido y comparado en minúsculas; código en mayúsculas y normalizado (trim + upper) en ambos lados.
- `expires_at` = `now() + 7 días` en UTC; vencimiento evaluado al activar (perezoso, sin cron).
- Alfabeto del código: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 caracteres).

## Implementation plan

1. Inspeccionar tablas/policies remotas; aplicar `create_parent_children`, `create_invitations` y `add_invitations_parent_children_policies` vía MCP; espejos locales con versiones exactas; verificar `list_migrations`, estructura, policies y `get_advisors`. Manual: `/kids` sigue igual.
2. Agregar `SUPABASE_SERVICE_ROLE_KEY` (`.env` + `.env.template`), extender `shared/lib/supabase-env.ts` y crear `server/db/service-client.ts`. Manual: `npm run build` pasa; nada lo consume aún.
3. Extender `features/kids/parent.ts` (maps) y agregar `inviteParentAction` en `features/kids/actions.ts` (validación, renovación, código, insert, revalidate). Manual: build pasa.
4. Conectar `LinkParentDialog` (prop `childId`, submit real, estado de éxito con código + «Copiar», reset al cerrar) y pasar `childId` desde la página. Manual: invitación válida → código visible y fila `pending` en DB; errores como SPEC 05.
5. Agregar `getParentsForKid` y renderizar PADRES VINCULADOS en `/kids/[id]`. Manual: pendiente visible con badge PENDIENTE.
6. `validateActivation`, `activateAccountAction`, `checkInvitationCodeAction`, `ActivateAccountForm` y rework de la página de activación. Manual: flujo completo invitar → activar → sesión + `/` → padre ACTIVA.
7. Validación end-to-end con Playwright (todos los errores, renovación de duplicada, consentimiento con/sin marcar, sesión post-activación), `npm run lint` y `npm run build`.

## Acceptance criteria

- [x] `supabase/migrations/` agrega las tres migraciones con versiones exactas de MCP; `list_migrations` las muestra.
- [x] `parent_children` e `invitations` tienen columnas, FKs, `unique (parent_id, child_id)`, `code` UNIQUE e índices según el schema; RLS habilitado.
- [x] Las 4 policies y `current_user_daycare_id()` existen y limitan acceso por guardería/rol; `get_advisors` no reporta hallazgos WARN/ERROR.
- [x] «Enviar invitación» con los tres campos válidos crea una fila `pending` (invited_by, email en minúsculas, parentesco, expires_at +7 días) y el diálogo muestra el código con «Vence en 7 días» y «Copiar» que copia al portapapeles.
- [x] El código tiene 5 mayúsculas sin `0/O/1/I` y es único en `invitations`.
- [ ] Reenviar para el mismo email y niño deja la pendiente anterior `cancelled` y crea una nueva `pending`.
- [x] Los errores de validación del diálogo muestran los mensajes de SPEC 05 y no crean invitación.
- [x] PADRES VINCULADOS muestra la pendiente («{Parentesco} · invitación enviada», badge PENDIENTE), al padre activo con badge ACTIVA tras activar, y solo «Vincular otro padre» cuando no hay ninguno.
- [x] `/auth/activate-account` es accesible sin sesión; con sesión redirige a `/`.
- [x] Un código válido muestra «{Niño} · {Sala}» reales en la sección; inválido/vencido la mantiene oculta hasta el submit.
- [x] Activación válida crea el auth user confirmado, `public.users` (role `parent`, guardería del niño), `parent_children` con el parentesco de la invitación, actualiza `children.photo_consent` según el checkbox, marca la invitación `accepted` con `accepted_at`, inicia sesión y redirige a `/`.
- [x] Tras activar, el sidebar muestra el nombre del padre y «Familia · {guardería}», y el perfil del niño lo lista como ACTIVA.
- [x] Código inexistente → «El código no es válido»; usado → «Este código ya fue usado.»; vencido → «La invitación venció. Pedí una nueva.» (fila pasa a `expired`); email distinto → «El email no coincide con la invitación.»; cuenta existente → «Ya existe una cuenta con este email. Iniciá sesión.».
- [x] Campos vacíos/inválidos muestran los mensajes definidos y se limpian al editar el campo.
- [x] Al reabrir el diálogo tras un envío, vuelve al formulario limpio.
- [x] `npm run lint` y `npm run build` terminan correctamente y los flujos no generan errores de consola.

## Decisions

- **Sí:** una sola spec vertical con todo el flujo (decisión del usuario; precedente 09/10; el registro no es demostrable sin la generación real del código).
- **Sí:** Admin API `auth.admin.createUser` con `email_confirm: true` + service role key; sin dependencia del email de confirmación y con una acción atómica.
- **Sí:** insert explícito de `public.users` desde la acción, sin el trigger de `auth.users` del schema doc; no usamos signup público y la acción ya orquesta todo.
- **Sí:** `SUPABASE_SERVICE_ROLE_KEY` solo-servidor; nunca `NEXT_PUBLIC_` ni en git.
- **Sí:** sin email real; el código se muestra al staff con «Copiar».
- **Sí:** renovación de duplicadas (anterior → `cancelled`, nueva con vencimiento fresco).
- **Sí:** código de 5 chars/32 símbolos, único, vence a 7 días; expiración perezosa al activar, sin cron.
- **Sí:** rechazar email con cuenta existente (mapeo del error «User already registered» de `createUser`).
- **Sí:** el checkbox persiste en `children.photo_consent` (campo existente); opcional, default desmarcado como el mockup.
- **Sí:** función `current_user_daycare_id()` SECURITY DEFINER para `users_select_same_daycare`; una policy de `users` auto-referenciada causa recursión infinita en Postgres.
- **Sí:** mapeo `tutor` ↔ `guardian`; labels visuales sin cambio.
- **Sí:** sección del niño dinámica vía `checkInvitationCodeAction`, oculta hasta verificar (no se inventa estado neutro).
- **Sí:** sesión + redirect a `/` tras activar (patrón `loginAction`).
- **No:** trigger sobre `auth.users`, signup público, email real, cron de expiración, UI de gestión de invitaciones, family-feed.

## Risks

| Riesgo                                                                 | Mitigación                                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Service role key en runtime                                            | `server-only` en `service-client.ts`; solo Server Actions; nunca en bundle client.                |
| La activación no es transaccional (Admin API + PostgREST)              | Orden fijo de escritura; una falla intermedia queda documentada (revisar con RPC en spec futura). |
| `users_select_same_daycare` expone filas de `users` al tenant (padres) | Tenant cerrado, campos no sensibles; revisar en la spec de family-feed.                           |
| Colisión de códigos                                                    | 32^5 ≈ 33M combinaciones + UNIQUE de `code`; reintentos y error genérico si persiste.             |
| Renovación/activación concurrentes                                     | UNIQUE (`parent_id`,`child_id`) y `code` como red de seguridad; error genérico.                   |
| Mínimo de contraseña distinto en la config del proyecto                | Verificar la config real de Auth durante la implementación y mapear el error del Admin API.       |

## What is **not** in this spec

- Envío real de email con el código.
- Vincular una cuenta ya existente a otro niño.
- family-feed (vista del padre tras activar).
- Cron de expiración y UI de gestión de invitaciones.
- Feed real, resumen del día, edición de niños.

Cada una de esas capacidades, si aterriza, va en su propia spec.
