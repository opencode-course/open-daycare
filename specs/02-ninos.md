# SPEC 02 — Niños: lista y perfil

> **Estado:** Approved
> **Depende de:** SPEC 01
> **Fecha:** 2026-10-07
> **Objetivo:** Implementar las rutas `/kids` (lista) y `/kids/[slug]` (perfil) según `references/pantallas/ninos.dc.html` y `references/pantallas/perfil-nino.dc.html`, con mock compartido y «Niños» navegable desde la sidebar.

## Scope

**In:**

- Página `/kids`: encabezado «GESTIÓN / Niños», botón «Agregar niño» (`href="#"`), búsqueda decorativa «Buscar niño…», divisor «SALA SOLES · 8 niños» y grilla con los 8 niños del mockup.
- `components/KidCard.tsx`: tarjeta `Link` a `/kids/[slug]` con avatar, subtítulo derivado, badges de alergias / «VINCULAR» o flecha, y hover del mockup.
- Página `/kids/[slug]`: encabezado por niño, tarjeta «Alergias y notas», filas de información, botón «Resumen del día» y tarjeta «PADRES VINCULADOS» con «Vincular otro padre».
- Detalle compartido `kidDetail`: idéntico para los 8 niños hasta que exista la API/DB; solo cambia el encabezado.
- Datos mock tipados en `app/data/mock/kids.ts`.
- Navegación dinámica en `components/Sidebar.tsx` vía `components/NavLink.tsx`: «Niños» pasa a `Link` a `/kids` y el ítem activo se detecta con la ruta.
- Metadata de título por página: «Niños · OpenDayCare» y «{nombre} · OpenDayCare».
- Responsive: grilla de 1 columna por debajo de `sm`; el perfil apila la columna derecha debajo.

**Fuera de alcance (para specs futuras):**

- Pantallas agregar/editar niño, resumen del día y vincular padre: quedan en `href="#"`.
- Búsqueda funcional; el input es decorativo, sin filtro.
- API/DB y fetch de datos; los mocks son estáticos.
- 404 personalizada; se usa la de Next por defecto.
- Unificar el contador «12 niños» del feed con los «8 niños» de `/kids`.
- Autenticación, interactividad de likes/comentarios y modo oscuro.

## Data model

```ts
// app/data/mock/kids.ts
export type AvatarTone = "sky" | "rose" | "mint" | "sun" | "lilac" | "skySoft";
export type ParentRole = "mother" | "father";
export type ParentStatus = "active" | "pending";

export type ParentLink = {
  name: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  role: ParentRole;
  status: ParentStatus;
};

export type Kid = {
  slug: string; // "mateo-fernandez" → /kids/mateo-fernandez
  name: string; // "Mateo Fernández"
  avatarInitial: string; // "M"
  avatarTone: AvatarTone; // "sky"
  age: number; // 3
  allergies: string[]; // ["Maní"] → badge "MANÍ" en la lista
  parentsCount: number; // 0 → "sin padres vinculados"
};

export const kids: Kid[] = [
  /* los 8 del mockup, tabla abajo */
];

// Detalle compartido: idéntico para todos hasta que exista la API/DB.
export const kidDetail = {
  birthDate: "12 mar 2022",
  classroom: "Soles",
  enrollment: "feb 2025",
  notes: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
  parents: [
    {
      name: "Lucía Fernández",
      avatarInitial: "L",
      avatarTone: "lilac",
      role: "mother",
      status: "active",
    },
    {
      name: "Diego Fernández",
      avatarInitial: "D",
      avatarTone: "skySoft",
      role: "father",
      status: "pending",
    },
  ] as ParentLink[],
};

export const parentRoleLabels: Record<ParentRole, string> = {
  mother: "Mamá",
  father: "Papá",
};
export const parentStatusLabels: Record<ParentStatus, string> = {
  active: "ACTIVA",
  pending: "PENDIENTE",
};
export const parentStatusText: Record<ParentStatus, string> = {
  active: "activa",
  pending: "invitación enviada",
};
```

Los 8 niños:

| slug            | Nombre          | Inicial | Tono  | Edad | Alergias | padres |
| --------------- | --------------- | ------- | ----- | ---- | -------- | ------ |
| mateo-fernandez | Mateo Fernández | M       | sky   | 3    | Maní     | 2      |
| sofia-mendez    | Sofía Méndez    | S       | rose  | 2    | —        | 1      |
| benjamin-ruiz   | Benjamín Ruiz   | B       | mint  | 3    | —        | 2      |
| valentina-soto  | Valentina Soto  | V       | sun   | 2    | —        | 0      |
| tomas-diaz      | Tomás Díaz      | T       | lilac | 3    | Lactosa  | 1      |
| emma-castro     | Emma Castro     | E       | rose  | 2    | —        | 1      |
| lucas-romero    | Lucas Romero    | L       | sky   | 3    | —        | 1      |
| olivia-vega     | Olivia Vega     | O       | mint  | 2    | —        | 1      |

Convenciones:

- Tonos de avatar (fondo/texto): sky `#A9D9E8`/`#1F7A93`, rose `#F4B8CC`/`#C44A7A`, mint `#B9DEC4`/`#3E8B62`, sun `#F4DC8E`/`#9A7B1E`, lilac `#C9B6E8`/`#7B5FC0`; los niños usan texto tintado.
- Padres usan texto blanco: lilac `#C9B6E8` (Lucía) y skySoft `#A9C7E8` (Diego).
- Badges de la lista: alergias con fondo `#FBD8CC`/texto `#D9684A` (texto en mayúsculas); «VINCULAR» con `#F9D2DE`/`#C56486`.
- Badges del perfil: «ACTIVA» `#CFEBD8`/`#3E9B6C`, «PENDIENTE» `#F7E7A6`/`#9A7B1E`.
- Subtítulo de tarjeta derivado en el componente: `0` → «sin padres vinculados», `1` → «1 padre vinculado», `n` → «n padres vinculados».

## Implementation plan

1. Crear `app/data/mock/kids.ts` con los tipos, los 8 niños, `kidDetail` y los label maps. Verificar que el módulo importa sin errores.
2. Crear `components/KidCard.tsx`: avatar, subtítulo derivado, badges (todas las alergias; «VINCULAR» si `parentsCount === 0`) o flecha, y hover (borde `#F2A78E`, `translateY(-2px)`, transición de .15s).
3. Crear `app/kids/page.tsx`: contenedor `max-w-[880px]`, encabezado, botón «Agregar niño» (`href="#"`), búsqueda decorativa, divisor «SALA SOLES · 8 niños» (contador desde `kids.length`) y grilla `grid-cols-1 sm:grid-cols-2`. Exportar `metadata` con título «Niños · OpenDayCare». Comparar con `references/pantallas/ninos.dc.html`.
4. Crear `app/kids/[slug]/page.tsx`: `generateStaticParams` con los 8 slugs, `params` como `Promise`, `notFound()` si el slug no existe y `generateMetadata` con «{nombre} · OpenDayCare». Encabezado desde el niño; «Alergias y notas», filas de información, «Resumen del día» y padres desde `kidDetail`. Enlaces a pantallas inexistentes con `href="#"`; «Volver a Niños» a `/kids`. Comparar con `references/pantallas/perfil-nino.dc.html`.
5. Crear `components/NavLink.tsx` (client con `usePathname`) y actualizar `components/Sidebar.tsx`: «Feed» activo solo en `/`, «Niños» activo en `/kids` y su detalle; «Avisos» y «Mi cuenta» quedan en `href="#"`.
6. Validar con capturas de Playwright en desktop y 375px contra ambos mockups, y ejecutar `npm run lint` y `npm run build`.

## Acceptance criteria

- [ ] `/kids` muestra encabezado «GESTIÓN / Niños», botón «Agregar niño» con `href="#"`, búsqueda decorativa y divisor «SALA SOLES · 8 niños».
- [ ] La grilla muestra los 8 niños: 2 columnas desde `sm` y 1 por debajo.
- [ ] Cada tarjeta muestra avatar con inicial y tono del mockup, nombre en Fredoka y subtítulo correcto: «2 padres vinculados» (Mateo, Benjamín), «1 padre vinculado» (Sofía, Tomás, Emma, Lucas, Olivia), «sin padres vinculados» (Valentina).
- [ ] Mateo muestra badge «MANÍ», Tomás «LACTOSA», Valentina «VINCULAR»; los demás muestran la flecha.
- [ ] El hover de la tarjeta aplica borde `#F2A78E` y desplazamiento de 2px.
- [ ] Cada tarjeta navega a su `/kids/[slug]` y «Volver a Niños» regresa a `/kids`.
- [ ] El perfil muestra el encabezado del niño (avatar 84px, nombre, «N años · Sala Soles») y el resto idéntico al mockup: tarjeta «Alergias y notas» con su texto, filas «Fecha de nacimiento · 12 mar 2022», «Sala · Soles» e «Ingreso · feb 2025».
- [ ] El perfil muestra «Resumen del día» y «Vincular otro padre» con `href="#"`, y los padres con badges «ACTIVA» y «PENDIENTE».
- [ ] `/kids/slug-inexistente` devuelve 404.
- [ ] La sidebar marca «Niños» activo en `/kids` y su perfil, «Feed» activo solo en `/`; «Avisos» y «Mi cuenta» siguen en `href="#"`.
- [ ] Los títulos de pestaña son «Niños · OpenDayCare» y «{nombre} · OpenDayCare».
- [ ] En 375px la grilla es de 1 columna y el perfil apila la columna derecha debajo.
- [ ] `npm run lint` y `npm run build` terminan correctamente y la consola no muestra errores en `/`, `/kids` y un perfil.

## Decisions

- **Sí:** búsqueda decorativa sin filtro, igual que el feed; el filtro funcional va en otra spec si llega.
- **Sí:** `age` como campo explícito; determinista y sin riesgo de hidratación.
- **Sí:** detalle compartido `kidDetail`, idéntico para los 8 niños; decisión explícita del usuario hasta que la API/DB lo haga dinámico. `parentsCount` en `Kid` mantiene fiel el subtítulo de la lista.
- **Sí:** 404 con `notFound()` y la página por defecto de Next.
- **Sí:** navegación dinámica con `NavLink` client; `Sidebar` sigue siendo server component.
- **Sí:** cada mockup manda en su pantalla; el feed conserva «12 niños» y `/kids` deriva «8 niños» de `kids.length`.
- **Sí:** badges muestran todas las alergias, «VINCULAR» cuando `parentsCount === 0` y la flecha solo cuando no hay nada.
- **Sí:** 1 columna por debajo de `sm` y perfil apilado en móvil.
- **Sí:** metadata de título por página.
- **No:** pantallas de agregar/editar niño, resumen del día y vincular padre; quedan en `href="#"`.
- **No:** API/DB, fetch ni 404 personalizada.

## Risks

| Riesgo                                                                                                                 | Mitigación                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| El detalle compartido contradice los subtítulos de la lista (Sofía dice «1 padre vinculado» pero su perfil muestra 2). | Aceptado por el usuario; es temporal y la spec de API/DB reemplazará `kidDetail`.                                          |
| `cacheComponents` cambia semánticas de rutas dinámicas en Next 16.                                                     | Leer `node_modules/next/dist/docs/` antes de implementar `/kids/[slug]` (`generateStaticParams`, `params` como `Promise`). |
| «12 niños» (feed) vs «8 niños» (`/kids`).                                                                              | Inconsistencia entre mockups aceptada; cada pantalla sigue su referencia.                                                  |

## What is **not** in this spec

- Pantallas agregar/editar niño, resumen del día ni vincular padre.
- Búsqueda funcional ni API/DB.
- 404 personalizada ni unificación de contadores entre pantallas.
