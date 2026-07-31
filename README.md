# sponnersWeb

## Struktur
- `backend/`  – Node.js / Express.js / PostgreSQL API
- `frontend/` – React.js / Bootstrap Frontend

## Setup
1. `cd backend && npm install`
2. `cd frontend && npm install`
3. Backend-`.env` und Frontend-`.env` befüllen
4. Datenbank-Schema einspielen: `psql -d deine_db -f backend/sql/schema.sql`
5. Backend starten: `cd backend && node server.js`
6. Frontend starten: `cd frontend && npm start`

## Root-Shortcuts (optional)
- `npm run frontend` startet das Frontend aus dem Projekt-Root
- `npm run frontend:build` erstellt den Frontend-Production-Build
- `npm run frontend:test` startet Frontend-Tests
- `npm run backend` startet das Backend aus dem Projekt-Root
- `npm run dev` startet Backend + Frontend parallel
