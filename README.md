# AI Project Assistant

A full-stack AI-powered project management tool built with FastAPI, Next.js, Gemini AI, and Supabase.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python + FastAPI |
| Frontend | Next.js + Tailwind CSS |
| AI | Google Gemini API |
| Image Generation | Pollinations.ai |
| Database | Supabase (PostgreSQL) |

---

## Features

- Chat with Gemini AI about your projects
- Tool calling loop (Gemini calls tools, gets results, responds)
- Generate images using Pollinations.ai
- Analyze images using Gemini Vision
- Per-project memory stored in Supabase
- Background agent that organizes project knowledge
- Agent execution status polling

---

## Schema Design

### Why these tables?

**`projects`**
Stores the project brief. Fields chosen to cover all aspects of a project:
- `title`, `description` — basic identity
- `goals` (array) — trackable objectives
- `tags` (array) — for filtering and categorization
- `reference_links` (array) — external resources
- `status` (enum) — active / paused / completed
- `updated_at` — auto-updated via trigger

**`conversations`**
Groups messages into sessions per project.
Each project can have multiple conversations.
Allows users to switch between chat sessions.

**`messages`**
Stores every message in a conversation.
- `role` — user / assistant / tool
- `tool_calls` (jsonb) — stores tool call metadata
- Ordered by `created_at` to reconstruct chat history

**`images`**
Stores generated images linked to a project.
- `prompt` — original generation prompt
- `url` — Pollinations.ai URL
- `analysis_result` — Gemini Vision analysis (populated on demand)

**`memory_entries`**
Key-value store scoped per project.
- Unique constraint on `(project_id, key)` — upsert behavior
- Used by Gemini tools to persist and retrieve knowledge
- Scoped per project so memories don't bleed between projects

**`agent_runs`**
Tracks background agent execution.
- `status` enum — pending / running / completed / failed
- `result` — summary of what was organized
- `error` — error message if failed
- `started_at`, `completed_at` — timing info for monitoring

---

## API Endpoints

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/` | Create a new project |
| GET | `/projects/` | List all projects |
| GET | `/projects/{id}` | Get project details |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/{id}/chat` | Send message to Gemini |
| GET | `/projects/{id}/conversations` | List conversations |
| GET | `/projects/{id}/conversations/{conv_id}/messages` | Get messages |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/{id}/images/generate` | Generate image via Pollinations.ai |
| POST | `/projects/images/analyze` | Analyze image with Gemini Vision |
| GET | `/projects/{id}/images` | List project images |

### Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/{id}/run-agent` | Trigger background agent |
| GET | `/projects/agent-runs/{run_id}` | Poll agent status |

---

## How the Agent System Works

### Overview
The background agent reads all project data and uses Gemini to organize it into structured memory entries.

### Flow
```
POST /projects/{id}/run-agent
        │
        ▼
Creates agent_run record (status: pending)
        │
        ▼
Spawns background task (FastAPI BackgroundTasks)
        │
        ▼
Agent reads all project data:
  - Project brief (title, description, goals)
  - All conversation messages
  - All generated images + analyses
  - Existing memory entries
        │
        ▼
Sends everything to Gemini with structured prompt
        │
        ▼
Gemini returns organized key-value pairs:
  - project_summary
  - main_goals
  - key_decisions
  - image_themes
  - progress_notes
  - next_steps
  - important_links
        │
        ▼
Each entry saved to memory_entries table
        │
        ▼
agent_run status updated to "completed"
        │
        ▼
GET /projects/agent-runs/{run_id}
Returns: { status: "completed", result: "Organized 7 memory entries" }
```

### Why BackgroundTasks?
- Agent can take 10-30 seconds to run
- We don't want the HTTP request to hang
- Client polls for status instead of waiting
- Non-blocking — server handles other requests while agent runs

### Memory Scoping
Every memory entry has a `project_id` foreign key.
When Gemini tools call `search_memory` or `get_all_memory`,
they always filter by the current `project_id`.
This ensures Project A's knowledge never appears in Project B's chat.

---

## How the Tool Loop Works
```
User sends message
        │
        ▼
Gemini receives message + all tool definitions
        │
        ▼
Gemini decides to call a tool (e.g. get_project_brief)
        │
        ▼
Backend executes the tool function
        │
        ▼
Tool result sent back to Gemini
        │
        ▼
Gemini may call more tools (e.g. search_memory)
        │
        ▼
When Gemini has enough context → returns final text
        │
        ▼
Response saved to messages table
        │
        ▼
Returned to user
```

### Available Tools
| Tool | Description |
|------|-------------|
| `get_project_brief` | Fetch project title, description, goals |
| `list_project_images` | List all images for the project |
| `search_memory` | Look up a specific memory key |
| `get_all_memory` | Get all stored memories |
| `save_to_memory` | Persist a key-value memory |
| `generate_image` | Generate image via Pollinations.ai |
| `analyze_image` | Analyze image with Gemini Vision |

---

## Setup Instructions

### Backend
```bash
# Clone and enter project
cd ai-project-assistant

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install fastapi uvicorn python-dotenv supabase google-genai httpx pillow pydantic-settings

# Create .env file
cp .env.example .env
# Fill in your keys

# Run server
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
IMAGE_GENERATION_URL=https://image.pollinations.ai/prompt
GEMINI_MODEL=gemini-2.0-flash
```

---

## Project Structure
```
ai-project-assistant/
├── app/
│   ├── main.py              # FastAPI app + CORS
│   ├── config.py            # Settings from .env
│   ├── api/                 # Route handlers
│   │   ├── projects.py
│   │   ├── chat.py
│   │   ├── images.py
│   │   └── agents.py
│   ├── services/            # Business logic
│   │   ├── gemini_service.py  # Chat + tool loop
│   │   ├── agent_service.py   # Background agent
│   │   ├── image_service.py
│   │   └── memory_service.py
│   ├── tools/               # Gemini function calling
│   │   ├── project_tools.py
│   │   ├── memory_tools.py
│   │   └── image_tools.py
│   ├── db/
│   │   ├── supabase_client.py
│   │   └── repositories/    # DB query functions
│   └── models/              # Pydantic schemas
└── frontend/
    ├── app/
    │   ├── page.js          # Home
    │   └── projects/        # Project pages
    ├── components/          # Navbar, cards
    └── lib/api.js           # API calls
```