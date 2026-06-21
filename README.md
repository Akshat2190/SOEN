# SOEN — Collaborative AI-Powered Coding Workspace

SOEN is a full-stack, real-time collaborative development environment built on the MERN stack. It combines project management, live chat, AI code generation, a browser-based code editor (powered by WebContainer), a shared whiteboard, and a shared document editor — all inside a single workspace per project.

---

## Table of Contents

1. [Project Purpose](#1-project-purpose)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Features](#4-features)
5. [Data Models](#5-data-models)
6. [Backend — API Reference](#6-backend--api-reference)
7. [Real-Time Socket Events](#7-real-time-socket-events)
8. [AI System](#8-ai-system)
9. [Frontend — Screens & Components](#9-frontend--screens--components)
10. [State Management](#10-state-management)
11. [Environment Variables](#11-environment-variables)
12. [Project Structure](#12-project-structure)
13. [Local Setup](#13-local-setup)
14. [Deployment](#14-deployment)
15. [Known Limitations & Future Scope](#15-known-limitations--future-scope)

---

## 1. Project Purpose

SOEN is designed for small software teams or individuals who want a unified space to:

- Discuss and plan features via real-time project chat.
- Ask an AI assistant to generate full file-tree code scaffolds on demand.
- Edit code collaboratively in a browser-based environment without any local tooling.
- Sketch and annotate ideas on a shared whiteboard.
- Write shared notes in a collaborative document editor.
- Keep a persistent **AI-maintained project memory** that tracks goals, tech stack decisions, known issues, deployment notes, and next steps.

---

## 2. High-Level Architecture

```
Browser (React + Vite)
       │
       ├── REST (Axios)  ──────────►  Express REST API  ──► MongoDB (Mongoose)
       │                                                └──► Redis (token blacklist)
       │
       └── WebSocket (Socket.IO) ──► Socket.IO Server ──► Google Gemini AI
```

- The **frontend** is a single-page React application served by Vite.
- The **backend** is an Express server that exposes REST endpoints and a Socket.IO server on the same HTTP port.
- **MongoDB** stores users, projects, file trees, whiteboard state, document content, and project memory.
- **Redis** is used exclusively to blacklist JWT tokens after logout.
- **Google Gemini** (via `@google/generative-ai`) is the AI engine for code generation and project memory management.
- **WebContainer API** (`@webcontainer/api`) runs a Node.js-compatible runtime inside the browser tab so generated code can be installed and executed without a remote server.

---

## 3. Tech Stack

### Backend

| Technology | Version | Role |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | ^5.1.0 | HTTP framework |
| MongoDB / Mongoose | ^8.17.1 | Primary database |
| Socket.IO | ^4.8.1 | Real-time bidirectional events |
| JSON Web Tokens | ^9.0.2 | Stateless authentication |
| bcryptjs | ^3.0.2 | Password hashing |
| ioredis | ^5.7.0 | Redis client (token blacklist) |
| @google/generative-ai | ^0.24.1 | Gemini AI integration |
| express-validator | ^7.2.1 | Request body validation |
| morgan | ^1.10.1 | HTTP request logging |
| dotenv | ^17.2.1 | Environment variable loading |
| cors | ^2.8.5 | Cross-origin resource sharing |
| cookie-parser | ^1.4.7 | Cookie parsing middleware |

### Frontend

| Technology | Version | Role |
|---|---|---|
| React | ^19.1.1 | UI library |
| Vite | ^7.1.2 | Build tool and dev server |
| React Router DOM | ^7.9.1 | Client-side routing |
| Axios | ^1.12.2 | HTTP client |
| Socket.IO Client | ^4.8.1 | Real-time connection |
| Tailwind CSS | ^4.1.13 | Utility-first styling |
| Zustand | ^5.0.14 | Lightweight global state |
| @webcontainer/api | ^1.6.4 | In-browser Node.js runtime |
| highlight.js | ^11.11.1 | Code syntax highlighting |
| markdown-to-jsx | ^8.0.0 | Markdown rendering |
| roughjs | ^4.6.6 | Whiteboard sketch rendering |
| perfect-freehand | ^1.2.3 | Freehand stroke smoothing |
| remixicon | ^4.6.0 | Icon library |

---

## 4. Features

### 4.1 Authentication

- **Register** — Create a new account with email and password. Password is hashed with bcryptjs (salt rounds = 10). A signed JWT (24h expiry) is returned and stored in `localStorage`.
- **Login** — Verify credentials, return a JWT.
- **Profile** — Return the currently authenticated user's data.
- **Logout** — Blacklist the current JWT in Redis so it cannot be reused even before expiry.
- **List all users** — Returns all registered users excluding the current one (used for adding collaborators).

### 4.2 Project Management

- **Create project** — A user creates a named project; they are automatically the first member.
- **View my projects** — Lists all projects the authenticated user belongs to.
- **Get project by ID** — Returns full project data including populated collaborator list.
- **Add collaborators** — Project owner can invite other registered users by their user IDs.
- **Remove collaborators** — Project owner can remove members.

### 4.3 Real-Time Collaboration (Socket.IO)

Every feature below works inside a **project room** — a Socket.IO room scoped to a single project ID. Socket connections are authenticated via JWT and verified against project membership before joining the room.

- **Project chat** — Messages broadcast instantly to all room members.
- **AI chat** — Any message containing `@ai` triggers a Gemini response broadcast back to the room.
- **File tree sync** — File tree changes (create, edit, delete files) are broadcast and persisted to MongoDB.
- **Document sync** — Shared document content is broadcast and persisted.
- **Whiteboard draw** — Individual draw operations are broadcast to other clients.
- **Whiteboard cursor** — Real-time cursor positions of other users shown on the canvas.
- **Whiteboard sync** — Full whiteboard state snapshot broadcast and persisted.
- **Whiteboard clear** — Clears the canvas for all users and resets state in DB.

### 4.4 AI Code Generation

- Triggered by including `@ai` in a chat message.
- Uses **Gemini 2.5 Flash** (configurable via `GOOGLE_AI_MODEL` env var).
- Returns a structured JSON response containing:
  - `text` — a natural language explanation.
  - `fileTree` — a complete file tree object compatible with WebContainer.
  - `buildCommand` — npm install command.
  - `startCommand` — node start command.
- The AI is context-aware: it receives the current file tree and project memory before responding.

### 4.5 AI Project Memory

Each project stores a persistent memory object:

| Field | Description |
|---|---|
| `goal` | Short description of the project's purpose |
| `stack` | Technologies and services being used |
| `decisions` | Key architecture or product decisions |
| `knownIssues` | Bugs, risks, or gaps |
| `deploymentNotes` | Production, env, hosting, socket, CORS notes |
| `nextSteps` | Concrete next actions |
| `updatedAt` | Timestamp of last memory update |

Memory can be:
- **Manually edited** by any project member.
- **Auto-generated** by calling the `POST /projects/generate-memory` endpoint (uses Gemini to summarise the project).
- **Suggested** via `POST /projects/suggest-memory` which analyses a recent chat message or event and returns a patch only if it contains durable information worth saving.

### 4.6 Browser-Based Code Editor (WebContainer)

- The `Project.jsx` screen embeds a file explorer, editor tabs, and a terminal-like output panel.
- The WebContainer runtime (`@webcontainer/api`) boots in the browser, receives the file tree from the AI response, runs `npm install`, then starts the application.
- File edits made in the editor are synced back through `file-tree:sync` events so all collaborators see updates.

### 4.7 Whiteboard

- A full-featured collaborative whiteboard built with `roughjs` (shapes) and `perfect-freehand` (freehand strokes).
- **Tools**: select, pencil, line, rectangle, circle, text.
- **Features**: zoom, pan, undo/redo, properties panel (stroke color, fill, stroke width, roughness), zoom controls.
- State is persisted in MongoDB and broadcast in real time to all room members.
- Other users' cursors are rendered live on the canvas.

### 4.8 Shared Document Editor

- A simple rich-text-like shared document per project.
- Content is broadcast via `document:sync` and saved to MongoDB.

### 4.9 Landing Page

The public-facing landing page (`Landing.jsx`) consists of the following sections:

- `LandingNav` — Navigation bar with theme toggle and auth links.
- `LandingHero` — Hero section with headline, CTA buttons.
- `LandingFeatures` — Feature highlights grid.
- `LandingHowItWorks` — Step-by-step usage walkthrough.
- `LandingAbout` — About section.
- `LandingTechStack` — Tech stack showcase.
- `LandingCTA` — Call-to-action section.
- `LandingFooter` — Footer links.

### 4.10 Theme Support

- `ThemeToggle` component allows switching between light and dark mode.

---

## 5. Data Models

### 5.1 User

```js
{
  email: String,      // unique, lowercase, 5–50 chars, required
  password: String,   // bcrypt hash, not returned in queries by default
}
```

**Methods:**
- `User.hashPassword(password)` — static, hashes a plain text password.
- `user.isValidPassword(password)` — instance, compares plain text to stored hash.
- `user.generateJWT()` — instance, signs and returns a 24h JWT containing `{ email }`.

### 5.2 Project

```js
{
  name: String,            // lowercase, trimmed, required
  users: [ObjectId],       // refs to User
  fileTree: Object,        // WebContainer-compatible file tree, default {}
  documentContent: String, // shared document body, default ""
  whiteboardState: Array,  // array of canvas element objects, default []
  memory: {
    goal: String,
    stack: String,
    decisions: [String],
    knownIssues: [String],
    deploymentNotes: [String],
    nextSteps: [String],
    updatedAt: Date,
  }
}
```

---

## 6. Backend — API Reference

Base URL: configured via `VITE_API_URL` in the frontend.

All protected routes require an `Authorization: Bearer <token>` header.

### 6.1 User Routes — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/register` | No | Register a new user. Body: `{ email, password }` |
| POST | `/users/login` | No | Login. Body: `{ email, password }`. Returns `{ token, user }` |
| GET | `/users/profile` | Yes | Returns the current user's data |
| GET | `/users/logout` | Yes | Blacklists the current JWT in Redis |
| GET | `/users/all` | Yes | Returns all users except the current one |

### 6.2 Project Routes — `/projects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/projects/create` | Yes | Create a project. Body: `{ name }` |
| GET | `/projects/all` | Yes | Get all projects for the logged-in user |
| GET | `/projects/get-project/:projectId` | Yes | Get a project with populated users |
| PUT | `/projects/add-user` | Yes | Add users. Body: `{ projectId, users: [userId] }` |
| PUT | `/projects/remove-user` | Yes | Remove a user. Body: `{ projectId, userId }` |
| PUT | `/projects/update-file-tree` | Yes | Update file tree. Body: `{ projectId, fileTree }` |
| PUT | `/projects/update-document` | Yes | Update document. Body: `{ projectId, documentContent }` |
| GET | `/projects/get-whiteboard/:projectId` | Yes | Get whiteboard state |
| PUT | `/projects/update-whiteboard` | Yes | Update whiteboard. Body: `{ projectId, state }` |
| PUT | `/projects/update-memory` | Yes | Manually update memory. Body: `{ projectId, memory }` |
| POST | `/projects/generate-memory` | Yes | AI-generate memory. Body: `{ projectId }` |
| POST | `/projects/suggest-memory` | Yes | AI-suggest memory patch. Body: `{ projectId, eventType, content }` |

### 6.3 AI Routes — `/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/ai/get-result` | Yes | Generate AI response. Query: `?prompt=...` |

---

## 7. Real-Time Socket Events

Socket connections require:
- `auth.token` — valid JWT.
- `query.projectId` — valid MongoDB ObjectId of a project the user is a member of.

All events are scoped to the socket's project room.

### 7.1 Client → Server

| Event | Payload | Description |
|---|---|---|
| `project-message` | `{ message, sender }` | Send a chat message. If message contains `@ai`, triggers AI response |
| `whiteboard:draw` | `{ object, projectId }` | Broadcast a single draw operation |
| `whiteboard:cursor` | `{ x, y, projectId }` | Broadcast cursor position |
| `whiteboard:sync` | `{ state, projectId }` | Broadcast + persist full whiteboard state |
| `whiteboard:clear` | `{ projectId }` | Clear and persist whiteboard |
| `file-tree:sync` | `{ fileTree, projectId }` | Broadcast + persist file tree |
| `document:sync` | `{ documentContent, projectId }` | Broadcast + persist document content |

### 7.2 Server → Client

| Event | Payload | Description |
|---|---|---|
| `project-message` | `{ message, sender }` | Incoming chat or AI message |
| `whiteboard:draw` | `{ object, userId, email }` | Draw operation from another user |
| `whiteboard:cursor` | `{ userId, email, x, y }` | Cursor position from another user |
| `whiteboard:sync` | `{ state, userId, email }` | Full whiteboard state from another user |
| `whiteboard:clear` | `{ userId, email }` | Whiteboard cleared by another user |
| `file-tree:sync` | `{ fileTree, userId, email }` | File tree from another user |
| `document:sync` | `{ documentContent, userId, email }` | Document content from another user |

---

## 8. AI System

### 8.1 Model

- Default model: `gemini-2.5-flash`
- Configurable via `GOOGLE_AI_MODEL` environment variable.
- Response MIME type: `application/json`
- Temperature: `0.4` (deterministic, code-focused)

### 8.2 System Prompt

The AI is instructed to:
- Act as a 10-year MERN expert.
- Write modular, commented, scalable code.
- Handle edge cases and errors.
- Always return a **single valid JSON object** (no markdown wrappers).
- Structure file tree entries as `{ file: { contents: "..." } }` or `{ directory: { ... } }`.
- Include `buildCommand` and `startCommand` in every code response.

### 8.3 AI Functions

| Function | Description |
|---|---|
| `generateResult(prompt)` | Core function — sends prompt, returns raw JSON string |
| `generateResultWithProjectMemory({ prompt, projectMemory, fileTree })` | Prepends project memory and file summary before the user prompt |
| `generateProjectMemory({ projectName, existingMemory, fileTree })` | Generates a fresh memory object from project state |
| `generateMemorySuggestion({ projectName, existingMemory, fileTree, eventType, content })` | Analyses an event and returns `{ shouldSuggest, reason, memory }` |

---

## 9. Frontend — Screens & Components

### 9.1 Screens

| File | Route | Auth Required | Description |
|---|---|---|---|
| `Landing.jsx` | `/` | No | Public marketing / landing page |
| `Login.jsx` | `/login` | No | Email + password login form |
| `Register.jsx` | `/register` | No | Account creation form |
| `Home.jsx` | `/home` | Yes | Lists user's projects, create new project |
| `Project.jsx` | `/project/:projectId` | Yes | Full collaborative workspace |

### 9.2 Project Screen Panels

The `Project.jsx` screen is the core workspace, divided into panels:

- **Left Sidebar** — Collaborators list, add collaborator modal, project memory viewer/editor.
- **Chat Panel** — Live chat with all project members. AI messages are styled differently and render Markdown with syntax highlighting.
- **File Explorer** — Tree view of project files; supports creating and navigating files.
- **Editor Tabs** — Open files as tabs with editable content areas.
- **WebContainer Output** — Shows `npm install` and app start output; renders the running app in an iframe.
- **Whiteboard Panel** — Collaborative canvas with toolbar, properties panel, undo/redo, and zoom controls.
- **Document Panel** — Shared plain-text/Markdown document editor.

### 9.3 Shared Components

| Component | Description |
|---|---|
| `DeploymentDoctor.jsx` | Analyses WebContainer errors and suggests fixes |
| `LoadingExperience.jsx` | Animated loading screen shown during container boot |
| `ThemeToggle.jsx` | Light/dark mode toggle button |

### 9.4 Whiteboard Components

| Component | Description |
|---|---|
| `Whiteboard.jsx` | Root whiteboard component, manages state and socket events |
| `Canvas.jsx` | Renders all shapes and freehand strokes using roughjs and perfect-freehand |
| `Toolbar.jsx` | Tool selector (select, pencil, line, rect, circle, text) |
| `PropertiesPanel.jsx` | Stroke color, fill color, stroke width, roughness controls |
| `UndoRedo.jsx` | Undo and redo buttons |
| `ZoomControls.jsx` | Zoom in, zoom out, reset zoom buttons |

### 9.5 Landing Page Components

`LandingNav`, `LandingHero`, `LandingFeatures`, `LandingHowItWorks`, `LandingAbout`, `LandingTechStack`, `LandingCTA`, `LandingFooter`, `ThemeToggle`

### 9.6 Configuration Modules

| File | Description |
|---|---|
| `config/axios.js` | Axios instance with base URL and JWT Authorization header injected from localStorage |
| `config/socket.js` | Creates and exports the Socket.IO client connection |
| `config/webContainer.js` | Initialises and exports the WebContainer instance (singleton) |

### 9.7 Auth Guard

`auth/UserAuth.jsx` — Wraps protected routes. If no token is in localStorage, redirects to `/login`.

### 9.8 Context

`context/user.context.jsx` — React context that stores and provides the currently authenticated user object globally.

### 9.9 State Management

`store/whiteboardStore.js` — Zustand store managing whiteboard elements, history (undo/redo stack), selected element, active tool, zoom, and pan offset.

---

## 10. State Management

| Layer | Technology | Scope |
|---|---|---|
| Authenticated user | React Context | Global (all screens) |
| Whiteboard canvas state | Zustand | Project screen whiteboard panel |
| Chat messages | Local `useState` in `Project.jsx` | Project screen |
| File tree, open files, editor content | Local `useState` in `Project.jsx` | Project screen |
| WebContainer instance | Module singleton | Frontend app lifetime |

---

## 11. Environment Variables

### Backend (`.env` in `backend/`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | Full MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing/verifying JWTs |
| `GOOGLE_AI_KEY` | Yes | Google Generative AI API key |
| `REDIS_URI` | Yes | Redis connection URL for token blacklist |
| `PORT` | No | HTTP server port (default: 3000) |
| `GOOGLE_AI_MODEL` | No | Gemini model name (default: `gemini-2.5-flash`) |
| `NODE_ENV` | No | `production` enables combined HTTP logging |
| `ALLOWED_ORIGINS` | No | Comma-separated list of allowed CORS origins |

### Frontend (`.env` in `frontend/`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend base URL used by Axios and Socket.IO client |

---

## 12. Project Structure

```
SOEN/
├── backend/
│   ├── app.js                    # Express app setup, middleware, route mounting
│   ├── server.js                 # HTTP server, Socket.IO setup, all socket event handlers
│   ├── vercel.json               # Vercel deployment config
│   ├── config/
│   │   └── cors.js               # Allowed origins logic
│   ├── db/
│   │   └── db.js                 # MongoDB connection via Mongoose
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification + Redis blacklist check
│   ├── models/
│   │   ├── user.model.js         # User schema with JWT and bcrypt helpers
│   │   └── project.model.js      # Project schema (fileTree, whiteboard, memory, document)
│   ├── controllers/
│   │   ├── user.controller.js    # Register, login, profile, logout, list users
│   │   ├── project.controller.js # All project CRUD + memory + whiteboard endpoints
│   │   └── ai.controller.js      # GET /ai/get-result handler
│   ├── routes/
│   │   ├── user.routes.js        # /users route definitions
│   │   ├── project.routes.js     # /projects route definitions with validators
│   │   └── ai.routes.js          # /ai route definitions
│   └── services/
│       ├── user.service.js       # User DB operations
│       ├── project.service.js    # Project DB operations + memory normalisation
│       ├── ai.service.js         # Gemini AI functions
│       └── redis.service.js      # Redis client + token blacklist helpers
│
└── frontend/
    ├── index.html                # Vite HTML entry point
    ├── vite.config.js            # Vite + React + Tailwind plugin config
    ├── vercel.json               # Vercel SPA routing config
    └── src/
        ├── main.jsx              # React app root, Router wrapper
        ├── App.jsx               # App component
        ├── index.css             # Global styles and Tailwind base
        ├── routes/
        │   └── AppRoutes.jsx     # Route definitions, UserAuth guard applied
        ├── auth/
        │   └── UserAuth.jsx      # Auth guard HOC
        ├── context/
        │   └── user.context.jsx  # User context provider
        ├── config/
        │   ├── axios.js          # Configured Axios instance
        │   ├── socket.js         # Socket.IO client factory
        │   └── webContainer.js   # WebContainer singleton init
        ├── store/
        │   └── whiteboardStore.js # Zustand whiteboard state
        ├── services/
        │   └── whiteboard.service.js # Whiteboard API calls
        ├── screens/
        │   ├── Landing.jsx       # Public landing page
        │   ├── Login.jsx         # Login screen
        │   ├── Register.jsx      # Registration screen
        │   ├── Home.jsx          # Project list + create project
        │   └── Project.jsx       # Main collaborative workspace
        └── components/
            ├── DeploymentDoctor.jsx
            ├── LoadingExperience.jsx
            ├── ThemeToggle.jsx
            ├── landing/
            │   ├── LandingNav.jsx
            │   ├── LandingHero.jsx
            │   ├── LandingFeatures.jsx
            │   ├── LandingHowItWorks.jsx
            │   ├── LandingAbout.jsx
            │   ├── LandingTechStack.jsx
            │   ├── LandingCTA.jsx
            │   ├── LandingFooter.jsx
            │   └── ThemeToggle.jsx
            └── whiteboard/
                ├── Whiteboard.jsx
                ├── Canvas.jsx
                ├── Toolbar.jsx
                ├── Toolbar.module.css
                ├── PropertiesPanel.jsx
                ├── PropertiesPanel.module.css
                ├── UndoRedo.jsx
                ├── UndoRedo.module.css
                ├── ZoomControls.jsx
                ├── ZoomControls.module.css
                └── hooks/
```

---

## 13. Local Setup

### Prerequisites

- Node.js (LTS)
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud, e.g. Upstash)
- Google Generative AI API key

### Steps

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd SOEN
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure backend environment**

   Create `backend/.env`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/soen
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_AI_KEY=your_google_ai_key_here
   REDIS_URI=redis://localhost:6379
   PORT=3000
   ```

4. **Start the backend**

   ```bash
   node server.js
   ```

5. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

6. **Configure frontend environment**

   Create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

7. **Start the frontend**

   ```bash
   npm run dev
   ```

8. Open `http://localhost:5173` in your browser.

> **Note:** WebContainer requires a browser that supports `SharedArrayBuffer`. Ensure the dev server sets the required COOP/COEP headers. Vite's dev server does this automatically with the correct plugin configuration.

---

## 14. Deployment

Both the backend and frontend include `vercel.json` for Vercel deployment.

- **Backend `vercel.json`** — Configures the Express server as a serverless function entry point.
- **Frontend `vercel.json`** — Configures SPA routing so all paths fall back to `index.html`.

Set all environment variables from [Section 11](#11-environment-variables) in the Vercel project settings before deploying.

---

## 15. Known Limitations & Future Scope

### Current Limitations

- Authentication is email/password only; no OAuth providers.
- No persistent chat history; messages are not stored in the database — they exist only in the Socket.IO room for the duration of a session.
- WebContainer only works in Chromium-based browsers due to `SharedArrayBuffer` requirements.
- The project owner and collaborators have equal permissions; no role-based access control (RBAC) exists.
- The AI file tree is applied to the WebContainer in full on each generation; incremental patching is not implemented.

### Future Scope

- Persistent chat message history stored in MongoDB.
- Role-based permissions (owner, editor, viewer).
- OAuth login (Google, GitHub).
- Multiple AI provider support (OpenAI, Anthropic).
- Real-time collaborative code editing with operational transformation or CRDTs.
- Export whiteboard as PNG/SVG.
- Project branching (snapshot and restore project state).
- Notifications for project activity.
- Mobile-responsive layout for the workspace.