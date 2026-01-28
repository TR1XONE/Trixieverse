# TrixieVerse AI Agent Instructions

## Project Overview

**TrixieVerse** is a personified AI coaching platform for Wild Rift players. The system consists of:
- **Frontend (React 19)**: Gaming-themed UI with player dashboards, match analysis, meta library, and coach personality customization
- **Backend (Express.js)**: REST API with JWT auth, PostgreSQL database, WebSocket support, and AI coach system
- **Mobile (React Native/Expo)**: Companion app with match syncing and coach integration

## Architecture & Data Flow

### Core System Layers

1. **Frontend (src/)**
   - **Pages**: `/dashboard`, `/war-room` (match analyzer), `/library` (meta), `/coach` (personality), `/coachOS`
   - **Contexts**: Auth, Coach, Language, Theme provide state management (no Redux)
   - **Components**: Radix UI + shadcn/ui primitives, gaming-styled with Tailwind CSS 4 (OKLCH colors)
   - **Styling Patterns**: Dark navy background (#0a0e27), neon accents (cyan, purple, turquoise), glow effects, scanlines

2. **Backend (server/)**
   - **Entry**: `index.ts` initializes Express, Sentry (error tracking), WebSocket, middleware stack
   - **Middleware Stack** (ordered): Sentry → Security (helmet, CORS) → Body parser → Compression → Request logging
   - **Routes**: `/api/*` (apiRoutes), `/api/coach/*`, `/api/account/*`, `/api/admin/*`, `/api/matches/*` (sync)
   - **Services**: Modular business logic (auth, coach, gamification, notifications, email, etc.)
   - **Database**: PostgreSQL with connection pooling, migration system in `/database/migrations/`

3. **Real-time**: WebSocket server (port same as HTTP) broadcasts coach messages and achievements

### Critical Integration Points

**Auth Flow**: Login → JWT token (Bearer) → Request middleware validates → User context populated  
**Coach System**: User profile → Coach personality (name, tone, memories) → Match analysis → Personalized advice  
**Match Sync**: `POST /api/matches/sync` (Riot API) → Process data → Store in DB → Trigger coach analysis  
**Game Theming**: Dark navy + neon cyan/purple everywhere. No light mode. Monospace fonts (Space Mono, IBM Plex).

## Developer Workflows & Commands

### Development
```bash
pnpm dev              # Starts Vite dev server + backend (nodemon)
pnpm run build        # Vite frontend build to /dist
pnpm start            # NODE_ENV=production tsx server/index.ts
pnpm check            # tsc --noEmit (type check)
pnpm format           # prettier --write .
```

### Database
- Connection: PostgreSQL (Railway in production, local in dev)
- Migrations: Place in `/server/database/migrations/`, auto-run on init
- Connection pooling: 10 min, 30 max (see `connection.ts`)
- Schema: Users, player_accounts, matches, achievements, coach_memories, etc.

### Testing
- Location: `/server/tests/` (Jest setup exists but not heavily used)
- Run via npm in server dir
- No e2e tests; integration via manual API testing

## Project-Specific Patterns

### 1. Error Handling
- **Backend**: Try/catch with Sentry integration + logger.error({message, error, context})
- **Frontend**: ErrorBoundary component wraps app, caught errors show toast notification
- **Response Format**: `{ error: string, message?: string }` for failures, typed data for success

### 2. Authentication
- JWT tokens: Access (short-lived), Refresh (long-lived)  
- Auth middleware: Requires `Authorization: Bearer <token>` header
- Optional auth: `optionalAuth` middleware for public+logged-in views
- Extended type: `AuthRequest` (Express Request + user/userId fields)

### 3. Context Patterns (React)
```tsx
// All contexts follow this pattern:
export interface ContextType { /* data */ }
export const Context = createContext<ContextType | null>(null);
export function Provider({ children }) { /* logic */ }
export function useContext() { /* validation + return */ }

// Use: const { data } = useCoach() // Typed, hook enforces provider wrapper
```

### 4. Service Layer (Backend)
- Single instance per module: `export default new ServiceClass()`
- Database queries: Use `db.query(sql, params)` (parameterized)
- Logging: `logger.info({message, context})` for all major operations
- Error propagation: Throw with context, let route handler catch and respond

### 5. Database Queries
- Always parameterized: `db.query("SELECT * FROM users WHERE id = $1", [userId])`
- Return format: `{ rows: [...], rowCount: number }`
- Migration pattern: `/migrations/{number}_{name}.ts` exports `up(client)`, `down(client)`

### 6. Frontend Data Fetching
- Services in `/lib/` or context methods
- Axios configured with base URL + error interceptors
- Auth token auto-added via axios interceptors
- Loading/error states managed via context or React hooks

### 7. Component Structure
```tsx
// Typical component:
- Props interface with JSDoc
- Local state via useState/useContext
- Effects for side effects
- Render with proper accessibility (Radix UI handles ARIA)
- Export for lazy loading if needed
```

### 8. Styling Conventions
- **Tailwind CSS 4**: OKLCH color space, no custom CSS files (except theme)
- **Theme variables**: Defined in `/src/const.ts` or context
- **Gaming aesthetic**: Dark backgrounds, neon glows, no rounded corners, monospace for code
- **Responsive**: Mobile-first breakpoints (sm, md, lg, xl)

## File Organization Rules

**Frontend Structure**:
- `src/pages/` - Route-level components (Page.tsx)
- `src/components/` - Reusable UI pieces, folders per major feature
- `src/contexts/` - State management (Context.tsx, Provider pattern)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities, API clients, helpers
- `src/systems/` - Complex game-specific logic (coach system, gamification)
- `src/i18n/` - Translation files (Swedish + English)

**Backend Structure**:
- `server/index.ts` - Express app setup (no logic, just wiring)
- `server/routes/*.ts` - Route definitions, minimal logic (delegate to services)
- `server/services/*.ts` - Business logic, database queries, external API calls
- `server/middleware/*.ts` - Request/response pipelines
- `server/database/` - Connection pooling, migrations, schema
- `server/utils/` - Logging, Sentry, health checks, helpers
- `server/agents/` - AI coach logic (coachAgent.ts, coachReactions.ts)

## External Dependencies & Integration Points

### Key Libraries
- **Frontend**: React 19, Wouter (routing, not Next.js), Tailwind CSS 4, Radix UI, React Hook Form
- **Backend**: Express, PostgreSQL (pg), jsonwebtoken, nodemailer, Socket.io, Sentry, Helmet
- **AI**: OpenAI API (coach responses), Riot API (match data)

### Environment Variables (Critical)
```
# Auth
JWT_SECRET, JWT_REFRESH_SECRET

# Database  
DATABASE_URL (or DB_USER/DB_PASSWORD/DB_HOST/DB_NAME)

# External APIs
OPENAI_API_KEY, RIOT_API_KEY

# Services
SENTRY_DSN, SENDGRID_API_KEY (email)

# Platform
NODE_ENV, PORT, VITE_API_URL
```

### API Endpoints (Key Routes)
```
POST   /api/auth/login, /api/auth/signup
GET    /api/health, /api/health/quick
POST   /api/matches/sync
GET    /api/coach/response
POST   /api/coach/personality
GET    /api/achievements
```

## Common Workflows for AI Agents

### Adding a New Feature
1. **Database**: Create migration in `/server/database/migrations/`
2. **Backend**: Add route in `/server/routes/`, implement in service
3. **Frontend**: Add page in `/src/pages/`, integrate with context
4. **Test**: Verify endpoint with curl, check frontend integration

### Fixing Bugs
1. Check Sentry dashboard for error context (if production)
2. Run `pnpm check` to validate TypeScript
3. Search codebase for symbol using grep (prefer grep_search tool)
4. Update affected files, ensure auth middleware is applied if needed

### Performance Optimization
- Database: Check indexes in `/database/schema.sql`, add for frequently queried columns
- Frontend: Use React.lazy() for pages, optimize images, profile with DevTools
- Backend: Enable compression (already done), check cache middleware, monitor response times

## Critical "Do Not" Patterns

- ❌ Don't use Redux/Zustand; use React Context (existing pattern)
- ❌ Don't write CSS files; use Tailwind classes (except theme overrides)
- ❌ Don't bypass auth middleware; use verifyToken or optionalAuth
- ❌ Don't fetch in routes; delegate to services
- ❌ Don't hardcode API URLs; use .env variables
- ❌ Don't ignore TypeScript errors; use `pnpm check` before commits
- ❌ Don't modify database directly; use migrations
- ❌ Don't forget error handling in async operations

## Debugging Tips

**Frontend**:
- Check browser DevTools Network tab for API responses
- Look at React DevTools for context state
- Enable dark theme (default) in theme context
- Test with different languages via useLanguage hook

**Backend**:
- Check `/logs/` directory for request logs
- Run `pnpm check` to catch type errors early
- Use `logger.info()` to trace execution
- Test endpoints with curl or Postman, include auth header

**Database**:
- Connection issues: Check DATABASE_URL parsing in connection.ts
- Query errors: Verify parameterized query syntax ($1, $2, ...)
- Schema issues: Ensure migrations ran via `npm run migrate`

## Key Files to Understand First

1. `server/index.ts` - How everything wires together
2. `src/App.tsx` - Route structure and context providers
3. `src/contexts/AuthContext.tsx` - Auth state management
4. `src/contexts/CoachContext.tsx` - Coach system and match analysis
5. `server/services/authService.ts` - JWT handling
6. `server/database/schema.sql` - Database structure
7. `server/middleware/authMiddleware.ts` - Request validation
