# OpenDaycare

App de gestión para guarderías construida con Next.js 16 (App Router), React 19 y Tailwind v4. El backend vive en un proyecto remoto de Supabase (Postgres, Auth y RLS).

## Requisitos previos

- Node.js `>= 20.9`
- npm (viene con Node; el proyecto usa `package-lock.json`, no usar pnpm/yarn/bun)

## Levantar el proyecto

1. Clonar el repositorio e instalar dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo de variables de entorno a partir del template:

   ```bash
   cp .env.template .env
   ```

3. Completar `.env` con los valores del proyecto de Supabase (Dashboard → **Project Settings → API**):

   | Variable | Descripción |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (ej. `https://xxxx.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (público, se envía al browser) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secreto, solo servidor — nunca exponer al cliente) |
   | `SUPABASE_DB_PASSWORD` | Contraseña de la base de datos |

   > ⚠️ `.env` está gitignored. Nunca commitear secretos.

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app corre en [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción (único script que typechequea) |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

## Supabase

### MCP (agentes de código)

El proyecto usa el **MCP remoto de Supabase** (configurado en `opencode.json`) para tareas de base de datos: inspección de schema, migraciones, logs y debugging. Es un server OAuth: la primera vez que un agente intenta conectarse, se abre el browser para autorizar con tu cuenta de Supabase.

Las migraciones viven en `supabase/migrations/` y se aplican de forma remota vía MCP (`apply_migration`), espejadas localmente con la misma versión.

### CLI de Supabase

Para trabajar desde la terminal (migraciones, links al proyecto, etc.) instalar el CLI — en macOS:

```bash
brew install supabase/tap/supabase
```

Ver [docs de instalación](https://supabase.com/docs/guides/local-development/cli/getting-started) para otros sistemas operativos.

#### Login

Autenticar el CLI contra tu cuenta:

```bash
supabase login
```

Abre el browser para completar el OAuth. El access token se guarda en el credential storage nativo del sistema (fallback: `~/.supabase/access-token`).

Alternativa sin browser (útil en CI), con un [personal access token](https://supabase.com/dashboard/account/tokens):

```bash
supabase login --token <access-token>
# o, sin login persistente:
export SUPABASE_ACCESS_TOKEN=<access-token>
```

> 🔒 En CI usar siempre un **scoped token** (limitado a los proyectos y permisos necesarios) en vez del token clásico de browser, que tiene acceso total a la cuenta. `SUPABASE_ACCESS_TOKEN` tiene precedencia sobre el login guardado.

#### Autenticar al equipo

1. El owner invita a los miembros desde el Dashboard: **org settings → [Team](https://supabase.com/dashboard/org/_/team)**, enviando la invitación por email (válida por 24 horas).
2. Cada miembro, al aceptar, hace su propio `supabase login` con su cuenta — el CLI no comparte credenciales.
3. Asignar el rol según la tarea:

   | Rol | Permisos |
   | --- | --- |
   | Owner | Acceso total (config de la org, transferir proyectos, agregar owners) |
   | Administrator | Acceso total excepto configuración de la org |
   | Developer | Lectura de la org + acceso a proyectos, sin cambiar settings |
   | Read-Only | Solo lectura (solo planes Team/Enterprise) |

## Recursos

- [Docs de Next.js](https://nextjs.org/docs)
- [Docs de Supabase](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)
- [Personal access tokens](https://supabase.com/docs/guides/platform/personal-access-tokens)
