# GitHub Copilot Instructions for Trixieverse Project

This document provides a comprehensive overview of the Trixieverse project, its technical stack, current status, and prioritized development tasks. It is intended to guide AI agents like GitHub Copilot in assisting with code generation and problem-solving within this repository.

## 1. Project Overview
Trixieverse is a fullstack web and mobile application designed to provide a personalized coaching experience for Wild Rift players. It features AI-driven coach personalities, gamification elements (achievements, streaks, XP), match analysis, and social features.

## 2. Technical Stack

### Frontend
*   **Framework:** React (via Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Radix UI
*   **Routing:** wouter
*   **Mobile Packaging:** Capacitor (for Android .apk generation)

### Backend
*   **Runtime:** Node.js (running with `tsx` for direct TypeScript execution)
*   **Framework:** Express
*   **Language:** TypeScript
*   **Database ORM/Client:** `pg` (PostgreSQL client)
*   **Authentication:** `bcryptjs` (password hashing), `jsonwebtoken` (JWTs)
*   **AI Integration:** OpenAI API
*   **Realtime:** Socket.IO
*   **Deployment:** Railway (configured for automatic database migration and SSL)

### Database
*   **Type:** PostgreSQL
*   **Schema:** Defined in `server/database/schema.sql` (includes tables for users, player accounts, matches, achievements, coach memories, skill profiles, etc.)
*   **Initialization:** `server/database/initDb.ts` handles automatic table creation on server startup.

### AI (Coach Agent)
*   **Core Logic:** `server/agents/coachAgent.ts` defines coach personalities (Sage, Blaze, Echo, Nova) and their response generation logic.
*   **Memory:** `CoachMemory` interface for tracking player data, but full database integration is pending.

## 3. Current Status & Implemented Features
*   **Core Structure:** Fullstack project with separate `src` (frontend) and `server` (backend) directories.
*   **Authentication:** User registration, login, and session management.
*   **Coach Personalization:** Frontend UI for selecting coach personality, accent, and response style.
*   **Gamification:** Basic `AchievementSystem` and `StreakAndXP` components are present.
*   **Match Tracking:** Backend endpoints for `matches` and `userStats` are defined.
*   **Mobile Build:** Capacitor is integrated, and a GitHub Actions workflow (`.github/workflows/build-apk.yml`) is set up for automatic Android APK generation (requires correct file naming on GitHub).
*   **Deployment Stability:** Backend is configured for stable deployment on Railway, including automatic database setup.

## 4. Prioritized Development Tasks for Copilot

### Task 1: Fix GitHub Actions Workflow Filename
*   **Context:** The `.github/workflows/build-apk.ym` file is currently named incorrectly, preventing the Android APK build from running.
*   **Action for User:** User needs to rename `build-apk.ym` to `build-apk.yml` directly on GitHub.
*   **Copilot Role:** N/A (manual user action).

### Task 2: Integrate AI Coach with Real Match Data
*   **Context:** The `CoachAgent` in `server/agents/coachAgent.ts` generates responses based on predefined templates. It needs to use actual match analysis data from `server/services/matchAnalysisService.ts` or `server/services/userStatsService.ts`.
*   **Goal:** Modify `CoachAgent.ts` to dynamically generate personalized feedback based on `matchData` passed from the frontend (e.g., `kda`, `cs`, `result`, `mistakes`).
*   **Files to Modify:**
    *   `server/agents/coachAgent.ts` (specifically `generateMatchAnalysis`, `generateWinAnalysis`, `generateLossAnalysis` methods).
    *   `server/services/matchAnalysisService.ts` (ensure it provides detailed analysis data).
    *   `server/routes/coachRoutes.ts` (ensure `matchData` is passed to the coach agent).

### Task 3: Implement 
### Task 3: Implement Coach Memory in Database
*   **Context:** The `CoachMemory` interface exists in `server/agents/coachAgent.ts` and `src/contexts/CoachContext.tsx`, but the actual persistence of this memory to the `coach_memories` table in the database is not fully implemented.
*   **Goal:** Implement backend logic to save and retrieve coach memory data (e.g., `recentMatches`, `milestones`, `coachingNotes`) to/from the PostgreSQL database.
*   **Files to Modify:**
    *   `server/services/coachLearningService.ts` (create or update methods for CRUD operations on `coach_memories`).
    *   `server/routes/coachRoutes.ts` (add endpoints to interact with coach memory).
    *   `server/agents/coachAgent.ts` (update `updateMemory` method to interact with the database service).
    *   `src/contexts/CoachContext.tsx` (update `updateCoachMemory` to call backend API).

### Task 4: Frontend Routing Cleanup
*   **Context:** The project currently has mixed routing implementations (e.g., `wouter` is used, but `react-router-dom` might have residual code or be referenced in older parts).
*   **Goal:** Standardize on `wouter` for all frontend routing and remove any unused or conflicting routing logic/dependencies.
*   **Files to Modify:**
    *   Review `src/App.tsx` and all `src/pages/*.tsx` files to ensure consistent `wouter` usage.
    *   Check `package.json` for `react-router-dom` and remove if not explicitly needed.

## 5. How to Use This File with GitHub Copilot

1.  **Open in VS Code:** Open your `TR1XONE/Trixieverse` project in Visual Studio Code.
2.  **Open this file:** Keep `.github/COPILOT_INSTRUCTIONS.md` open in a tab.
3.  **Context for Copilot:** When working on a specific task (e.g., Task 2: Integrate AI Coach with Real Match Data), open the relevant files mentioned in that task (e.g., `server/agents/coachAgent.ts`).
4.  **Prompting Copilot:** Use comments in your code or the Copilot Chat interface to reference this document. For example:
    ```typescript
    // Copilot: Based on COPILOT_INSTRUCTIONS.md Task 2, modify this function to use real matchData.
    private generateMatchAnalysis(matchData: any): string {
      // ... your code here ...
    }
    ```
    Or in Copilot Chat, you can say: "@workspace Implement Task 3 from COPILOT_INSTRUCTIONS.md in `server/services/coachLearningService.ts`."

This document will provide Copilot with the necessary context to generate more accurate and relevant code suggestions, aligning with the project's overall goals and architecture.
