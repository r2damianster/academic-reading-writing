# Academic Reading & Writing Workspace

Sistema de aprendizaje y auditoría académica desarrollado por el **Dr. Arturo Rodríguez Zambrano** (ULEAM, Manta, Ecuador) para ~200 estudiantes de Pedagogía de Idiomas. Combina un entorno de escritura guiada con 8 agentes de IA especializados y auditoría de integridad académica en tiempo real.

---

## Stack tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Frontend** | HTML5, Bootstrap 5, Vanilla JS | 72 módulos de lección, slides interactivos |
| **Backend (local)** | Node.js 24.x · `server.js` | Servidor HTTP + 11 endpoints API |
| **Backend (producción)** | Vercel serverless | Deploy automático desde `main` |
| **Base de datos** | Supabase (PostgreSQL) | Perfiles, ensayos, auditoría, agentes |
| **IA — LLM primario** | Groq API (Llama 3.1/3.3) | Todos los agentes (gratuito) |
| **IA — alternativa** | Qwen (DashScope / Groq) | Documentado en `CLAUDE.md`, no implementado aún (`lib/qwen-client.js` no existe) |
| **IA — Claude Code** | Anthropic Claude | Desarrollo y mantenimiento del proyecto |
| **PDF** | jsPDF | Reportes de progreso estudiantil |

---

## Arquitectura de agentes

El sistema usa un **orquestador central** (`/api/orchestrator`) que recibe todas las peticiones de IA y las enruta al agente correcto. Cada llamada pasa por el **Token Optimizer** para seleccionar el modelo según la complejidad.

```
Frontend (AgentClient.call) 
    → POST /api/orchestrator
        → Token Optimizer (score 0-100)
        → Memory Agent (Segmento B: perfil del estudiante)
        → Agente específico (Segmento C: payload transformado)
        → Groq API (llama-3.1-8b o llama-3.3-70b)
        → _logInteraction (Supabase agent_interactions)
```

### Agentes disponibles

| Agente | Archivo | Cuándo se activa |
|--------|---------|-----------------|
| **Writing** | `lib/agents/writing.js` | Al enviar un ensayo (slide tipo ESSAY) |
| **Reading** | `lib/agents/reading.js` | Panel "🤖 Reading Coach" en PDFs |
| **Integrity** | `lib/agents/integrity.js` | Fire & forget al enviar ensayo (solo instructor) |
| **Progress** | *(prompt en _prompts.js)* | Tab "🤖 AI Insights" en `my-progress.html` |
| **Peer Review** | `lib/agents/peer-review.js` | Formulario de peer review (Modo A y B) |
| **Content Gen** | `lib/agents/content-gen.js` | Admin: "Generate Lesson Slides" |
| **DB Admin** | *(prompt en _prompts.js)* | Admin: consola de base de datos con IA |
| **Frontend** | `lib/agents/frontend.js` | Diagnóstico de componentes UI |
| **GitHub** | `lib/agents/github.js` | Auditoría de seguridad — hoy invocación manual (el hook `PostToolUse` no está configurado) |
| **Memory** | `lib/agents/memory.js` | Interno — comprime perfiles nocturnamente |
| **Report Analyst** | `lib/agents/report-analyst.js` | Tab "🤖 AI Insights" en `my-progress.html` — análisis multi-intento para el instructor |
| **Test Grader** | `lib/agents/test-grader.js` | Envío de tests en `modules/04-tests/` — evalúa contra rúbrica de 8 indicadores |

### Diseño de prompts (3 segmentos)

```
Segmento A (system prompt)  — _prompts.js, estático, ~500-1000 tokens
Segmento B (contexto)       — Memory Agent, perfil comprimido, ~200-300 tokens
Segmento C (tarea actual)   — agente específico, payload dinámico, 50-500 tokens
```

### Token Optimizer

El score de complejidad (0-100) determina el modelo:

| Score | Modelo | Max tokens |
|-------|--------|-----------|
| 0-30 | `llama-3.1-8b-instant` | 300 |
| 31-65 | `llama-3.3-70b-versatile` | 800 |
| 66-100 | `llama-3.3-70b-versatile` | 2000 |

---

## Estructura de archivos

```
Academic_reading_and_writing/
├── api/                          # 11 endpoints Vercel (bajo el límite de 12)
│   ├── config.js                 # GET  /api/config         — credenciales Supabase al browser
│   ├── orchestrator.js           # POST /api/orchestrator   — router de todos los agentes
│   ├── validate-student.js       # POST /api/validate-student — auth (admin + estudiantes)
│   ├── sync-reading.js           # POST /api/sync-reading   — progreso de lectura → Supabase
│   ├── gamification.js           # Dojo — ligas, racha, insignias
│   ├── lesson-availability.js    # Disponibilidad de lecciones por fecha
│   ├── admin-students.js         # Admin: listado/gestión de estudiantes
│   ├── admin-student-detail.js   # Admin: detalle de un estudiante
│   ├── admin-archive-course.js   # Admin: archivar curso completo
│   ├── admin-reenroll-student.js # Admin: re-matricular estudiante
│   └── cron/
│       └── compress-profiles.js  # Cron diario 03:00 UTC    — compresión de perfiles
│
├── lib/                          # Módulos de soporte (no cuentan como funciones Vercel)
│   ├── groq-client.js            # Cliente Groq (fetch nativo, sin SDK extra)
│   └── agents/
│       ├── _prompts.js           # System prompts cacheados
│       ├── memory.js             # Memory Agent (getProfile, buildContextString, saveSessionCache)
│       ├── writing.js            # Writing Agent
│       ├── reading.js            # Reading Agent
│       ├── integrity.js          # Integrity Agent
│       ├── peer-review.js        # Peer Review Agent (2 modos)
│       ├── content-gen.js        # Content Generator Agent
│       ├── frontend.js           # Frontend Diagnostic Agent
│       ├── report-analyst.js     # Report Analyst Agent
│       ├── test-grader.js        # Test Grader Agent
│       └── github.js             # GitHub Agent (auditoría de seguridad, invocación manual)
│
├── js/                           # Scripts del cliente
│   ├── agent-client.js           # AgentClient.call() — wrapper para el orquestador
│   ├── auth.js                   # Login, localStorage, sesión 24h
│   ├── slide-engine.js           # Motor de slides (~3373 líneas, 12 tipos de slide)
│   ├── reading-engine.js         # Lector PDF + panel AI
│   ├── essay-handler.js          # Envío de ensayos + métricas de integridad
│   ├── report.js                 # Generación de PDF de progreso
│   ├── dojo-client.js            # Cliente Dojo — API calls + offline-first localStorage sync
│   ├── lesson-access.js          # Control de disponibilidad de lecciones
│   ├── nav.js / navigation.js    # Navegación entre módulos/lecciones
│   └── activity-tracker.js      # Auditoría de keystrokes, pastes, tab switches
│
├── modules/                      # 72 lecciones en 5 tracks
│   ├── 00-fundamentals/          # 14 lecciones (párrafos, introducción, conclusión…)
│   ├── 01-core-syllabus/         # Essays + Research Papers (APA, integridad)
│   ├── 02-toolbox/               # Gramática, vocabulario, conectores
│   ├── 03-peer-review/           # Formulario de peer review y self-assessment
│   └── 04-tests/                 # Evaluaciones y quizzes
│
├── index.html                    # Hub del estudiante (login + módulos)
├── admin.html                    # Panel del instructor (35 KB)
├── my-progress.html              # Progreso del estudiante + AI Insights (52 KB)
├── server.js                     # Servidor Node.js para desarrollo local
├── vercel.json                   # Config de deploy + cron diario
├── supabase-agents-schema.sql    # Schema SQL para tablas de agentes
├── CLAUDE.md                     # Instrucciones para Claude Code
└── DEUDA_TECNICA.md              # Bugs, deuda técnica e infraestructura pendiente
```

---

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# IA — Proveedor principal
GROQ_TOKEN=gsk_...           # Groq API key (https://console.groq.com)

# IA — Alternativa Qwen (opcional)
QWEN_API_KEY=sk-...          # DashScope API key (https://dashscope.aliyuncs.com)

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...          # anon key (expuesta al browser en /api/config)
SUPABASE_SERVICE_KEY=eyJ...  # service_role key (solo servidor, NUNCA al browser)

# Auth
ADMIN_PASSWORD=...           # Contraseña para arturo.rodriguez@uleam.edu.ec

# Seguridad
CRON_SECRET=...              # Protege /api/cron/compress-profiles
PORT=3000                    # Solo desarrollo local
```

---

## Base de datos Supabase

### Tablas principales (pre-existentes)

| Tabla | Descripción |
|-------|------------|
| `students` | Datos del estudiante (nombre, email, grupo) |
| `essay_submissions` | Ensayos enviados + métricas de auditoría |
| `reading_progress` | Sesiones de lectura completadas |
| `essay_compliance_results` | Resultados de compliance por lección |
| `activity_logs` | Eventos de keystrokes, pastes, tab switches |

### Tablas de agentes (nuevas)

| Tabla | Descripción |
|-------|------------|
| `student_profiles` | Perfil comprimido por el Memory Agent (RLS activo) |
| `agent_interactions` | Audit trail de todas las llamadas de IA + token counts |
| `session_cache` | Segmento B cacheado (TTL 4h) para reducir tokens |
| `essay_requirements` | 34 filas de criterios de compliance por lección |

Para crear las tablas nuevas, ejecuta `supabase-agents-schema.sql` en el Dashboard de Supabase.

---

## Cómo ejecutar localmente

```bash
# Instalar dependencias
npm install

# Crear variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm start
# → http://localhost:3000
```

---

## Deploy en Vercel

El proyecto se despliega automáticamente al hacer push a `main`.

**Requisitos en Vercel Settings → Environment Variables:**
- `GROQ_TOKEN`
- `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`
- `ADMIN_PASSWORD`, `CRON_SECRET`

**Límite de funciones:** Vercel Hobby plan = 12 serverless functions. El proyecto usa 11 (`api/`). Los módulos de agentes están en `lib/` (no cuentan).

**Cron:** `/api/cron/compress-profiles` se ejecuta cada día a las 03:00 UTC (22:00 Ecuador).

---

## Flujo del estudiante

1. Login en `index.html` con email universitario
2. Selección de módulo → slide engine carga la lección
3. Slides de tipo `READING` → PDF + panel "🤖 Reading Coach"
4. Slides de tipo `ESSAY` → editor de texto + feedback de Writing Agent
5. Al enviar: Integrity Agent analiza las métricas (solo visible al instructor)
6. Progreso guardado en Supabase → visible en `my-progress.html`

---

## Flujo del instructor

1. Login en `index.html` con `arturo.rodriguez@uleam.edu.ec` + contraseña.
2. Selección de lección: Por defecto, la lección carga en **"Modo Estudiante"** (con bloqueos y sin respuestas).
3. **Modo Instructor**:
   - En la sidebar izquierda inferior, verás un botón de **toggle** (Modo Instructor).
   - Al activarlo, la lección actual mostrará instantáneamente la barra de administración y el acceso al **Teacher Helper**.
4. Acceso a `admin.html`:
   - Disponible vía botón en la sidebar o URL directa para:
   - Overview de estudiantes y métricas de integridad.
   - Consola DB Admin con IA.
   - Generador de lecciones (Content Gen Agent).

---

## Alternativas de IA

Este proyecto está diseñado para ser **agnóstico al proveedor de LLM**. El cliente en `lib/groq-client.js` usa la API de Groq (compatible con OpenAI), lo que facilita cambiar de proveedor:

- **Groq + Llama 3** — Activo por defecto (gratuito)
- **Groq + Qwen** / **DashScope + Qwen** — Documentado en `CLAUDE.md`, no implementado (`lib/qwen-client.js` no existe)
- **Anthropic Claude** — `@anthropic-ai/sdk` ya instalado, ver [CLAUDE.md](CLAUDE.md)

---

## Autor

**Dr. Arturo Rodríguez Zambrano**  
Docente de Pedagogía de los Idiomas Nacionales y Extranjeros  
Universidad Laica Eloy Alfaro de Manabí (ULEAM) — Manta, Ecuador  
`arturo.rodriguez@uleam.edu.ec`
