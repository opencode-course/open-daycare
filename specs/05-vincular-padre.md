# SPEC 05 — Vincular padre: diálogo con validación

> **Estado:** Done
> **Depende de:** SPEC 02, SPEC 04
> **Fecha:** 2026-10-08
> **Objetivo:** Implementar el link «Vincular otro padre» de `/kids/[slug]` como disparador de un diálogo nativo con el formulario de `references/pantallas/vincular-padre.dc.html`, donde nombre, email y parentesco (Mamá/Papá/Tutor/a) son obligatorios con validación inline, código de invitación estático y sin persistencia.

## Scope

**In:**

- `components/LinkParentDialog.tsx` (client): contiene el botón disparador «Vincular otro padre» (mismo estilo del link actual: avatar punteado + PlusIcon + texto `#C5503A`) y el `<dialog>` nativo que abre con `showModal()`. Reemplaza el `<a href="#">` en `app/(app)/kids/[slug]/page.tsx`, que sigue siendo server component y le pasa `kidName` como prop.
- Diálogo fiel al mockup: tarjeta `max-w-[480px]` con fondo `#FBF4EC`, borde `1px #ECE0D0` (token `border-border`), radius 24px y sombra `0 20px 50px -24px rgba(63,54,46,.35)`; header con título «Vincular padre» (Fredoka 18px), subtítulo «a {kidName}» y botón X (34px, fondo `#F0E6D8`, icono `#94887B`).
- Callout informativo: fondo `#E3ECFB`, radius 14px, icono info `#4E72C8`, texto `#3F5694`: «Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {primer nombre del niño}.»
- Campos: NOMBRE DEL PADRE/MADRE (input, placeholder «Ej. Diego Fernández») y EMAIL (input `type="email"`, placeholder «correo@ejemplo.com»); inputs con el estilo de SPEC 04 (padding 13/16px, radius 14px, borde `1.5px #EADFD0`, fondo blanco).
- PARENTESCO: 3 píldoras (Mamá / Papá / Tutor/a, labels desde `parentRoleLabels`), radius 999px, selección única; seleccionada: borde `#9FB8EC`, fondo `#CCD8F4`, texto `#4E72C8`; sin seleccionar: borde `#ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`.
- CÓDIGO DE INVITACIÓN: caja `#FBF1D6` con borde dashed `1.5px #E6D08A`, código estático «7K4P9» (Fredoka 34px, tracking 7px, `#8A7234`) y «Vence en 7 días» (`#A88526`).
- Botón «Enviar invitación» (`type="submit"`): gradiente `#F4977E→#EE8164`, texto blanco, icono send del mockup, sombra `0 10px 22px -8px rgba(238,129,100,.7)`.
- Obligatorios: nombre (no vacío tras trim), email (no vacío + formato con arroba y dominio) y parentesco (una píldora elegida).
- Formulario con validación propia (`noValidate`): borde `#D9583C` + mensaje inline en español, revalidación al tipear o cambiar parentesco. Copy: «Ingresá el nombre del padre o madre», «Ingresá el email», «El email no es válido», «Elegí el parentesco».
- Submit válido cierra el diálogo; sin persistencia: la lista PADRES VINCULADOS no cambia.
- Cierre sin enviar: botón X, tecla Esc y click en el backdrop (`::backdrop` con `rgba(63,54,46,0.45)`, detectado con `e.target === dialog`); reset del form en el evento `close`.
- `app/data/mock/kids.ts`: `ParentRole` suma `"tutor"` y `parentRoleLabels` suma `tutor: "Tutor/a"`; `kidDetail.parents` no cambia.
- Responsive: margen lateral en móvil y scroll interno del contenido si no entra en el viewport.

**Fuera de alcance (para specs futuras):**

- Persistencia o envío real: «Enviar invitación» valida y cierra; la lista de padres y `parentsCount` no cambian.
- Regeneración, copia o vencimiento dinámico del código: «7K4P9» es estático.
- Alta del padre en PADRES VINCULADOS, estados de éxito (toast) y animaciones del modal.
- «Resumen del día» y «Editar»: siguen en `href="#"`.
- family-feed (la vista del padre): el callout solo la anuncia.

## Data model

```ts
// app/data/mock/kids.ts — extensión
export type ParentRole = "mother" | "father" | "tutor";
export const parentRoleLabels: Record<ParentRole, string> = {
  mother: "Mamá",
  father: "Papá",
  tutor: "Tutor/a",
};

// Estado local del form en components/LinkParentDialog.tsx (no es mock compartido)
type LinkParentFormValues = {
  parentName: string; // obligatorio, trim antes de validar
  email: string; // obligatorio, formato con arroba y dominio
  role: ParentRole | null; // obligatorio, null = sin elegir píldora
};
```

Convenciones:

- Valores internos en inglés; copy visible en español vía `parentRoleLabels` (las píldoras consumen el map, no literales).
- El callout interpola el primer nombre del niño: `kidName.split(" ")[0]`.
- El color de error es el `#D9583C` existente del sistema (SPEC 04); no se agrega un rojo nuevo.

## Implementation plan

1. Extender `app/data/mock/kids.ts` (`ParentRole` + `parentRoleLabels`) y crear `components/LinkParentDialog.tsx` (client): botón disparador con el estilo del link actual + `<dialog>` fiel al mockup (header con X, callout, 2 inputs, píldoras con `type="button"`, caja de código, botón submit), sin lógica de validación aún. Reemplazar el `<a href="#">` por `<LinkParentDialog kidName={kid.name} />`. Manual: click abre el diálogo; X y Esc lo cierran. Comparar contra `references/pantallas/vincular-padre.dc.html`.
2. Implementar validación de obligatorios y formato de email: `onSubmit` con `preventDefault`, mensajes del copy definido, borde `#D9583C`, revalidación al tipear/click y cierre solo con form válido. Manual: enviar vacío muestra los 3 mensajes; corregir un campo quita su error; con todo válido cierra.
3. Cierre por click en backdrop (`e.target === dialog`), reset del form en el evento `close` y ajuste responsive (margen móvil + scroll interno). Validación final: capturas de Playwright en desktop y 375px contra el mockup (incluye un perfil que no sea Mateo para verificar la interpolación), `npm run lint` y `npm run build`.

## Acceptance criteria

- [x] El link «Vincular otro padre» de `/kids/[slug]` abre el diálogo sin navegación, con el mismo estilo (avatar punteado + PlusIcon + «Vincular otro padre») que el link actual.
- [x] El diálogo replica el mockup: tarjeta de 480px fondo `#FBF4EC` borde `#ECE0D0` radius 24px, header «Vincular padre / a {kidName}» con X, callout azul, campos con labels y placeholders, 3 píldoras, caja «7K4P9» con «Vence en 7 días» y botón «Enviar invitación» con gradiente.
- [x] En otro perfil (p. ej. `/kids/sofia-mendez`) el subtítulo dice «a Sofía Méndez» y el callout «Solo verá el feed de Sofía.».
- [x] Enviar con los tres campos vacíos muestra «Ingresá el nombre del padre o madre», «Ingresá el email» y «Elegí el parentesco» con borde `#D9583C`, y no cierra el diálogo.
- [x] Un email sin arroba o sin dominio (p. ej. «diego@» o «diegofernandez») muestra «El email no es válido».
- [x] El error de un campo desaparece apenas ese campo pasa a ser válido (tipeo en inputs, click en píldora), sin volver a presionar Enviar.
- [x] Las píldoras abren deseleccionadas; elegir una la marca (borde `#9FB8EC`, fondo `#CCD8F4`) y desmarca las demás.
- [x] Con nombre, email válido y parentesco elegido, «Enviar invitación» cierra el diálogo.
- [x] X, Esc y click en el backdrop cierran el diálogo sin enviar.
- [x] Al reabrir el diálogo, los inputs están vacíos, las píldoras deseleccionadas y no hay errores.
- [x] La lista PADRES VINCULADOS no cambia tras enviar: no hay persistencia.
- [x] `/kids/[slug]` sigue renderizando sin errores tras extender `ParentRole` (ningún padre mock tiene rol `tutor`).
- [x] En 375px el diálogo entra sin scroll horizontal y el contenido hace scroll interno si no cabe.
- [x] `npm run lint` y `npm run build` terminan correctamente y la consola no muestra errores en un perfil.

## Decisions

- **Sí:** `<dialog>` nativo con `showModal()`; reutiliza el patrón de SPEC 04 (Esc, foco atrapado, backdrop) sin librerías ni rutas nuevas.
- **Sí:** extender `ParentRole` con `"tutor"` + `parentRoleLabels`; «Tutor/a» existe en el dominio y las píldoras consumen el map en vez de literales.
- **Sí:** píldoras sin selección inicial; hace verificable la obligatoriedad del parentesco, igual que «Elegí una sala» en SPEC 04 (el mockup muestra Mamá activa, pero preseleccionar vuelve imposible el error del campo).
- **Sí:** «Enviar invitación» valida y cierra sin persistencia; coherente con los mocks estáticos de SPEC 01–04.
- **Sí:** código estático «7K4P9»; el mismo valor ya aparece como placeholder en `/auth/activate-account` (SPEC 03) y da continuidad.
- **Sí:** validación propia inline con formato de email; la nativa HTML5 muestra mensajes del navegador ajenos al diseño.
- **Sí:** callout interpola el primer nombre (`kidName.split(" ")[0]`); copy correcto en los 8 perfiles en vez de «Mateo» literal.
- **Sí:** `kidName` como prop desde la página server; el diálogo no depende de `params`.
- **Sí:** reset en el evento `close` del diálogo; un solo lugar cubre submit, X, Esc y backdrop.
- **No:** agregar el padre a la lista en memoria; el estado se perdería al recargar y contradice los mocks estáticos.
- **No:** código aleatorio por apertura, botón copiar, cuenta regresiva de vencimiento, toast de éxito ni animaciones.

## Risks

| Riesgo                                                                 | Mitigación                                                                          |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Componente client dentro de una página estática con `cacheComponents`. | Estado local puro sin fetch; `/kids/[slug]` sigue siendo server component estático. |
| Píldoras `<button>` dentro del form que disparan submit accidental.    | `type="button"` en las píldoras; solo «Enviar invitación» es `type="submit"`.       |
| El click en backdrop (`e.target === dialog`) varía entre browsers.     | Patrón ya probado en SPEC 04; verificar en Chrome y Safari durante el paso 3.       |

## What is **not** in this spec

- Persistencia ni envío real del email.
- Regeneración, copia o vencimiento dinámico del código de invitación.
- Alta del padre en la lista PADRES VINCULADOS.
- «Resumen del día», «Editar» y family-feed: siguen en `href="#"` o inexistentes.
