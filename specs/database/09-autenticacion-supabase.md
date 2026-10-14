# SPEC 09 — Autenticación real con Supabase: login, logout y protección de rutas

> **Estado:** Approved
> **Depende de:** SPEC 03, SPEC 07, SPEC 08
> **Fecha:** 2026-10-13
> **Objetivo:** Implementar login y logout reales contra Supabase Auth (email/contraseña), proteger las rutas de `(app)` con `proxy.ts` y verificación de sesión, y mostrar el usuario real en la UI.

## Scope

**In:**

- Migración `add_auth_read_policies` vía Supabase MCP `apply_migration`: policy de select en `public.users` para la fila propia (`auth.uid() = id`, rol `authenticated`) y policy de select en `public.daycares` para `authenticated`; espejo local en `supabase/migrations/<versión>_add_auth_read_policies.sql` con la versión exacta devuelta por MCP, según el patrón de SPEC 07/08.
- `features/auth/` (nueva feature): `schema.ts` (validación manual email/contraseña), `actions.ts` (`loginAction` con `signInWithPassword` y redirect a `/`; `logoutAction` con `signOut` y redirect a `/auth/login`) y `components/LoginForm.tsx` (client, `useActionState`).
- `app/auth/login/page.tsx`: mantiene el panel de branding y estilos de SPEC 03; la columna del formulario pasa a `<LoginForm />` (inputs con placeholders del mockup, «¿Olvidaste tu contraseña?» sigue `href="#"`, botón «Iniciar sesión» pasa a ser submit con el mismo estilo de gradiente y queda deshabilitado mientras envía).
- Errores del login: inline bajo cada campo («Escribí tu email», «Ingresá un email válido», «Escribí tu contraseña»), se limpian al tipear en el campo; credenciales inválidas muestran «Email o contraseña incorrectos.» bajo el formulario, sin revelar si el email existe.
- Extensión de `server/auth/session.ts`: `updateSession` devuelve `{ response, user }`; nuevo tipo `SessionUser`, `getCurrentUser()` (React `cache()`: `getUser()` y select de `public.users` con `daycares(name)`) y `requireUser()` (redirect a `/auth/login` si no hay usuario).
- `proxy.ts`: redirige a `/auth/login` desde cualquier ruta fuera de `/auth/*` si no hay sesión; con sesión activa, redirige `/auth/*` a `/`. Al crear respuestas de redirect, conserva las cookies de sesión refrescadas por `updateSession`.
- `app/(app)/layout.tsx`: `export const instant = false`, `requireUser()` y paso de props al `Sidebar` (nombre, iniciales, subtítulo `«{rol} · {guardería}»`); el botón «Cerrar sesión» existente pasa a `<form action={logoutAction}><button>` con el mismo estilo.
- `app/(app)/page.tsx`: eyebrow `GUARDERÍA · {daycareName}` en mayúsculas y saludo `Buenas, {firstName}` derivados del usuario real; `<CreatePostDialog />` recibe `{ name, initials }` como props.
- `components/layout/Sidebar.tsx` y `features/feed/components/CreatePostDialog.tsx`: dejan de importar el mock `currentUser` y reciben props simples. `features/feed/data.ts` elimina `currentUser`; `room` queda solo con `meta`.
- Labels de rol en español: `userRoleLabels = { staff: "Staff", parent: "Familia", admin: "Admin" }` (subtítulo «Staff · Sala Soles» para el usuario de prueba).

**Fuera de alcance (para specs futuras):**

- Activación real de cuenta, invitaciones y signup público (`/auth/activate-account` solo recibe el redirect con sesión activa; la tabla `invitations` no existe).
- Recuperación de contraseña («¿Olvidaste tu contraseña?» sigue en `href="#"`) y OAuth, magic links o MFA.
- Policies de escritura, policies del resto de tablas y feed/niños reales: `posts` y `children` siguen siendo mocks.
- «Mi cuenta» editable y perfil del usuario.
- Consumo de `shared/lib/supabase-browser.ts` (existe, sin consumidores; queda para refresh client-side proactivo futuro).

## Data model

```ts
// server/auth/session.ts — extensión
export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  initials: string;
  role: "staff" | "parent" | "admin";
  daycareName: string;
};

const userRoleLabels: Record<SessionUser["role"], string> = {
  staff: "Staff",
  parent: "Familia",
  admin: "Admin",
};

// features/auth/schema.ts — validación manual, sin dependencia nueva
export type LoginFieldErrors = { email?: string; password?: string };
export function validateLogin(values: {
  email: string;
  password: string;
}): LoginFieldErrors;

// features/auth/actions.ts — estado del form (useActionState)
export type LoginState = { errors: LoginFieldErrors; formError?: string };
// formError: "Email o contraseña incorrectos."
```

```sql
-- supabase/migrations/<versión>_add_auth_read_policies.sql
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
```

Convenciones:

- `.env` ya contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (commit #13); confirmar los valores contra `get_project_url` y `get_publishable_keys` durante la implementación, sin guardar secretos en git.
- `server/db/client.ts` es el cliente para Server Components y Server Actions; `getCurrentUser` lo consume. No se usa `shared/lib/supabase-browser.ts` en esta spec.
- Email y contraseña se gestionan en `auth.users`; `public.users` conserva únicamente los datos de dominio.

## Implementation plan

1. Inspeccionar las tablas y policies remotas de `public.users` y `public.daycares`. Aplicar vía Supabase MCP `apply_migration` la migración `add_auth_read_policies`; registrar la versión devuelta, crear el archivo local con el SQL exacto y verificar `list_migrations`, las policies y `get_advisors` de seguridad.
2. Extender `server/auth/session.ts`: `updateSession` devuelve `{ response, user }`; agregar `SessionUser`, `getCurrentUser` (React `cache()`) y `requireUser`. Manual: `npm run build` pasa; todavía nada lo consume.
3. Crear `features/auth/schema.ts`, `features/auth/actions.ts` y `features/auth/components/LoginForm.tsx`; componer el formulario en `app/auth/login/page.tsx` sin alterar branding ni estilos. Manual: login con `camilo@gmail.com` / `111222` → `/`; credenciales incorrectas y campos inválidos muestran los mensajes acordados.
4. Agregar protección en `proxy.ts` usando la sesión obtenida por `updateSession`: sin sesión fuera de `/auth/*` → `/auth/login`; con sesión en `/auth/*` → `/`. Conservar las cookies de sesión refrescadas en las respuestas de redirect. Manual: navegación anónima a `/` y `/kids` redirige al login; con sesión, `/auth/login` redirige a `/`.
5. Integrar el usuario real en `app/(app)/layout.tsx` y `app/(app)/page.tsx`; pasar props a `Sidebar` y `CreatePostDialog`, quitar `currentUser` mock y convertir el botón de logout en form con Server Action. Manual: el sidebar muestra «Camilo Dávila» / «Staff · Sala Soles», el saludo muestra «Buenas, Camilo» y logout devuelve a `/auth/login`.
6. Validar flujos con Playwright (login válido/inválido/vacío, protección de `/`, `/kids` y un perfil, redirects con sesión activa, logout y reprotección), comparar `/auth/login` con `references/pantallas/login.dc.html` en desktop y 375px, ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] Login con `camilo@gmail.com` / `111222` navega a `/` con sesión iniciada; navegaciones posteriores a `/` no redirigen.
- [ ] El sidebar (desktop y drawer) muestra «Camilo Dávila», «Staff · Sala Soles» y avatar «C»; el header de `/` muestra «GUARDERÍA · SALA SOLES» y «Buenas, Camilo».
- [ ] Credenciales inválidas muestran «Email o contraseña incorrectos.» bajo el formulario, sin navegación.
- [ ] Submit con email vacío muestra «Escribí tu email»; email inválido muestra «Ingresá un email válido»; contraseña vacía muestra «Escribí tu contraseña». La validación ocurre antes de llamar a `signInWithPassword`.
- [ ] El error de un campo desaparece al editar ese campo.
- [ ] Sin sesión, `/`, `/kids` y un perfil `/kids/[slug]` redirigen a `/auth/login` con cambio de URL visible.
- [ ] Con sesión, `/auth/login` y `/auth/activate-account` redirigen a `/`.
- [ ] «Cerrar sesión» limpia la sesión, redirige a `/auth/login` y una visita posterior a `/` vuelve a redirigir al login.
- [ ] El botón «Iniciar sesión» queda deshabilitado mientras se procesa el formulario.
- [ ] `supabase/migrations/` agrega exactamente un archivo `<versión>_add_auth_read_policies.sql` y `list_migrations` muestra esa misma versión.
- [ ] Las policies permiten al usuario autenticado leer únicamente su fila en `users` y consultar `daycares`; `get_advisors` no reporta hallazgos WARN/ERROR para estas policies.
- [ ] `/auth/login` conserva el branding, copy, placeholders y comportamiento responsive de `references/pantallas/login.dc.html`.
- [ ] El feed y `/kids` conservan los mocks sin cambios (3 posts, 8 niños).
- [ ] `npm run lint` y `npm run build` terminan correctamente y la consola no muestra errores durante los flujos.

## Decisions

- **Sí:** login vía Server Action `signInWithPassword` y redirect a `/`; usa el cliente Supabase de servidor y no expone credenciales al navegador.
- **Sí:** `useActionState` con errores inline y mensaje genérico «Email o contraseña incorrectos.» para no revelar si el email existe.
- **Sí:** protección en dos capas: `proxy.ts` refresca/verifica la sesión en cada request; `requireUser()` valida al obtener el usuario para renderizar la experiencia autenticada.
- **Sí:** `export const instant = false` en `app/(app)/layout.tsx` para permitir el chequeo de sesión con `cacheComponents`.
- **Sí:** reutilizar la infraestructura existente: `proxy.ts`, `updateSession`, `server/db/client.ts` y `shared/lib/supabase-env.ts`.
- **Sí:** `getCurrentUser` usa React `cache()` para deduplicar lecturas durante el mismo render.
- **Sí:** policies RLS de lectura para la fila propia en `users` y para `daycares`, requerido por el perfil y el nombre de guardería.
- **Sí:** `Sidebar` y `CreatePostDialog` reciben props simples (`name`, `initials`, `subtitle`) y no importan módulos server-only.
- **Sí:** logout mediante Server Action desde el botón existente del sidebar.
- **No:** `zod`/`valibot`; validación manual sin dependencia nueva.
- **No:** mapear individualmente cada error de Supabase; se muestra un mensaje genérico.
- **No:** parámetro `?next=`; el login exitoso siempre redirige a `/`.
- **No:** cliente browser en esta spec; las operaciones de auth usan Server Actions y el refresco de sesión se realiza en `proxy.ts`.
- **No:** validar longitud mínima de contraseña en la UI; la autenticación de Supabase determina si las credenciales son válidas.

## Risks

| Riesgo                                                                               | Mitigación                                                                                                                                                 |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getUser()` en el proxy agrega una llamada a Auth por request.                       | Se usa para validar/actualizar la sesión según el patrón SSR de Supabase; mantener matcher acotado a rutas de la aplicación si el costo resulta relevante. |
| `cacheComponents` y la lectura de sesión pueden afectar el prerenderizado del shell. | Marcar el layout protegido con `export const instant = false` y verificar `npm run build`.                                                                 |
| Los layouts no se re-renderizan en cada navegación parcial.                          | El proxy protege los requests; futuras lecturas y mutaciones de datos deben verificar autorización cerca de la fuente.                                     |
| La policy de `daycares` permite lectura a cualquier usuario autenticado.             | Solo expone nombres de guarderías, necesarios para el encabezado; revisar si cambia la sensibilidad de estos datos.                                        |
| Un usuario de Auth sin fila en `public.users` no tiene perfil de aplicación.         | El usuario sembrado por SPEC 08 ya tiene perfil; el flujo de activación futura debe crear la fila antes de habilitar el acceso.                            |
| Una respuesta de redirect podría descartar cookies recién refrescadas.               | Copiar las cookies de la respuesta de `updateSession` a la respuesta de redirect y verificar la persistencia del login/logout.                             |

## What is **not** in this spec

- Activación real de cuenta, invitaciones, signup y recuperación de contraseña.
- OAuth, magic links y MFA.
- Feed y niños reales: `posts` y `children` continúan siendo mocks.
- «Mi cuenta» o perfil editable, ni refresh client-side proactivo.
- Cada una de esas capacidades, si se implementa, va en su propia spec.
