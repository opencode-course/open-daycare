# SPEC 12 — Publicación persistente con imágenes

> **Estado:** Done
> **Depende de:** SPEC 06, SPEC 10
> **Fecha:** 2026-10-20
> **Objetivo:** Conectar el diálogo de crear publicación (SPEC 06) con persistencia real en Supabase — tablas `posts`, `post_children`, `post_photos` —, habilitar la suba de hasta 3 imágenes por publicación al bucket público `posts`, y hacer `revalidatePath` para que el feed refrezque.

## Scope

**In:**

- Migración única via Supabase MCP `apply_migration`: enum `post_type` (incluye `mood`, ver Decisions), tablas `posts`, `post_children`, `post_photos`, policies RLS e índices. Espejar SQL exacto en `supabase/migrations/<versión>_crear_publicaciones.sql`.
- Bucket público `posts` en Supabase Storage (creación via MCP o Dashboard, no es migración SQL).
- Server Action `createPost` en `features/feed/actions.ts`: validar inputs, verificar sesión staff, crear post en DB, subir fotos a Storage con path `posts/{post_id}/{position}.{ext}`, insertar `post_photos`, insertar `post_children` si aplica. Rollback completo si falla algún paso (borrar fotos de Storage + post). Retornar resultado con mensaje de error al cliente. `revalidatePath('/', 'page')` al finalizar.
- Evolución de `CreatePostDialog.tsx`: reemplazar sección FOTOS decorativa con file picker funcional. Input `file` múltiple con `accept="image/jpeg,image/png,image/webp,image/heic"`. Máximo 3 archivos, máximo 5MB cada uno. Previews via `URL.createObjectURL` con thumbnails y botón eliminar por foto. Validación client-side (rechazo antes de agregar) y server-side (seguridad).
- El dialog recibe los niños reales de DB como props desde el page `/`. Reemplazar slugs mock por UUIDs reales de `children`. El page `/` pasa a cargar niños via `getKids()` (SPEC 10) y se vuelve dinámica (`connection()` + `export const instant = false`, siguiendo patrón de SPEC 10).
- Actualizar tipos en `features/feed/data.ts` para reflejar el schema real en la estructura de `Post` (agregar `authorId`, `photos: PostPhoto[]`), manteniendo datos mock existentes hasta que una spec futura lea el feed de DB.

**Fuera de alcance (para specs futuras):**

- Feed real desde DB; el feed sigue mostrando posts mock. Los posts creados se persisten pero no aparecen hasta que una spec futura los lea.
- Rutas detalle-publicacion y foto.
- Likes, comentarios y reacciones funcionales.
- `room_id` en posts: el campo existe en la tabla pero la UI no lo expone. `wholeRoom` se mapea a ausencia de `post_children` (no a `room_id`).
- Optimización de imágenes al consumir (Supabase Image Transformations se usará cuando el feed las renderice).
- Edición o eliminación de publicaciones.
- Consentimiento fotográfico (`children.photo_consent`).

## Data model

```sql
-- Enum post_type (extiende el schema reference con 'mood' para match con mockup y SPEC 06)
create type public.post_type as enum (
  'meal', 'nap', 'activity', 'achievement', 'mood', 'photo', 'announcement'
);

-- Tabla posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (id),
  room_id uuid references public.rooms (id),
  type public.post_type not null,
  title text,
  body text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_author_id_idx on public.posts (author_id);
create index posts_published_at_idx on public.posts (published_at desc);
create index posts_room_id_idx on public.posts (room_id);
alter table public.posts enable row level security;

-- Tabla post_children (PK compuesta)
create table public.post_children (
  post_id uuid not null references public.posts (id) on delete cascade,
  child_id uuid not null references public.children (id),
  primary key (post_id, child_id)
);

create index post_children_child_id_idx on public.post_children (child_id);
alter table public.post_children enable row level security;

-- Tabla post_photos
create table public.post_photos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  url text not null,
  width int,
  height int,
  position int not null,
  created_at timestamptz not null default now()
);

create index post_photos_post_id_idx on public.post_photos (post_id);
alter table public.post_photos enable row level security;
```

Policies previstas (verificar schema remoto antes de aplicar):

- `posts_select_authenticated`: `authenticated` puede leer posts.
- `posts_insert_staff`: solo `staff` o `admin` puede insertar, verificando `author_id = auth.uid()`.
- `post_children_select_authenticated`: `authenticated` puede leer post_children.
- `post_children_insert_staff`: solo staff puede insertar post_children de posts propios.
- `post_photos_select_authenticated`: `authenticated` puede leer post_photos.
- `post_photos_insert_staff`: solo staff puede insertar post_photos de posts propios.

```ts
// features/feed/data.ts — tipos nuevos/agregados
export type PostPhoto = {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  position: number;
};

// features/feed/actions.ts — nuevo
export type CreatePostResult =
  | { success: true }
  | { success: false; error: string };

export async function createPost(formData: FormData): Promise<CreatePostResult>;
```

Convenciones:

- Path de Storage: `posts/{post_id}/{position}.{ext}` donde `ext` es `jpeg`, `png`, `webp` o `heic` según el archivo original.
- Valores internos en inglés; copy visible en español (label maps existentes).
- Migración local con versión exacta devuelta por `apply_migration`; nunca inventar versiones.
- El tipo `mood` se agrega al enum DB para match con los 7 tipos del mockup y SPEC 06; el schema reference solo tenía 6.

## Implementation plan

1. Inspeccionar tablas, migraciones y policies remotas existentes. Crear bucket público `posts` via Supabase MCP. Aplicar migración `crear_publicaciones` con enum, tablas, índices y policies; espejar SQL en `supabase/migrations/`. Verificar estructura, policies y advisors.
2. Crear `features/feed/actions.ts` con `createPost`: validar sesión staff, validar inputs (tipo, descripción no vacía, children IDs o wholeRoom, hasta 3 fotos de ≤5MB con MIME permitido), insertar post, subir fotos a Storage, insertar `post_photos`, insertar `post_children` si aplica. Rollback completo en error. `revalidatePath('/', 'page')` al finalizar.
3. Actualizar `features/feed/data.ts` con tipos `PostPhoto` y estructura actualizada. Mantener datos mock existentes.
4. Evolucionar `CreatePostDialog.tsx`: reemplazar FOTOS decorativa con input file múltiple, previews `URL.createObjectURL`, thumbnails con botón eliminar, validación client-side de tipo/tamaño/cantidad. Cambiar slugs de niños por UUIDs reales. El dialog recibe `kids` como prop desde el page.
5. Actualizar `app/(app)/page.tsx` para cargar kids reales via `getKids()` y pasarlos al dialog. Aplicar patrón de SPEC 10 para página dinámica (`connection()` + `export const instant = false`).
6. Validar con Playwright: publicar sin fotos (solo texto), publicar con 1-3 fotos, publicar con fotos y texto, error con >3 fotos o >5MB, rollback simulado, error inline visible. Ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] `supabase/migrations/` contiene la migración `crear_publicaciones` con la versión devuelta por MCP; SQL local coincide con el remoto.
- [ ] El enum `post_type` existe con los 7 valores: meal, nap, activity, achievement, mood, photo, announcement.
- [ ] Tablas `posts`, `post_children`, `post_photos` existen con columnas, tipos, FKs y defaults según el schema; RLS habilitado y policies verificadas.
- [ ] Existen índices en `posts(author_id)`, `posts(published_at)`, `posts(room_id)`, `post_children(child_id)`, `post_photos(post_id)`.
- [ ] Bucket `posts` existe en Supabase Storage y es público.
- [ ] Publicar sin fotos crea una fila en `posts` y, si aplica, en `post_children`; no hay filas en `post_photos`.
- [ ] Publicar con 1-3 fotos crea filas en `posts`, `post_children` (si aplica) y `post_photos`; las fotos están en Storage en `posts/{post_id}/{position}.{ext}`.
- [ ] Publicar con >3 fotos o archivos >5MB es rechazado tanto en el client (antes de agregar) como en el server.
- [ ] Si falla algún paso (upload, insert), se hace rollback completo: se borran fotos ya subidas de Storage y el post de DB. El usuario ve un mensaje de error inline.
- [ ] La sección FOTOS del dialog muestra previews reales con thumbnails y botón eliminar; el file picker acepta solo los tipos MIME permitidos.
- [ ] El dialog muestra los niños reales de DB (UUIDs, no slugs) cargados desde `getKids()`.
- [ ] `revalidatePath('/', 'page')` se ejecuta tras crear; el feed se recarga (aunque siga mostrando mock, la página se re-renderiza).
- [ ] `npm run lint` y `npm run build` terminan correctamente.

## Decisions

- **Sí:** bucket público `posts`; las fotos de publicaciones no son datos sensibles en este contexto (staff las publica, padres las ven en el feed del hijo).
- **Sí:** subir archivo original sin transformación client-side; las optimizaciones se aplican al consumir via Supabase Image Transformations.
- **Sí:** validación en ambos lados — client para UX inmediato, server para seguridad.
- **Sí:** crear post primero → subir fotos → insertar post_photos; el `post_id` es necesario para el path de Storage.
- **Sí:** rollback completo si falla algún paso; mejor consistencia que un post incompleto.
- **Sí:** `revalidatePath` para refetch del feed; estándar Next.js.
- **Sí:** server action en `features/feed/actions.ts` siguiendo el patrón de `features/kids/actions.ts`.
- **Sí:** previews con `URL.createObjectURL`; más eficiente en memoria que base64.
- **Sí:** máximo 3 fotos por publicación; suficiente para reportes de actividad.
- **Sí:** imágenes opcionales en todos los tipos de post; no se exige foto para tipo `photo`.
- **Sí:** agregar `mood` al enum DB aunque no esté en el schema reference; ya está en el código (SPEC 06) y en el mockup.
- **Sí:** page `/` se vuelve dinámica para cargar niños reales; necesario para que el dialog use UUIDs.
- **No:** feed real desde DB; queda para una spec futura.
- **No:** edición, eliminación, likes, comentarios, rutas detalle.
- **No:** optimización client-side de imágenes antes de subir.
- **No:** `room_id` en la UI de esta spec; el campo existe pero no se expone.

## Risks

| Riesgo                                                             | Mitigación                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Rollback parcial si falla upload de alguna foto.                   | Borrar fotos ya subidas en Storage antes de borrar el post; envolver en try/catch.                                  |
| Bucket público expone fotos si se conoce la URL.                   | Aceptado para este contexto; si se requiere privacidad, migrar a bucket privado con signed URLs en una spec futura. |
| Page `/` se vuelve dinámica y pierde prerender.                    | Aceptado; el feed ya necesita datos reales pronto. Usar `connection()` + `instant = false` como SPEC 10.            |
| `mood` no está en el schema reference.                             | Se agrega al enum; documentado en Decisions. El mockup y SPEC 06 ya lo tienen.                                      |
| Discrepancia entre slugs mock y UUIDs reales al cambiar el dialog. | El dialog recibe kids reales como props; no se hace conversión slug→UUID.                                           |

## What is **not** in this spec

- Feed real desde DB; los posts creados se persisten pero no aparecen en el feed hasta que una spec futura los lea.
- Rutas detalle-publicacion y foto.
- Likes, comentarios, reacciones funcionales.
- Edición o eliminación de publicaciones.
- Optimización de imágenes al consumir.
- Consentimiento fotográfico (`children.photo_consent`).
- `room_id` en la UI (anuncios de sala).

Cada una de esas capacidades, si se implementa, va en su propia spec.
