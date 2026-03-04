---
description: Start Trixieverse (main black UI) — launches Docker DB, backend, and frontend
---

// turbo-all

1. Start the PostgreSQL and Redis containers via Docker (required for the backend/database):
```
docker compose up -d postgres redis
```
Run this in `d:\stuff\gittan\Trixieverse`. Wait for it to complete (WaitMsBeforeAsync: 6000). Docker Desktop must already be running before this step.

2. Start the backend server (runs on port 3002):
```
npm run start
```
Run this in `d:\stuff\gittan\Trixieverse`. Run as a background command (WaitMsBeforeAsync: 5000).

3. Start the frontend dev server (runs on port 5173):
```
npm run dev
```
Run this in `d:\stuff\gittan\Trixieverse`. Run as a background command (WaitMsBeforeAsync: 7000).

4. Confirm both servers are running by checking command status. Report these URLs to the user:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3002
- Health check: http://localhost:3002/api/health
