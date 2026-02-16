# TrixieVerse - First Website (firstwebsajt)

This folder contains the complete TrixieVerse presentation website and application codebase, created during the initial development phase.

## 📁 Folder Structure

```
firstwebsajt/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components (Home, NotFound, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utility libraries (tRPC client, etc.)
│   │   ├── App.tsx        # Main app routing
│   │   └── index.css      # Global styles with Tailwind
│   └── public/            # Static assets
├── server/                 # Express.js backend
│   ├── routers.ts         # tRPC API procedures
│   ├── db.ts              # Database configuration
│   ├── index.ts           # Server entry point
│   └── _core/             # Core server infrastructure
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Drizzle ORM schema definitions
├── dist/                  # Production build output
├── public/                # Public assets
├── package.json           # Project dependencies
├── vite.config.ts         # Vite build configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # Project overview
├── LOCAL_SETUP.md         # Local development guide
├── DEPLOYMENT.md          # Deployment instructions
└── todo.md                # Project status and tasks
```

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database and API credentials

# Initialize database
pnpm run db:push

# Start development server
pnpm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build both frontend and backend
pnpm run build

# Start production server
pnpm start
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `client/src/pages/Home.tsx` | Landing page with Wild Rift-inspired design |
| `server/routers.ts` | tRPC API endpoints for auth, coaching, matches |
| `drizzle/schema.ts` | Database tables for users, coaches, matches, etc. |
| `package.json` | All dependencies and build scripts |

## 🎮 Features Implemented

- **Wild Rift-Inspired Design**: Dark theme with cyan/blue gradients
- **Hero Section**: Compelling headline with call-to-action
- **Feature Cards**: 6 showcase cards for key features
- **How It Works**: 4-step process explanation
- **Responsive Design**: Mobile-first, works on all devices
- **tRPC Integration**: Type-safe API communication
- **Authentication**: Manus OAuth integration
- **Database**: MySQL/TiDB with Drizzle ORM

## 📖 Documentation

- **README.md** - Project overview and architecture
- **LOCAL_SETUP.md** - Detailed local development guide
- **DEPLOYMENT.md** - Deployment options (Railway, Vercel, Render, Docker)
- **todo.md** - Project status and completed features

## 🔧 Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express.js, tRPC 11, Node.js
- **Database**: MySQL/TiDB, Drizzle ORM
- **Build**: Vite, esbuild
- **Testing**: Vitest
- **UI Components**: shadcn/ui, Radix UI

## 🌐 Deployment

Choose your preferred deployment platform:

1. **Railway** (Recommended) - See DEPLOYMENT.md
2. **Vercel** - Frontend-focused deployment
3. **Render** - Full-stack deployment
4. **Docker** - Self-hosted option

## 📝 Notes

This is the first complete version of the TrixieVerse website. All files have been consolidated into this folder for easy access and version control.

For detailed instructions on setup, development, and deployment, refer to the documentation files in this folder.

---

**Created**: February 2026  
**Status**: Production-Ready  
**Version**: 1.0.0
