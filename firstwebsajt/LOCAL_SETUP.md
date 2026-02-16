# TrixieVerse Local Setup & Development Guide

## Project Overview

**TrixieVerse** is a comprehensive Wild Rift coaching platform built with modern web technologies. It features an AI-powered coach personality system, match analysis, skill profiling, and community features.

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React 19 + Tailwind CSS 4 | Latest |
| **Backend** | Express.js + tRPC | 4.21.2 / 11.6.0 |
| **Database** | MySQL/TiDB (via Drizzle ORM) | 3.15.0 |
| **Build Tool** | Vite | 7.1.7 |
| **Package Manager** | pnpm | 10.4.1 |
| **Language** | TypeScript | 5.9.3 |

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v22.13.0 or higher
- **pnpm**: v10.4.1 (or run `npm install -g pnpm`)
- **MySQL/TiDB**: A running database instance (local or remote)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TR1XONE/Trixieverse.git
cd Trixieverse
```

### 2. Install Dependencies

```bash
pnpm install
```

This command installs all project dependencies as defined in `package.json`. The installation process respects the pinned versions in `pnpm-lock.yaml` for reproducibility.

### 3. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/trixieverse"

# Application
NODE_ENV="development"
PORT=3000

# OAuth (if using Manus OAuth)
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"

# JWT Secret (for session management)
JWT_SECRET="your-secret-key-min-32-chars"

# Optional: API Keys for integrations
VITE_FRONTEND_FORGE_API_KEY="your-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
```

### 4. Database Setup

Initialize the database schema using Drizzle ORM:

```bash
pnpm run db:push
```

This command generates migrations and applies them to your database.

## Development Workflow

### Start Development Server

```bash
pnpm run dev
```

This starts the development server with hot module replacement (HMR) enabled. The server watches for changes in `server/_core/index.ts` and automatically restarts.

**Access the application**: Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm run build
```

This command performs two steps:

1. **Vite Build**: Compiles the React frontend to optimized static assets in `dist/public/`
2. **esbuild**: Bundles the Express server code to `dist/index.js`

### Start Production Server

After building, start the production server:

```bash
pnpm run start
```

This runs the compiled server with `NODE_ENV=production`.

### Type Checking

Verify TypeScript types without building:

```bash
pnpm run check
```

### Code Formatting

Format all code using Prettier:

```bash
pnpm run format
```

### Run Tests

Execute the test suite using Vitest:

```bash
pnpm run test
```

## Project Structure

```
trixieverse/
├── client/                    # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   ├── App.tsx          # Main application component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   └── index.html           # HTML template
├── server/                    # Express backend
│   ├── _core/               # Core server infrastructure
│   │   ├── index.ts         # Server entry point
│   │   ├── context.ts       # tRPC context
│   │   ├── oauth.ts         # OAuth integration
│   │   ├── vite.ts          # Vite integration
│   │   ├── llm.ts           # LLM integration
│   │   ├── map.ts           # Maps integration
│   │   └── ...              # Other core modules
│   ├── routers.ts           # tRPC procedure definitions
│   ├── db.ts                # Database query helpers
│   ├── storage.ts           # S3 storage helpers
│   └── auth.logout.test.ts  # Example test
├── drizzle/                  # Database schema & migrations
│   ├── schema.ts            # Table definitions
│   └── migrations/          # Migration files
├── shared/                   # Shared types and constants
├── package.json             # Project metadata & dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── drizzle.config.ts        # Drizzle ORM configuration
└── README.md                # Project documentation
```

## Key Features

### Frontend Architecture

The frontend uses a **tRPC-first approach** where all backend communication flows through type-safe RPC procedures. React components consume data via `trpc.*.useQuery()` and `trpc.*.useMutation()` hooks, eliminating the need for manual REST API management.

**Key Components:**
- **DashboardLayout**: Pre-built sidebar navigation for internal tools
- **AIChatBox**: Full-featured chat interface with streaming support
- **Map Component**: Google Maps integration with proxy authentication
- **shadcn/ui**: Comprehensive component library for consistent UI

### Backend Architecture

The backend is structured around **tRPC procedures** that handle all business logic. Procedures are organized by feature and can be either `publicProcedure` (unauthenticated) or `protectedProcedure` (authenticated).

**Key Modules:**
- **OAuth Integration**: Automatic session management via Manus OAuth
- **Database Layer**: Drizzle ORM for type-safe database queries
- **LLM Integration**: Built-in helpers for AI/LLM functionality
- **File Storage**: S3 integration for file uploads
- **Maps API**: Full Google Maps feature access

### Database Schema

The application uses Drizzle ORM with MySQL/TiDB as the primary database. The schema includes tables for users, player accounts, coach personalities, matches, achievements, and more.

**Key Tables:**
- `users`: User authentication and profiles
- `player_accounts`: Wild Rift player account linking
- `coach_personalities`: AI coach customization settings
- `coach_memories`: Persistent memory system for the coach
- `matches`: Match analysis and statistics
- `achievements`: User achievements and badges
- `skill_profiles`: Player skill assessments

## Common Development Tasks

### Adding a New Feature

1. **Define Database Schema**: Update `drizzle/schema.ts` with new tables
2. **Create Migration**: Run `pnpm run db:push` to generate migration
3. **Add Query Helper**: Create helper function in `server/db.ts`
4. **Create tRPC Procedure**: Add procedure to `server/routers.ts`
5. **Build Frontend UI**: Create component in `client/src/pages/` or `client/src/components/`
6. **Connect UI to Backend**: Use `trpc.*.useQuery()` or `trpc.*.useMutation()` in component
7. **Write Tests**: Add test file in `server/*.test.ts`

### Debugging

**Frontend Debugging:**
- Use browser DevTools (F12) for React component inspection
- Check Network tab for tRPC API calls
- Use React DevTools browser extension

**Backend Debugging:**
- Check server logs in terminal running `pnpm run dev`
- Use `console.log()` or debugger statements
- Enable verbose logging by setting `DEBUG=*`

### Performance Optimization

The current build produces large chunks (1.5+ MB). Consider:
- **Code Splitting**: Use dynamic imports for large feature modules
- **Lazy Loading**: Implement route-based code splitting
- **Bundle Analysis**: Use `rollup-plugin-visualizer` to analyze bundle size

## Deployment Considerations

### Local to Production

The build process creates a single `dist/index.js` file that includes both frontend and backend code. This file can be deployed to any Node.js hosting platform.

**Build Output:**
- `dist/public/`: Static frontend assets
- `dist/index.js`: Compiled server with bundled dependencies

### Environment Variables for Production

When deploying, ensure these variables are set in your production environment:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<secure-random-string>
PORT=<port-number>
```

### Database Migrations

Before starting the production server, ensure migrations are applied:

```bash
pnpm run db:push
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, the server automatically tries ports 3001-3019. To specify a custom port:

```bash
PORT=8080 pnpm run dev
```

### Database Connection Error

Verify your `DATABASE_URL` is correct and the database server is running:

```bash
# Test connection
mysql -u user -p -h localhost -D trixieverse
```

### Build Failures

Clear cache and reinstall dependencies:

```bash
rm -rf node_modules pnpm-lock.yaml dist/
pnpm install
pnpm run build
```

### TypeScript Errors

Run type checking to identify issues:

```bash
pnpm run check
```

## Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **tRPC Documentation**: https://trpc.io/
- **React Documentation**: https://react.dev/
- **Drizzle ORM**: https://orm.drizzle.team/
- **Tailwind CSS**: https://tailwindcss.com/
- **Express.js**: https://expressjs.com/

## Support & Contributing

For issues, questions, or contributions, please visit the GitHub repository: https://github.com/TR1XONE/Trixieverse

---

**Last Updated**: February 2026  
**Maintained By**: Manus AI
