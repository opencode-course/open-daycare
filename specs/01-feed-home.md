# SPEC 01 — Home Feed

> **Estado:** Approved
> **Depende de:** — (primera spec)
> **Fecha:** 2026-10-07
> **Objetivo:** Implementar como ruta `/` la pantalla Feed de `references/pantallas/feed.dc.html` con datos mock, sin autenticación ni base de datos y con fidelidad visual al diseño.

## Scope

**In:**

- Shell compartido de la aplicación con sidebar fija de 248px desde 1024px y drawer con hamburguesa por debajo de 1024px.
- Topbar sticky solo en móvil, con botón hamburguesa y mini logo OpenDayCare.
- Drawer móvil superpuesto con backdrop; se cierra al tocar el backdrop o el botón de cierre.
- Página `/` con encabezado de sala, acceso visual para crear publicación, divisor «PUBLICADO HOY» y los tres posts del mockup.
- Tipografías Fredoka para títulos y Nunito para cuerpo, cargadas con `next/font/google` en lugar de Geist.
- Tokens de color del mockup en `app/globals.css` y scrollbar personalizada.
- Datos mock tipados en `app/data/mock/feed.ts`.
- SVG inline del mockup, sin añadir dependencias de iconos.
- Ítem Feed activo en la navegación; los enlaces a destinos todavía inexistentes muestran `href="#"`.

**Fuera de alcance (para specs futuras):**

- Autenticación, roles o cierre de sesión funcional.
- Base de datos y persistencia; los datos son estáticos.
- Rutas de crear publicación, detalle, foto, Niños, Avisos, Mi cuenta y login.
- Interactividad de likes, comentarios y edición.
- Fotos reales; la actividad conserva el placeholder visual.
- Modo oscuro; el mockup define una sola paleta.
- Diseño móvil distinto al drawer y topbar especificados.

## Data model

```ts
// app/data/mock/feed.ts
export type PostType = "achievement" | "activity" | "announcement";

export type Post = {
  id: string;
  type: PostType;
  author: string;
  avatarInitials?: string;
  avatarTone: "child" | "announcement";
  time: string;
  audience: string;
  text: string;
  photoLabel?: string;
  hearts: number;
  comments: number;
};

export const currentUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initials: "C",
};

export const room = {
  eyebrow: "GUARDERÍA · SALA SOLES",
  greeting: "Buenas, Caro",
  meta: "12 niños · martes 17 jun",
};

export const posts: Post[] = [
  /* logro, actividad y anuncio del mockup */
];

export const postTypeLabels: Record<PostType, string> = {
  achievement: "LOGRO",
  activity: "ACTIVIDAD",
  announcement: "ANUNCIO",
};
```

Los valores internos de `PostType` se mantienen en inglés. `postTypeLabels` proporciona el texto visible en español. Los contadores de los posts son respectivamente 3/1, 5/2 y 8/0 (likes/comentarios). Los colores de las etiquetas visibles son: LOGRO `#CFEBD8`/`#3E9B6C`, ACTIVIDAD `#C7E7F1`/`#2E89A6` y ANUNCIO `#CCD8F4`/`#4E72C8`.

## Implementation plan

1. Actualizar `app/layout.tsx` con Fredoka y Nunito mediante `next/font/google`, `lang="es"` y metadata OpenDayCare. Actualizar `app/globals.css` con la paleta del mockup, estilos base y scrollbar. Mantener Tailwind v4 por Turbopack, sin añadir PostCSS. Verificar con `npm run dev` que cargan el fondo y las fuentes.
2. Crear `app/data/mock/feed.ts` con los tipos y el contenido exacto de sala y publicaciones del mockup. Verificar que el módulo importa sin errores.
3. Crear `components/Sidebar.tsx` y montarlo desde `app/layout.tsx` alrededor del contenido. Implementar sidebar desktop de 248px con logo, CTA, navegación Feed activa y tarjeta de usuario. Mantener el scroll de contenido en `<main>`. Verificar visualmente la navegación en desktop.
4. Crear `components/PostCard.tsx` y reemplazar el contenido de `app/page.tsx` con encabezado, tarjeta para compartir, divisor y los tres posts tipados. Incluir badges, audiencia, contadores, enlaces visuales y placeholder de foto. Comparar la página con `references/pantallas/feed.dc.html`.
5. Añadir el comportamiento móvil al shell: topbar sticky por debajo de 1024px, hamburguesa, drawer superpuesto y cierre por backdrop o botón. Verificar apertura y cierre en viewport de 375px.
6. Validar el resultado en desktop y móvil con capturas de Playwright, y ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] La ruta `/` muestra shell y feed con fondo `#F6ECDF`, tarjetas `#FFFDF9`, títulos Fredoka y texto Nunito.
- [ ] En desktop, la sidebar mide 248px e incluye el CTA, Feed activo y perfil de Caro Giménez.
- [ ] Se muestran los tres posts del mockup con etiqueta visible en español, audiencia y contadores correctos: 3/1, 5/2 y 8/0.
- [ ] El post de actividad muestra el placeholder punteado con el texto «Foto · pintando con témperas».
- [ ] Los enlaces a páginas aún no implementadas no producen errores 404.
- [ ] Por debajo de 1024px, se oculta la sidebar fija y aparece la topbar con hamburguesa.
- [ ] El drawer móvil se abre sobre el contenido y se cierra al tocar el backdrop o el botón de cierre.
- [ ] `npm run lint` y `npm run build` terminan correctamente.
- [ ] La consola del navegador no muestra errores al cargar `/` en desktop ni móvil.

## Decisions

- **Sí:** sidebar como shell compartido desde `app/layout.tsx`; las próximas pantallas podrán reutilizarla.
- **Sí:** datos mock tipados en `app/data/mock/feed.ts`, según la estructura elegida.
- **Sí:** `next/font/google` para Fredoka y Nunito; evita depender de una carga CDN en runtime.
- **Sí:** drawer móvil por debajo de 1024px, superpuesto, con backdrop y topbar.
- **Sí:** SVG inline copiados del mockup; no se añade una dependencia de iconos.
- **Sí:** enlaces sin pantalla funcional usan `href="#"` hasta que sus rutas se definan en otras specs.
- **No:** rutas stub; quedan fuera del alcance de esta pantalla.
- **No:** likes, comentarios o edición funcionales; el feed es estático.
- **No:** modo oscuro; no forma parte del diseño de referencia.

## Risks

| Riesgo                                                                        | Mitigación                                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| La configuración de Tailwind v4 depende de Turbopack y no usa PostCSS.        | Mantener los estilos y tokens en `app/globals.css`; no crear `postcss.config.*`.              |
| `cacheComponents` afecta el comportamiento de componentes que obtienen datos. | No añadir fetching: los datos del feed son estáticos y locales.                               |
| La fidelidad visual depende de medidas y detalles exactos del mockup.         | Usar sus valores de color, espaciado, radios y sombras; comparar capturas en desktop y móvil. |

## What is **not** in this spec

- Autenticación, roles ni base de datos.
- Otras pantallas o rutas funcionales.
- Likes, comentarios o edición funcionales.
- Fotos reales o modo oscuro.
