# SPEC 06 — Nueva publicación: diálogo con validación

> **Estado:** Approved
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-10-08
> **Objetivo:** Implementar la tarjeta «Compartí un momento…» de `/` como disparador de un diálogo nativo con el formulario de `references/pantallas/crear-publicacion.dc.html`, donde destinatario (niños en multi-selección con «Toda la sala» excluyente), tipo y descripción son obligatorios, con validación inline propia y sin persistencia.

## Scope

**In:**

- `components/CreatePostDialog.tsx` (client): contiene el disparador — la tarjeta «Compartí un momento…» actual (avatar de `currentUser`, texto, tile con icono de cámara) convertida en `<button type="button">` de ancho completo con el mismo estilo — y el `<dialog>` nativo que abre con `showModal()`. Reemplaza el `<a href="#">` en `app/(app)/page.tsx`, que sigue siendo server component.
- Diálogo fiel al mockup: tarjeta `max-w-[580px]` con fondo `#FBF4EC`, borde `1px #ECE0D0` (token `border-border`), radius 24px y sombra `0 20px 50px -24px rgba(63,54,46,.35)`; header con «Cancelar» (izquierda, `text-muted`), título «Nueva publicación» (Fredoka 18px) y «Publicar» (derecha, `#D9583C`, `type="submit"`). Labels de sección (PARA / TIPO / DESCRIPCIÓN / FOTOS) con el estilo de labels de SPEC 04.
- PARA: chips con avatar de 26px (tono real del niño, Fredoka) + primer nombre (`name.split(" ")[0]`), desde los 8 niños de `app/data/mock/kids.ts`, más la chip «Toda la sala» sin avatar. Seleccionada: fondo y borde `1.5px #3F362E`, texto blanco; sin seleccionar: borde `1.5px #ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`. Multi-selección entre niños; «Toda la sala» es excluyente: activarla desmarca los niños y marcar un niño la desactiva.
- TIPO: 7 píldoras (`type="button"`, labels desde `postTypeChipLabels`, orden del mockup: Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio), radius 999px, selección única. Sin seleccionar: neutras (borde `1.5px #ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`); seleccionada: el color del tipo según el mockup — Comida `#9A7B1E`/blanco, Siesta `#E7DCF6`/`#7B5FC0`, Actividad `#2E89A6`/blanco, Logro `#CFEBD8`/`#3E9B6C`, Ánimo `#F9D2DE`/`#C56486`, Foto `#FBD8CC`/`#D9684A`, Anuncio `#CCD8F4`/`#4E72C8`. Map de colores local al componente, patrón `badgeStyles` de PostCard.
- DESCRIPCIÓN: textarea (padding 14/16px, radius 14px, borde `1.5px #EADFD0`, fondo blanco, min-height 120px, resize vertical), placeholder «Contá cómo le fue hoy…»; inicia vacía (el texto del mockup es contenido de demo).
- FOTOS: decorativa estática — tile 96×96 con icono de imagen (fondo `#F4ECE1`, borde `1px #ECE0D0`, icono `#CBB89F`) y tile «Agregar» (borde dashed `1.5px #DBCDBA`, icono `#C5503A`, texto `#B0A290`), como visuales no interactivos.
- Obligatorios: PARA (al menos un niño o «Toda la sala»), TIPO y DESCRIPCIÓN (no vacía tras trim). Validación propia (`noValidate`): mensaje inline en español bajo el grupo o campo (borde `#D9583C` en la textarea), revalidación al tipear o marcar chips. Copy: «Elegí para quién», «Elegí un tipo», «Escribí la descripción».
- Botón «Publicar» siempre activo; cierra el diálogo solo si el form es válido.
- Cierre sin publicar: Cancelar (`type="button"`), tecla Esc y click en el backdrop (`::backdrop` con `rgba(63,54,46,0.45)`, detectado con `e.target === dialog`); reset del form en el evento `close`.
- `app/data/mock/feed.ts`: `PostType` suma `"meal" | "nap" | "mood" | "photo"`; `postTypeLabels` suma las mayúsculas (COMIDA, SIESTA, ÁNIMO, FOTO); nuevo `postTypeChipLabels: Record<PostType, string>` con los labels en sentence case. Los 3 posts del mock no cambian.
- `components/PostCard.tsx`: `badgeStyles` y `badgeDotStyles` se completan para los 4 tipos nuevos con paleta ya existente: meal `#F4DC8E`/`#9A7B1E` (tono sol), nap `#E7DCF6`/`#7B5FC0`, mood `#F9D2DE`/`#C56486`, photo `#FBD8CC`/`#D9684A` (colores ya usados en badges de KidCard).
- `components/avatarTone.ts` (nuevo): extrae `avatarToneClasses` de `KidCard.tsx` para reutilizarla en las chips de PARA; `KidCard` pasa a importarla.
- Responsive: margen lateral en móvil y scroll interno del contenido si no entra en el viewport.

**Fuera de alcance (para specs futuras):**

- Persistencia o publicación real: «Publicar» valida y cierra; el feed no cambia.
- Suba real de fotos, file picker o previews: FOTOS es decorativa.
- Lógica condicional por tipo (p. ej. exigir foto para tipo Foto).
- Rutas detalle-publicacion y foto; «Editar» de PostCard sigue en `href="#"`.
- Animaciones del modal y estados de éxito (toast).
- Likes y comentarios funcionales.

## Data model

```ts
// app/data/mock/feed.ts — extensión
export type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "meal"
  | "nap"
  | "mood"
  | "photo";

export const postTypeLabels: Record<PostType, string> = {
  achievement: "LOGRO",
  activity: "ACTIVIDAD",
  announcement: "ANUNCIO",
  meal: "COMIDA",
  nap: "SIESTA",
  mood: "ÁNIMO",
  photo: "FOTO",
};

// nuevo — labels en sentence case para las píldoras del diálogo
export const postTypeChipLabels: Record<PostType, string> = {
  meal: "Comida",
  nap: "Siesta",
  activity: "Actividad",
  achievement: "Logro",
  mood: "Ánimo",
  photo: "Foto",
  announcement: "Anuncio",
};

// Estado local del form en components/CreatePostDialog.tsx (no es mock compartido)
type CreatePostFormValues = {
  selectedKidSlugs: string[]; // obligatorio: ≥1 slug, o wholeRoom
  wholeRoom: boolean; // excluyente con selectedKidSlugs
  type: PostType | null; // obligatorio, null = sin píldora
  description: string; // obligatoria, trim antes de validar
};
```

Convenciones:

- Valores internos en inglés; copy visible en español vía `postTypeChipLabels` (las píldoras consumen el map, no literales).
- Los niños vienen de `kids` (SPEC 02) con su `avatarTone`; primer nombre vía `name.split(" ")[0]`, como el callout de SPEC 05.
- Ningún color nuevo: los estados seleccionados salen del mockup y los neutros reusan el estilo de las chips de PARA; el error es el `#D9583C` ya establecido (SPEC 04/05).

## Implementation plan

1. Extender `app/data/mock/feed.ts` (`PostType` + `postTypeLabels` + `postTypeChipLabels`), completar los Records de `PostCard` y extraer `avatarToneClasses` a `components/avatarTone.ts` (KidCard pasa a importarla). Manual: `/` y `/kids` se ven igual; `npm run build` pasa (los Records completos son exigidos por el typecheck).
2. Crear `components/CreatePostDialog.tsx` (client): tarjeta disparadora «Compartí un momento…» (mismo estilo del link actual) + `<dialog>` fiel al mockup (header Cancelar/título/Publicar, PARA con los 8 niños + «Toda la sala», TIPO con 7 píldoras, textarea, FOTOS decorativa), sin validación aún. Reemplazar el `<a href="#">` de `app/(app)/page.tsx` por `<CreatePostDialog />`. Manual: click abre el diálogo; Cancelar y Esc lo cierran. Comparar contra `references/pantallas/crear-publicacion.dc.html`.
3. Implementar selección y validación: multi-selección de niños con «Toda la sala» excluyente, selección única de TIPO (neutro→color), obligatorios con mensajes del copy definido, borde `#D9583C` en textarea, revalidación al tipear/marcar y cierre solo con form válido. Manual: publicar vacío muestra los 3 mensajes; corregir un campo quita su error; con todo válido cierra.
4. Cierre por click en backdrop (`e.target === dialog`), reset del form en el evento `close` y ajuste responsive (margen móvil + scroll interno). Validación final: capturas de Playwright en desktop y 375px contra el mockup, `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] La tarjeta «Compartí un momento…» de `/` abre el diálogo sin navegación, con el mismo estilo (avatar C, texto, tile con icono de cámara) que el link actual.
- [ ] El diálogo replica el mockup: tarjeta de 580px fondo `#FBF4EC` borde `#ECE0D0` radius 24px, header «Cancelar / Nueva publicación / Publicar», labels PARA/TIPO/DESCRIPCIÓN/FOTOS y textarea con placeholder «Contá cómo le fue hoy…».
- [ ] PARA muestra los 8 niños del mock con su avatar de tono real y primer nombre, más «Toda la sala»; al abrir no hay nada marcado.
- [ ] Marcar un niño lo resalta (fondo `#3F362E`, texto blanco) y permite marcar otros; marcar «Toda la sala» desmarca los niños y marcar un niño desactiva «Toda la sala».
- [ ] TIPO muestra las 7 píldoras neutras al abrir; elegir una le aplica su color del mockup (p. ej. Comida `#9A7B1E` con texto blanco) y desmarca las demás.
- [ ] Publicar con todo vacío muestra «Elegí para quién», «Elegí un tipo» y «Escribí la descripción», y no cierra el diálogo.
- [ ] El error de cada campo desaparece apenas ese campo pasa a ser válido (tipear la descripción, marcar chip o píldora), sin volver a presionar Publicar.
- [ ] Con un destinatario, un tipo y descripción con texto, «Publicar» cierra el diálogo.
- [ ] El feed no cambia tras publicar: siguen los 3 posts con sus contadores 3/1, 5/2 y 8/0.
- [ ] Cancelar, Esc y click en el backdrop cierran el diálogo sin publicar.
- [ ] Al reabrir el diálogo, no hay chips ni píldoras marcadas, la textarea está vacía y no hay errores.
- [ ] La sección FOTOS muestra los dos tiles del mockup (placeholder + «Agregar») sin interacción.
- [ ] `/` y `/kids` se renderizan igual tras extender `PostType` y extraer `avatarToneClasses`.
- [ ] En 375px el diálogo entra sin scroll horizontal y el contenido hace scroll interno si no cabe.
- [ ] `npm run lint` y `npm run build` terminan correctamente y la consola no muestra errores en `/`.

## Decisions

- **Sí:** `<dialog>` nativo con `showModal()`; reutiliza el patrón de SPEC 04/05 (Esc, foco atrapado, backdrop, reset en `close`) sin librerías ni rutas nuevas.
- **Sí:** multi-selección de niños con «Toda la sala» excluyente; una actividad puede involucrar a varios y el toggle evita estados redundantes.
- **Sí:** chips de PARA desde los 8 niños de `kids` con primer nombre; consistente con la grilla de `/kids` (SPEC 02); el mockup trae 3 de muestra.
- **Sí:** píldoras de TIPO neutras → color del tipo al seleccionar; el mockup no define el estado activo y este lenguaje replica el de PARA (Mateo oscuro, resto neutras) sin colores nuevos.
- **Sí:** extender `PostType` a 7 valores + `postTypeChipLabels`; precedente SPEC 05 (extensión de `ParentRole`). `PostCard` completa sus Records con paleta existente para no romper el typecheck.
- **Sí:** estado inicial limpio (nada marcado, textarea vacía); el mockup muestra contenido de demo y sin selección inicial el error de cada obligatorio es verificable (misma decisión que las píldoras de SPEC 05).
- **Sí:** «Publicar» valida y cierra sin persistencia; coherente con los mocks estáticos de SPEC 01–05.
- **Sí:** FOTOS decorativa estática; sin backend, un file picker agrega scope y un botón muerto agrega ruido.
- **Sí:** extraer `avatarToneClasses` a `components/avatarTone.ts`; la necesitan KidCard y las chips de PARA (DRY).
- **No:** agregar la publicación al feed en memoria; se perdería al recargar y contradice los mocks estáticos.
- **No:** suba de fotos, toasts de éxito, animaciones del modal, lógica condicional por tipo.

## Risks

| Riesgo                                                                            | Mitigación                                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 8 chips de niños + 7 de TIPO pueden desbordar el ancho en móvil.                  | `flex-wrap` con gap 9px como el mockup; verificar en 375px durante el paso 4.                     |
| Componente client dentro de una página estática con `cacheComponents` habilitado. | Estado local puro sin fetch; `/` sigue siendo server component estático.                          |
| El click en backdrop (`e.target === dialog`) varía entre browsers.                | Patrón ya probado en SPEC 04/05; verificar en Chrome y Safari durante el paso 4.                  |
| Extender `PostType` obliga a completar los Records de `PostCard`.                 | Los maps son `Record<PostType, …>`: `npm run build` falla si falta alguno; solo paleta existente. |

## What is **not** in this spec

- Persistencia ni publicación real; el feed no cambia.
- Suba de fotos, file picker o previews.
- Lógica condicional por tipo, toasts ni animaciones.
- Rutas detalle-publicacion y foto; «Editar» sigue en `href="#"`.
