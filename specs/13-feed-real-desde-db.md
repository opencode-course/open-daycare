# SPEC 13 — Feed real desde DB

> **Estado:** Approved
> **Depende de:** SPEC 12 (crear-publicacion-persistente)
> **Fecha:** 2026-10-20
> **Objetivo:** Reemplazar los datos mock del feed con una query real a Supabase que cargue todos los posts persistidos, incluyendo fotos, children y author, con signed URLs y formateo de tiempo en el servidor.

## Scope

**In:**

- Función `getPosts()` en `features/feed/data.ts` que consulta la DB con una sola query usando múltiples JOINs.
- Carga de todos los posts (sin filtro por fecha), ordenados por `published_at DESC`, con `LIMIT 100`.
- JOIN con `users` para obtener nombre completo del autor.
- JOIN con `post_photos` para obtener fotos de cada post.
- JOIN con `post_children` y `children` para obtener nombres de niños específicos.
- Generación de signed URLs en batch desde el servidor para todas las fotos.
- Mapeo de filas de DB al tipo `Post` en `features/feed/data.ts` (función interna `mapDbRowToPost`).
- Formato de tiempo en el servidor: "HH:mm" si es hoy, "DD/MM HH:mm" si es otro día.
- Cálculo de `avatarInitials` desde el nombre completo (primera letra de nombre + primera letra de apellido).
- Determinación de `avatarTone` basado en si el post tiene `post_children`: `"child"` si tiene, `"staff"` si no.
- Campo `audience`: "Para: familia de [nombres separados por coma]" si tiene children, "Para: toda la sala" si no.
- Hardcodear `hearts: 0` y `comments: 0` (hasta implementar likes/comentarios en spec futura).
- Eliminación completa del array mock `posts` en `features/feed/data.ts` (conservar solo tipos y label maps).
- Actualización de `app/(app)/page.tsx` para usar `getPosts()` en lugar del mock.
- Actualización de `PostCard` para mostrar fotos reales (grid de imágenes si el post tiene fotos).
- Empty state con mensaje "No hay publicaciones aún" cuando no hay posts.
- Error handling con mensaje de error y botón retry que recarga la página (`window.location.reload()`).
- React Server Components con `Suspense` boundary para loading state.
- Suspense fallback: skeleton de 3 post cards (placeholders sin contenido).
- Uso de `postTypeLabels` para mostrar badges de tipo de post en español.
- Revalidación on-demand con `revalidatePath` (ya implementado en `createPost`, sin cambios).
- No mostrar info de sala en el feed (solo posts).

**Fuera de alcance (para specs futuras):**

- Paginación (infinite scroll o "load more").
- Filtros por sala, tipo de post o fecha.
- Likes y comentarios funcionales (tablas no existen en DB).
- Actualizaciones en tiempo real con Supabase Realtime.
- Info de sala en el feed.
- Truncado de nombres cuando hay muchos children.
- Modo oscuro.
- Caché time-based (solo revalidate on-demand).

## Data model

```ts
// features/feed/data.ts
export type PostType =
  | "meal"
  | "nap"
  | "activity"
  | "achievement"
  | "mood"
  | "photo"
  | "announcement";

export type PostPhoto = {
  id: string;
  url: string; // signed URL
  width?: number;
  height?: number;
};

export type Post = {
  id: string;
  type: PostType;
  authorId: string;
  author: string; // full name
  avatarInitials: string; // calculated from author name
  avatarTone: "child" | "staff"; // based on post_children
  time: string; // formatted: "HH:mm" or "DD/MM HH:mm"
  audience: string; // "Para: familia de X" or "Para: toda la sala"
  text: string;
  photos: PostPhoto[];
  hearts: number; // hardcoded 0
  comments: number; // hardcoded 0
};

export const postTypeLabels: Record<PostType, string> = {
  meal: "COMIDA",
  nap: "SIESTA",
  activity: "ACTIVIDAD",
  achievement: "LOGRO",
  mood: "ÁNIMO",
  photo: "FOTO",
  announcement: "ANUNCIO",
};

// Nueva función
export async function getPosts(): Promise<Post[]> {
  // 1. Query con JOINs: posts + users + post_photos + post_children + children
  // 2. Generar signed URLs para fotos en batch
  // 3. Mapear filas de DB a Post[] con mapDbRowToPost()
  // 4. Retornar posts ordenados por published_at DESC, LIMIT 100
}

// Función interna (no exportada)
function mapDbRowToPost(row: DbPostRow): Post {
  // Mapeo de columnas de DB a tipo Post
  // Calcular avatarInitials desde author name
  // Determinar avatarTone basado en post_children.length
  // Formatear published_at a string de tiempo
  // Construir audience string
}
```

## Implementation plan

1. Crear función `getPosts()` en `features/feed/data.ts` con query SQL que hace JOIN con `users`, `post_photos`, `post_children` y `children`. Ordenar por `published_at DESC` con `LIMIT 100`. Manejar errores retornando array vacío o lanzando excepción (decidir en implementación).

2. Implementar generación de signed URLs en batch: después de obtener posts, extraer todas las rutas de Storage de `post_photos`, llamar a `storage.from('posts').createSignedUrls()` una vez, y mapear URLs firmadas a cada foto.

3. Crear función interna `mapDbRowToPost()` en `data.ts` que transforma filas de DB al tipo `Post`. Calcular `avatarInitials` (primera letra de nombre + primera letra de apellido). Determinar `avatarTone` basado en si `post_children.length > 0`. Formatear `published_at` a "HH:mm" si es hoy, "DD/MM HH:mm" si es otro día. Construir `audience` como "Para: familia de [nombres separados por coma]" o "Para: toda la sala". Hardcodear `hearts: 0` y `comments: 0`.

4. Eliminar el array mock `posts` de `features/feed/data.ts`, conservando solo los tipos (`Post`, `PostType`, `PostPhoto`) y `postTypeLabels`.

5. Actualizar `app/(app)/page.tsx` para llamar a `getPosts()` en lugar de importar el mock. Envolver la sección de posts en un `Suspense` boundary con fallback de skeleton (3 post cards placeholders).

6. Manejar error state: si `getPosts()` falla, mostrar mensaje de error con botón retry que ejecuta `window.location.reload()`.

7. Manejar empty state: si `getPosts()` retorna array vacío, mostrar mensaje "No hay publicaciones aún".

8. Actualizar `features/feed/components/PostCard.tsx` para mostrar fotos reales: si `post.photos.length > 0`, renderizar grid de imágenes con los signed URLs.

9. Insertar 3-5 posts de prueba en la DB para verificación: diferentes tipos (achievement, activity, announcement), algunos con children específicos, algunos con fotos.

10. Validar el resultado: navegar a `/`, verificar que aparecen los posts creados, fotos cargan correctamente, formateo de tiempo es correcto, empty state y error state funcionan. Ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] La ruta `/` llama a `getPosts()` y muestra posts reales desde la DB.
- [ ] Los posts se ordenan por `published_at DESC` (más recientes primero).
- [ ] Se muestran máximo 100 posts (`LIMIT 100`).
- [ ] El nombre completo del autor se muestra (JOIN con `users`).
- [ ] Las iniciales del autor se calculan correctamente (primera letra de nombre + apellido).
- [ ] Las fotos se cargan desde `post_photos` con signed URLs generadas en batch.
- [ ] `PostCard` muestra fotos en grid cuando el post tiene fotos.
- [ ] El audience muestra "Para: familia de [nombres]" si tiene children, "Para: toda la sala" si no.
- [ ] Los nombres de children se muestran separados por coma.
- [ ] El tiempo se formatea en el servidor: "HH:mm" si es hoy, "DD/MM HH:mm" si es otro día.
- [ ] `avatarTone` es `"child"` si el post tiene children, `"staff"` si no.
- [ ] `hearts` y `comments` se muestran como `0`.
- [ ] Los badges de tipo de post usan `postTypeLabels` para mostrar texto en español.
- [ ] El array mock `posts` se elimina de `features/feed/data.ts`.
- [ ] Se muestra skeleton de 3 post cards mientras cargan los posts (Suspense fallback).
- [ ] Se muestra mensaje "No hay publicaciones aún" cuando no hay posts.
- [ ] Se muestra mensaje de error con botón retry cuando la query falla.
- [ ] El botón retry recarga la página completa (`window.location.reload()`).
- [ ] Después de crear un post con `createPost`, el feed se actualiza automáticamente (vía `revalidatePath`).
- [ ] No se muestra info de sala en el feed.
- [ ] Se insertan 3-5 posts de prueba en la DB para verificación.
- [ ] `npm run lint` y `npm run build` terminan correctamente.
- [ ] La consola del navegador no muestra errores al cargar `/`.

## Decisions

- **Sí:** función `getPosts()` en `features/feed/data.ts` reemplaza el array mock.
- **Sí:** una sola query con múltiples JOINs (posts + users + post_photos + post_children + children).
- **Sí:** generar signed URLs en batch desde el servidor (no URLs públicas).
- **Sí:** mapeo de filas de DB a tipo `Post` en `data.ts` (función interna `mapDbRowToPost`).
- **Sí:** formato de tiempo en el servidor: "HH:mm" si es hoy, "DD/MM HH:mm" si es otro día.
- **Sí:** calcular `avatarInitials` desde el nombre completo (primera letra de nombre + apellido).
- **Sí:** `avatarTone` basado en si el post tiene `post_children`: `"child"` si tiene, `"staff"` si no.
- **Sí:** mostrar todos los nombres de children separados por coma en el audience.
- **Sí:** hardcodear `hearts: 0` y `comments: 0` (hasta implementar likes/comentarios).
- **Sí:** eliminar completamente el array mock `posts`.
- **Sí:** actualizar `PostCard` para mostrar fotos reales.
- **Sí:** empty state con mensaje "No hay publicaciones aún".
- **Sí:** error state con mensaje y botón retry (`window.location.reload()`).
- **Sí:** React Server Components con `Suspense` boundary y skeleton fallback.
- **Sí:** `LIMIT 100` por seguridad (sin paginación).
- **Sí:** solo revalidate on-demand con `revalidatePath` (sin time-based cache).
- **Sí:** insertar 3-5 posts de prueba en la DB.
- **No:** paginación (infinite scroll o "load more").
- **No:** filtros por sala, tipo de post o fecha.
- **No:** info de sala en el feed.
- **No:** likes y comentarios funcionales.
- **No:** actualizaciones en tiempo real con Supabase Realtime.
- **No:** modo oscuro.
- **No:** caché time-based.

## Risks

| Riesgo                                                                          | Mitigación                                                                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Query con múltiples JOINs puede ser lenta con muchos posts.                     | `LIMIT 100` por ahora; si hay problemas de performance, considerar paginación o función DB en spec futura.       |
| Generación de signed URLs en batch puede fallar si hay muchas fotos.            | Manejar errores de Storage gracefully; si falla, mostrar post sin fotos o mensaje de error.                      |
| Cálculo de iniciales puede fallar con nombres inusuales (ej: una sola palabra). | Fallback: si no hay apellido, usar solo primera letra del nombre.                                                |
| Suspense boundary puede causar flashing si la query es lenta.                   | Skeleton fallback proporciona feedback visual; si es molesto, considerar streaming parcial en spec futura.       |
| Error handling con `window.location.reload()` puede ser agresivo.               | Alternativa: reintentar solo la query sin recargar página completa (implementar en spec futura si es necesario). |
| Posts de prueba pueden confundir a usuarios reales.                             | Marcar posts de prueba con texto claro (ej: "Post de prueba") o eliminar después de verificación.                |

## What is **not** in this spec

- Paginación (infinite scroll o "load more").
- Filtros por sala, tipo de post o fecha.
- Likes y comentarios funcionales.
- Actualizaciones en tiempo real con Supabase Realtime.
- Info de sala en el feed.
- Modo oscuro.
- Caché time-based.
- Truncado de nombres cuando hay muchos children.
- Función DB en PostgreSQL (query inline en `data.ts`).
- Botón refresh explícito en la UI.
