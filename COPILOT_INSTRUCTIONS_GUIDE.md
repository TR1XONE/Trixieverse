# Copilot Instructions Created ✅

Generated comprehensive AI agent instructions at `.github/copilot-instructions.md`

## What's Included

### 1. **Architecture Overview** (How It All Fits Together)
- Three-layer system: Frontend (React 19), Backend (Express), Mobile (React Native)
- Data flow: Auth → Context state → Services → Database
- Real-time layer: WebSocket for coach messages and achievements
- Gaming aesthetic: Dark navy + neon, no light mode, monospace fonts

### 2. **Critical Integration Points**
- JWT-based auth middleware pattern
- Coach system: personality + memories + personalized analysis
- Match sync pipeline: Riot API → Processing → Storage → Coach response
- Theme consistency: OKLCH colors, Tailwind CSS 4, Radix UI

### 3. **Developer Workflows**
- **Commands**: `pnpm dev`, `pnpm build`, `pnpm check` (type validation)
- **Database**: PostgreSQL with migrations, connection pooling
- **Testing**: Jest available, mostly integration testing via API

### 4. **Project-Specific Patterns**
- Error handling: Sentry + logger.error({message, error, context})
- Auth: Bearer tokens, AuthRequest interface, optional vs required auth
- Context patterns: Typed contexts with provider + hook
- Services: Single instance, parameterized queries, error propagation
- Styling: Tailwind only, no custom CSS except theme

### 5. **File Organization**
- Frontend: `pages/`, `components/`, `contexts/`, `hooks/`, `lib/`, `systems/`
- Backend: `routes/`, `services/`, `middleware/`, `database/`, `utils/`, `agents/`
- Clear separation: Routes delegate to services, services own database logic

### 6. **External Dependencies**
- APIs: OpenAI (coach), Riot API (matches)
- Libraries: Wouter (routing), Socket.io (WebSocket), Sentry (monitoring)
- Key env vars: JWT_SECRET, DATABASE_URL, OPENAI_API_KEY, RIOT_API_KEY

### 7. **Common Workflows**
- Adding features: Database → Backend → Frontend integration
- Debugging: Sentry dashboard, browser DevTools, logs directory
- Performance: Database indexes, React.lazy(), compression

### 8. **Critical "Do Nots"**
- No Redux/Zustand (use Context)
- No custom CSS (use Tailwind)
- No bypassing auth middleware
- No hardcoded URLs (use .env)
- No direct database queries (use migrations)

---

## How to Use This Document

**For AI agents to immediately be productive:**
1. Read "Architecture Overview" first (5 min)
2. Understand the Context pattern from "Project-Specific Patterns" (5 min)
3. Reference "File Organization Rules" when adding new files
4. Check "Common Workflows" before starting tasks

**When stuck or unsure:**
- "Critical Integration Points" explains the "why" behind decisions
- "Key Files to Understand First" points to learning resources
- "Debugging Tips" helps diagnose issues

---

## Next Steps

Would you like me to clarify or expand any sections? For example:
- **CoachOS System**: The complex AI coach personality + memory system (if agents need to modify it)
- **Database Schema**: Detailed entity relationships (if agents need to add tables)
- **API Response Formats**: Standardized response envelopes (if agents building new endpoints)
- **Testing Strategy**: How to validate changes (if agents need to write tests)
- **Deployment Process**: CI/CD and production considerations (if agents handle deployments)
