# SPEC 03 — Login y activar cuenta

> **Estado:** Done
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-10-08
> **Objetivo:** Implementar `/auth/login` y `/auth/activate-account` según `references/pantallas/login.dc.html` y `references/pantallas/activar-cuenta.dc.html`, fuera del shell compartido y sin autenticación real.

## Scope

**In:**

- Route groups: el shell (Sidebar + MobileNavigation) pasa a `app/(app)/layout.tsx` y `app/layout.tsx` queda como raíz mínima (fuentes, `lang="es"`, metadata global).
- Reubicación sin cambios de contenido ni de URL: `app/page.tsx` → `app/(app)/page.tsx`, `app/kids/page.tsx` → `app/(app)/kids/page.tsx`, `app/kids/[slug]/page.tsx` → `app/(app)/kids/[slug]/page.tsx`.
- Página `/auth/login`: dos columnas (branding + formulario), sin el selector «INGRESO COMO» (Personal/Familia), eliminado a pedido del usuario.
- Panel de branding del login: gradiente `155deg #F6A98E→#EC7E62`, dos círculos decorativos, logo + «OpenDayCare», titular «El día de cada niño, compartido con su familia.», párrafo y pie «🌿 Guardería Sala Soles».
- Formulario del login: «Iniciar sesión» / «Ingresá para ver el día de hoy.», EMAIL, CONTRASEÑA, «¿Olvidaste tu contraseña?» (`href="#"`), botón «Iniciar sesión» → `/`, pie «¿Te invitó la guardería? Activá tu cuenta» → `/auth/activate-account`.
- Página `/auth/activate-account`: columna centrada de 440px con logo, «Bienvenida a OpenDayCare», tarjeta de invitación («Te invitaron a seguir a» / «Mateo · Sala Soles», avatar «M» tono sky), CÓDIGO DE INVITACIÓN, EMAIL, CREAR CONTRASEÑA, checkbox de autorización de fotos y «Activar mi cuenta» (`href="#"`); pie «¿Ya tenés cuenta? Iniciar sesión» → `/auth/login`.
- Inputs vacíos con placeholders del mockup: «caro@opendaycare.com», «••••••••», «7K4P9», «lucia.fernandez@gmail.com».
- Checkbox nativa estilada con `peer-checked` (caja verde `#5FB97E` con check), desmarcada por defecto.
- Responsive: por debajo de `lg` se oculta el panel de branding y queda el formulario centrado.
- Fondo `#FBF4EC` del mockup en el div raíz de cada página de auth.
- Metadata de título: «Iniciar sesión · OpenDayCare» y «Activar cuenta · OpenDayCare».

**Fuera de alcance (para specs futuras):**

- Autenticación real, sesiones, roles o cierre de sesión; los formularios no envían nada.
- Recuperación de contraseña y familia-feed: quedan en `href="#"`.
- Validación de formularios, estados de error o submit.
- Archivo `app/data/mock/auth.ts`: no hay datos repetidos ni tipados; el copy va inline en las páginas.
- Cambios de contenido en las pantallas de feed y niños al reubicarlas.
- Modo oscuro.

## Data model

Esta feature no introduce nuevas estructuras de datos. No hay arrays ni registros repetidos: el copy visible es texto estático de UI y va inline en las dos páginas. La tarjeta de invitación («Mateo · Sala Soles») es literal del mockup y no se deriva de `app/data/mock/kids.ts`.

## Implementation plan

1. Reestructurar a route groups: simplificar `app/layout.tsx` (raíz mínima) y crear `app/(app)/layout.tsx` con el shell actual (`div.flex`, Sidebar desktop, `MobileNavigation` + `main`). Mover `app/page.tsx` y las dos páginas de `app/kids/` dentro de `(app)` sin editar contenido. Antes de tocar los layouts, revisar `node_modules/next/dist/docs/` sobre `LayoutProps` y route groups. Verificar con `npm run dev` que `/`, `/kids` y un perfil siguen idénticos (shell incluido).
2. Crear `app/auth/login/page.tsx`: grid `lg:grid-cols-[1.05fr_1fr]` con panel de branding y columna del formulario (`max-w-[392px]`): heading, sub, EMAIL y CONTRASEÑA (inputs vacíos con placeholders), «¿Olvidaste tu contraseña?» `href="#"`, botón `Link` a `/` con el gradiente `#F4977E→#EE8164`, y pie con `Link` a `/auth/activate-account`. Exportar `metadata` con título «Iniciar sesión · OpenDayCare». Comparar con `references/pantallas/login.dc.html` en desktop.
3. Crear `app/auth/activate-account/page.tsx`: contenedor centrado `max-w-[440px]` con logo (58px, gradiente `#F8C3A8→#F2937A`), titular, sub, tarjeta de invitación (avatar «M» `#A9D9E8`/`#1F7A93`), inputs CÓDIGO (Fredoka, `tracking`, placeholder «7K4P9»), EMAIL y CREAR CONTRASEÑA, checkbox de autorización con `peer-checked` (caja `#5FB97E` con check blanco, label `#FBF1D6` con texto `#8A7234`) y botón «Activar mi cuenta» `href="#"`. Pie con `Link` a `/auth/login`. Exportar `metadata` «Activar cuenta · OpenDayCare». Comparar con `references/pantallas/activar-cuenta.dc.html`.
4. Validar: capturas de Playwright en desktop y 375px de las dos rutas nuevas contra los mockups, y de `/`, `/kids` y un perfil para confirmar la reestructuración; ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [x] `/auth/login` y `/auth/activate-account` renderizan a página completa, sin sidebar ni topbar.
- [x] `/`, `/kids` y `/kids/[slug]` siguen funcionando tras la reubicación con el shell intacto: sidebar de 248px en desktop y topbar + drawer en 375px.
- [x] `/auth/login` muestra el panel de branding con el gradiente `#F6A98E→#EC7E62`, los dos círculos decorativos, el titular «El día de cada niño, compartido con su familia.» y el pie «🌿 Guardería Sala Soles».
- [x] `/auth/login` no muestra el bloque «INGRESO COMO» ni los botones Personal/Familia.
- [x] Los inputs están vacíos y muestran los placeholders «caro@opendaycare.com», «••••••••», «7K4P9» y «lucia.fernandez@gmail.com» según el campo.
- [x] «Iniciar sesión» navega a `/`; «Activar mi cuenta» y «¿Olvidaste tu contraseña?» quedan en `href="#"`; «Activá tu cuenta» e «Iniciar sesión» (pies) navegan entre las dos rutas de auth.
- [x] La checkbox de autorización está desmarcada por defecto; al marcarla aparece la caja verde `#5FB97E` con el check blanco del mockup.
- [x] En 375px, `/auth/login` oculta el panel de branding y centra el formulario; `/auth/activate-account` se ve completa sin scroll horizontal.
- [x] Los títulos de pestaña son «Iniciar sesión · OpenDayCare» y «Activar cuenta · OpenDayCare».
- [x] `npm run lint` y `npm run build` terminan correctamente y la consola no muestra errores en las rutas nuevas ni en las existentes.

## Decisions

- **Sí:** route groups para sacar auth del shell; solución idiomática del App Router y las URLs no cambian.
- **Sí:** inputs vacíos con placeholders del mockup (decisión del usuario); más realista que `defaultValue`.
- **Sí:** checkbox nativa con `peer-checked`, desmarcada por defecto; interactiva sin componente client.
- **Sí:** «Iniciar sesión» → `/` (el mockup enlaza login→feed) y «Activar mi cuenta» → `href="#"` (familia-feed no existe).
- **Sí:** ocultar el branding del login por debajo de `lg` (1024px), el mismo breakpoint del shell.
- **Sí:** copy inline en las páginas; no hay datos tipados ni repetidos que justifiquen un mock de auth.
- **Sí:** fondo `#FBF4EC` del mockup en el div raíz de cada página de auth; cada mockup manda en su pantalla.
- **No:** selector «INGRESO COMO» (Personal/Familia); eliminado a pedido del usuario.
- **No:** `defaultValue` en los inputs ni formularios controlados.
- **No:** tarjeta de invitación derivada de `app/data/mock/kids.ts`; es copy literal del mockup.

## Risks

| Riesgo                                                                | Mitigación                                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| La reubicación toca archivos ya implementados de SPEC 01 y 02.        | Mover sin editar contenido y verificar `/`, `/kids` y un perfil contra sus mockups antes de crear las nuevas rutas. |
| `LayoutProps` tipado cambia con route groups en Next 16.              | Leer `node_modules/next/dist/docs/` antes de escribir los layouts, igual que en SPEC 02.                            |
| `cacheComponents` y `partialPrefetching` alteran semánticas de rutas. | Sin fetching ni estado: las páginas son server components estáticos y la checkbox es un input nativo.               |

## What is **not** in this spec

- Autenticación real, sesiones, roles ni recuperación de contraseña.
- familia-feed ni validación de formularios.
- Cambios de contenido en feed o niños.
