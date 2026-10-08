# SPEC 04 — Agregar niño: diálogo con validación

> **Estado:** Done
> **Depende de:** SPEC 02, SPEC 03
> **Fecha:** 2026-10-08
> **Objetivo:** Implementar el botón «Agregar niño» de `/kids` como disparador de un diálogo nativo con el formulario de `references/pantallas/agregar-nino.dc.html`, donde nombre, fecha de nacimiento (con máscara dd/mm/aaaa) y sala son obligatorios, con validación inline propia y sin persistencia.

## Scope

**In:**

- `components/AddKidDialog.tsx` (client): contiene el botón disparador «Agregar niño» (mismo estilo del link actual: gradiente `#F4977E→#EE8164` + PlusIcon) y el `<dialog>` nativo que abre con `showModal()`. Reemplaza el `<a href="#">` en `app/(app)/kids/page.tsx`, que sigue siendo server component.
- Diálogo fiel al mockup: tarjeta `max-w-[520px]` con fondo `#FBF4EC`, borde `1px` `#ECE0D0` (token `border-border`), radius 24px y sombra `0 20px 50px -24px rgba(63,54,46,.35)`; header con «Cancelar» (izquierda, `text-muted`), título «Agregar niño» (Fredoka 18px) y «Guardar» (derecha, `#D9583C`, `type="submit"`).
- Campos del body: NOMBRE COMPLETO (input, placeholder «Ej. Martina López»), fila FECHA DE NACIMIENTO + SALA (2 columnas, gap 14px), ALERGIAS (ETIQUETAS) (input, placeholder «Ej. Maní, Lactosa») y NOTAS MÉDICAS (textarea, placeholder «Indicaciones, medicación, contactos…»). Inputs con padding 13/16px, radius 14px, borde `1.5px #EADFD0`, fondo blanco.
- `components/BirthDateInput.tsx` (client): input de fecha controlado con máscara dd/mm/aaaa — solo dígitos, barra automática al completar día y mes, máximo 10 caracteres, pegado reformateado — y validadores puros `formatDateInput` / `validateBirthDate`.
- Obligatorios: nombre (no vacío tras trim), fecha de nacimiento y sala. Alergias y notas opcionales.
- Validación al guardar: calendario real (mes 1–12, día válido del mes con bisiestos) y no posterior a hoy.
- Errores inline propios: borde `#D9583C` + mensaje en español bajo el campo. Copy: «Ingresá el nombre», «Ingresá la fecha de nacimiento», «La fecha no es válida», «La fecha no puede ser posterior a hoy», «Elegí una sala».
- Revalidación al tipear: el error de un campo desaparece apenas ese campo pasa a ser válido.
- Select de Sala: `appearance-none` con el chevron del mockup, opción vacía «Elegí una sala» como estado inicial y «Soles» como única opción real.
- Botón «Guardar» siempre activo; cierra el diálogo solo si el form es válido.
- Cierre sin guardar: Cancelar (`type="button"`), tecla Esc y click en el backdrop (`::backdrop` con `rgba(63,54,46,0.45)`); el click en backdrop se detecta comparando `e.target === dialog`.
- Reset del form en cualquier cierre, vía el evento `close` del `<dialog>`; al reabrir, los 5 campos están vacíos y sin errores.
- Responsive: margen lateral en móvil y scroll interno del contenido si no entra en el viewport.

**Fuera de alcance (para specs futuras):**

- Persistencia o alta real: «Guardar» valida y cierra; la grilla y el contador «8 niños» no cambian.
- Chips/tags interactivas para alergias; queda input simple.
- Animaciones de entrada/salida del modal.
- Edición de niño, resumen del día y vincular padre: siguen en `href="#"`.
- Búsqueda funcional de `/kids` y API/DB; los mocks siguen estáticos.

## Data model

Esta feature no introduce mocks nuevos ni datos compartidos; el estado del formulario es local a `components/AddKidDialog.tsx`:

```ts
// Estado local del form en components/AddKidDialog.tsx (no es mock compartido)
type AddKidFormValues = {
  name: string; // obligatorio, trim antes de validar
  birthDate: string; // obligatorio, "dd/mm/aaaa"
  classroom: string; // obligatorio, "" | "Soles"
  allergies: string; // opcional
  notes: string; // opcional
};

// components/BirthDateInput.tsx — helpers puros
formatDateInput(raw: string): string; // "12042022" → "12/04/2022"
validateBirthDate(value: string): BirthDateError | null;
// null = válida; errores: "empty" | "invalid" | "future"
```

Convenciones:

- Valores internos en inglés; copy visible en español.
- `classroom` reutiliza el nombre de `kidDetail.classroom`; «Soles» es literal porque es la única sala del sistema — no se crea un mock de salas para una sola opción.
- El color de error es el `#D9583C` existente del sistema (labels «GESTIÓN», «Guardar»); no se agrega un rojo nuevo.

## Implementation plan

1. Crear `components/AddKidDialog.tsx` (client): botón disparador con el estilo del link actual + `<dialog>` con la estructura del mockup (header Cancelar/título/Guardar, labels, inputs, select de sala con chevron, textarea), sin lógica de validación aún. Reemplazar el `<a href="#">` de `app/(app)/kids/page.tsx` por `<AddKidDialog />`. Manual: click abre el diálogo, Cancelar y Esc lo cierran. Comparar contra `references/pantallas/agregar-nino.dc.html`.
2. Crear `components/BirthDateInput.tsx` con la máscara (filtro de dígitos, barras automáticas, tope de 10 caracteres, pegado reformateado) y los helpers `formatDateInput` / `validateBirthDate`. Conectarlo al campo FECHA DE NACIMIENTO. Manual: tipear «12042022» produce «12/04/2022»; letras y símbolos no entran.
3. Implementar validación de obligatorios y errores inline: `onSubmit` con `preventDefault`, mensajes del copy definido, borde `#D9583C`, revalidación al tipear y cierre solo con form válido. Manual: guardar vacío muestra los 3 mensajes; corregir un campo quita su error; con todo válido cierra.
4. Cierre por click en backdrop (`e.target === dialog`), reset del form en el evento `close` y ajuste responsive (margen móvil + scroll interno). Validación final: capturas de Playwright en desktop y 375px contra el mockup, `npm run lint` y `npm run build`.

## Acceptance criteria

- [x] El botón «Agregar niño» de `/kids` abre el diálogo sin navegación, con el mismo estilo (gradiente + PlusIcon) que el link actual.
- [x] El diálogo replica el mockup: tarjeta de 520px fondo `#FBF4EC` borde `#ECE0D0` radius 24px, header «Cancelar / Agregar niño / Guardar» y los 5 campos con labels y placeholders del mockup.
- [x] Tipear «12042022» en fecha produce «12/04/2022»; letras y símbolos no entran; el largo máximo es 10 caracteres.
- [x] Guardar con los tres obligatorios vacíos muestra «Ingresá el nombre», «Ingresá la fecha de nacimiento» y «Elegí una sala» con borde `#D9583C`, y no cierra el diálogo.
- [x] Una fecha calendario inexistente (p. ej. «31/02/2025») muestra «La fecha no es válida»; una fecha posterior a hoy muestra «La fecha no puede ser posterior a hoy».
- [x] El error de un campo desaparece apenas ese campo pasa a ser válido, sin volver a presionar Guardar.
- [x] Con nombre, fecha válida y sala «Soles» (alergias y notas vacíos), Guardar cierra el diálogo.
- [x] Cancelar, Esc y click en el backdrop cierran el diálogo sin guardar.
- [x] Al reabrir el diálogo, los 5 campos están vacíos y sin errores.
- [x] El select de Sala muestra «Elegí una sala» como estado inicial, «Soles» como única opción real y el chevron del mockup.
- [x] En 375px el diálogo entra sin scroll horizontal y el contenido hace scroll interno si no cabe.
- [x] `/kids` sigue mostrando los 8 niños y el contador «8 niños»: nada se agrega ni persiste.
- [x] `npm run lint` y `npm run build` terminan correctamente y la consola no muestra errores en `/kids`.

## Decisions

- **Sí:** `<dialog>` nativo con `showModal()`; Esc, foco atrapado y backdrop sin librerías ni rutas nuevas.
- **Sí:** Guardar valida y cierra sin persistencia; coherente con los mocks estáticos de SPEC 01–03.
- **Sí:** validación propia inline (borde `#D9583C` + mensaje en español); la nativa HTML5 muestra mensajes del navegador ajenos al diseño.
- **Sí:** revalidación al tipear; el feedback inmediato evita reintentos a ciegas.
- **Sí:** fecha con calendario real y no posterior a hoy; un niño no puede haber nacido mañana.
- **Sí:** select con «Elegí una sala» + «Soles»; hace verificable la obligatoriedad sin inventar salas.
- **Sí:** alergias como input simple; las chips serían decoración sin persistencia.
- **Sí:** botón Guardar siempre activo; coherente con los errores visibles al intentar guardar.
- **Sí:** reset en el evento `close` del diálogo; un solo lugar cubre Guardar, Cancelar, Esc y backdrop.
- **Sí:** backdrop `rgba(63,54,46,0.45)`; el mockup es página completa y no define uno.
- **Sí:** máscara aislada en `BirthDateInput` con helpers puros; mantiene `AddKidDialog` pequeño y testeable.
- **No:** alta en memoria ni localStorage; la grilla no cambia.
- **No:** chips de alergias, animaciones del modal, edición de niño.

## Risks

| Riesgo                                                                                   | Mitigación                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| El click en backdrop y los eventos `cancel`/`close` de `<dialog>` varían entre browsers. | Detectar backdrop comparando `e.target === dialog`; probar en Chrome y Safari durante el paso 4. |
| «No posterior a hoy» depende del reloj del cliente.                                      | Aceptable en una demo sin backend; se compara contra `new Date()` local.                         |
| Componente client dentro de una página estática con `cacheComponents` habilitado.        | El diálogo es estado local puro sin fetch; `/kids` sigue siendo server component estático.       |

## What is **not** in this spec

- Persistencia ni alta real del niño: la grilla y el contador no cambian.
- Chips de alergias ni animaciones del modal.
- Edición de niño, resumen del día ni vincular padre.
- Búsqueda funcional ni API/DB.
