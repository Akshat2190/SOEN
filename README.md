# SOEN

SOEN is a MERN-style collaborative coding workspace with authentication, project management, real-time chat, AI-assisted responses, and a browser-based code editing experience.

## What It Does

- User authentication with register, login, profile, and logout flows.
- JWT-based session handling with Redis used to blacklist logged-out tokens.
- Project creation and collaboration management.
- Real-time project chat with Socket.IO.
- AI replies when a message includes `@ai`.
- In-browser file tree, editor tabs, and live content editing using WebContainer support on the frontend.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Redis, Socket.IO.
- AI: Google Generative AI / Gemini.
- Frontend: React, Vite, React Router, Axios, Socket.IO client, Tailwind CSS, Highlight.js, Markdown rendering.

## Backend Overview

The backend lives in the `backend/` folder and is responsible for authentication, project APIs, database access, AI generation, and socket messaging.

- `server.js` starts the HTTP server, attaches Socket.IO, validates socket connections, and handles project chat events.
- `app.js` wires Express middleware and mounts the route groups.
- `db/db.js` connects to MongoDB.
- `middleware/auth.middleware.js` protects routes by verifying JWTs and checking Redis for logged-out tokens.

### Main API Areas

- `/users`
  - `POST /register` creates a new user.
  - `POST /login` authenticates an existing user.
  - `GET /profile` returns the current user.
  - `GET /logout` blacklists the token.
  - `GET /all` returns all users except the current one.

- `/projects`
  - `POST /create` creates a project for the logged-in user.
  - `GET /all` returns the projects the user belongs to.
  - `GET /get-project/:projectId` returns a project with populated collaborators.
  - `PUT /add-user` adds collaborators to a project.

- `/ai`
  - `GET /get-result?prompt=...` generates an AI response from the prompt.

### Real-Time Behavior

When a user joins a project, the backend validates the JWT and project ID, then places the socket in a project room. Messages are broadcast to the room, and if a message contains `@ai`, the server sends the prompt to Gemini and broadcasts the AI response back into the same room.

## Frontend Overview

The frontend lives in `frontend/` and provides the user interface for auth, project browsing, and the collaborative editor/chat screen.

- `src/routes/AppRoutes.jsx` defines the app routes.
- `src/auth/UserAuth.jsx` guards authenticated pages.
- `src/context/user.context.jsx` stores the active user in React context.
- `src/config/axios.js` configures API requests with the stored token.
- `src/config/socket.js` creates the Socket.IO client connection.
- `src/config/webContainer.js` initializes the browser-based container used for code workspace features.

### Screens

- `Login.jsx` logs a user in and stores the token.
- `Register.jsx` creates a new account and stores the token.
- `Home.jsx` lists the user’s projects and lets them create a new one.
- `Project.jsx` is the collaborative workspace.

### Project Screen Features

- Shows project collaborators in a side panel.
- Lets the user add collaborators to the project.
- Provides a live chat panel connected through Socket.IO.
- Supports AI messages triggered by `@ai`.
- Renders AI code responses with Markdown and syntax highlighting.
- Displays a file explorer and editor tabs for project files.
- Uses WebContainer support to back the in-browser coding experience.

## Environment Variables

Backend:

- `MONGODB_URI` - MongoDB connection string.
- `JWT_SECRET` - secret used to sign and verify tokens.
- `GOOGLE_AI_KEY` - Google Generative AI key.
- `PORT` - backend port, optional.

Frontend:

- `VITE_API_URL` - backend base URL used by Axios and Socket.IO.

## Run Locally

1. Install dependencies in both folders.

   ```bash
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

2. Create the required environment variables.

3. Start the backend.

   ```bash
   cd backend
   node server.js
   ```

4. Start the frontend.

   ```bash
   cd frontend
   npm run dev
   ```

## Project Structure

```text
SOEN/
  backend/
    app.js
    server.js
    controllers/
    db/
    middleware/
    models/
    routes/
    services/
  frontend/
    src/
      auth/
      config/
      context/
      routes/
      screens/
```

## Notes

- The app currently focuses on collaboration inside a project room rather than standalone file deployment.
- AI support is driven by chat messages that include `@ai`.
- Auth-protected routes depend on the token stored in local storage.