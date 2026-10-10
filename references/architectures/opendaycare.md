# Arquitectura de OpenDaycare

## Decisión

Usamos una arquitectura **feature-driven (screaming)**: la estructura principal muestra los dominios del producto y mantiene junto el código que cambia por la misma razón. Las rutas de Next.js siguen en `app/`; el código de cada dominio vive en `features/`.

No usamos `src/`: el proyecto ya organiza `app/`, `components/` y `features/` en la raíz, y el alias `@/*` apunta a esa raíz. No replicamos carpetas técnicas globales como `actions/`, `services/`, `hooks/` o `store/`; sus archivos pertenecen a una feature cuando son propios de ella.

## Estructura

```text
app/
├── (app)/                  # Rutas de la experiencia principal
├── auth/                   # Rutas de login y activación
├── api/                    # Route Handlers solo para integraciones externas
├── globals.css
└── layout.tsx

features/
├── feed/
│   ├── components/         # UI específica del feed
│   ├── actions.ts          # Mutaciones del feed, cuando existan
│   ├── data.ts             # Lecturas/acceso a datos del feed
│   ├── schema.ts           # Validaciones de entrada, cuando existan
│   └── ...                 # Tipos u otros módulos propios del dominio
├── kids/
│   ├── components/
│   ├── actions.ts
│   ├── data.ts
│   └── schema.ts
└── auth/                   # Código de autenticación del dominio

components/
├── layout/                 # Shell compartido: Sidebar, navegación
└── ui/                     # Primitivas visuales independientes del negocio

shared/
├── lib/                    # Utilidades sin lógica de dominio
└── types/                  # Tipos usados por más de una feature

server/
├── db/                     # Cliente y esquema de persistencia
└── auth/                   # Sesión y contexto de usuario del servidor
```

El diagrama es una guía, no una lista de carpetas que haya que crear ahora. Git no conserva carpetas vacías: cada carpeta aparece con el primer archivo real que la necesita.

## Reglas de ubicación

- **`app/`**: convenciones de routing de Next.js (`page.tsx`, `layout.tsx`, `route.ts`, estados de carga/error) y composición de la pantalla. Una página importa la feature, no contiene su lógica de negocio.
- **`features/<dominio>/components/`**: componentes usados por ese dominio. Si un componente es verdaderamente genérico y se comparte entre dominios, ubicarlo en `components/ui/`.
- **`features/<dominio>/data.ts`**: lecturas y acceso a datos de ese dominio. Hoy puede exportar mocks tipados; al incorporar persistencia, ese módulo pasa a consultar la fuente real y conserva una interfaz de dominio útil para sus consumidores. Si los fixtures necesitan seguir existiendo, moverlos a un módulo separado dentro de la feature (por ejemplo, `data/mock.ts`).
- **`features/<dominio>/actions.ts`**: Server Actions que ejecutan mutaciones propias de ese dominio. Evitar un `actions/` global que mezcle features.
- **`features/<dominio>/schema.ts`**: esquemas para validar entradas del dominio. No crear el archivo hasta que haya validaciones que centralizar.
- **`server/`**: infraestructura exclusivamente de servidor y transversal (cliente/esquema de DB, sesión, integraciones compartidas). No trasladar aquí reglas de negocio de una feature.
- **`app/api/`**: Route Handlers solo cuando haga falta exponer HTTP a consumidores externos, webhooks o integraciones. Para formularios y mutaciones internas, preferir la Server Action de la feature.
- **`shared/` y `components/`**: solo código realmente transversal. Si pertenece a un único dominio, mantenerlo dentro de esa feature.

## Dirección de dependencias

Las rutas pueden componer una o más features. Las features pueden depender de `shared/` y de infraestructura segura de `server/` en código de servidor. El código cliente no debe importar módulos exclusivos del servidor. Evitar dependencias entre features; si una pieza es verdaderamente común, extraer únicamente esa pieza a `shared/`.

## Estado actual

- `features/feed/` contiene los componentes y datos mock del feed.
- `features/kids/` contiene los componentes y datos mock de niños.
- `components/layout/` contiene la navegación y el shell compartidos.
- Auth y persistencia todavía no están implementados; sus carpetas y módulos se crearán cuando un spec aprobado los necesite.
