# TrixieVerse 🎮✨

**The Ultimate AI-Powered Wild Rift Coaching Platform**

TrixieVerse is a cutting-edge web application that combines artificial intelligence with competitive gaming coaching. It provides personalized match analysis, skill profiling, achievement tracking, and community features for Wild Rift players.

## 🚀 Quick Start

### Prerequisites
- Node.js v22.13.0+
- pnpm v10.4.1+
- MySQL/TiDB database

### Installation

```bash
# Clone the repository
git clone https://github.com/TR1XONE/Trixieverse.git
cd Trixieverse

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Initialize database
pnpm run db:push

# Start development server
pnpm run dev
```

Visit `http://localhost:3000` to access the application.

## 📚 Documentation

- **[Local Setup Guide](./LOCAL_SETUP.md)**: Comprehensive development environment setup
- **[Architecture Overview](#architecture)**: System design and component breakdown
- **[API Documentation](#api)**: tRPC procedures and endpoints

## 🏗️ Architecture

### Frontend Stack
- **React 19**: Modern UI framework with hooks and concurrent features
- **Tailwind CSS 4**: Utility-first CSS framework for responsive design
- **tRPC 11**: End-to-end type-safe RPC for backend communication
- **Vite 7**: Lightning-fast build tool with HMR

### Backend Stack
- **Express.js 4**: Lightweight HTTP server framework
- **tRPC Server**: Type-safe RPC procedure definitions
- **Drizzle ORM**: Modern, type-safe database query builder
- **MySQL/TiDB**: Relational database for persistent storage

### Key Features

#### 🤖 AI Coach System
- Multiple personality types (Sage, Blaze, Echo, Nova)
- Customizable response styles and message length
- Persistent memory system for personalized coaching
- Emotional intelligence scoring

#### 📊 Match Analysis
- Detailed performance metrics (KDA, CS, gold, damage)
- Champion-specific statistics
- Skill profile generation
- Performance trend tracking

#### 🏆 Achievement & Progression
- Milestone-based achievement system
- Rarity tiers (common, rare, epic, legendary)
- XP and level progression
- Leaderboard rankings

#### 👥 Community Features
- Coaching circles for group learning
- Friend system for social connectivity
- Shared match analysis
- Community challenges

## 📁 Project Structure

```
trixieverse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── _core/            # Core infrastructure
│   ├── routers.ts        # tRPC procedures
│   ├── db.ts             # Database queries
│   └── storage.ts        # File storage
├── drizzle/              # Database schema
│   ├── schema.ts         # Table definitions
│   └── migrations/       # Migration files
├── shared/               # Shared types
└── package.json          # Dependencies
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with HMR |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run check` | Run TypeScript type checking |
| `pnpm run format` | Format code with Prettier |
| `pnpm run test` | Run tests with Vitest |
| `pnpm run db:push` | Generate and apply database migrations |

## 🗄️ Database Schema

### Core Tables

**users**
- User authentication and profile information
- Role-based access control (admin/user)
- Subscription management

**player_accounts**
- Wild Rift account linking
- Rank and statistics
- Multiple accounts per user support

**coach_personalities**
- AI coach customization settings
- Personality type and accent selection
- Response style preferences

**coach_memories**
- Persistent memory system
- Contextual information storage
- Emotional weight tracking

**matches**
- Match analysis and statistics
- Performance scoring
- Champion and role tracking

**achievements**
- User achievement tracking
- Rarity classification
- Unlock timestamps

**skill_profiles**
- Comprehensive skill assessment
- Mechanics, macro, decision-making scores
- Trend analysis

**leaderboard_entries**
- Global ranking system
- XP and level progression
- Win rate tracking

## 🔐 Security Features

- **OAuth Integration**: Secure authentication via Manus OAuth
- **JWT Sessions**: Secure session management with signed tokens
- **CORS Protection**: Cross-origin request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM

## 🚀 Deployment

### Local Development
```bash
pnpm run dev
```

### Production Build
```bash
pnpm run build
pnpm run start
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/trixieverse
JWT_SECRET=<secure-random-string>
PORT=3000
```

## 📊 Performance Metrics

- **Build Time**: ~20 seconds
- **Frontend Bundle**: ~1.5 MB (uncompressed), ~467 KB (gzipped)
- **Server Bundle**: ~21.6 KB
- **Development HMR**: <100ms refresh time

## 🛠️ Technology Decisions

### Why tRPC?
- Type-safe end-to-end communication
- Automatic API documentation
- Simplified client-server data flow
- Reduced boilerplate compared to REST

### Why Drizzle ORM?
- Modern, lightweight ORM
- Full TypeScript support
- Type-safe query building
- Excellent migration system

### Why Tailwind CSS 4?
- Utility-first approach for rapid development
- Excellent responsive design support
- Extensive component library (shadcn/ui)
- Optimized production builds

## 🐛 Troubleshooting

### Port Already in Use
The development server automatically tries ports 3000-3019. To use a specific port:
```bash
PORT=8080 pnpm run dev
```

### Database Connection Issues
Verify your `DATABASE_URL` and ensure the database server is running:
```bash
mysql -u user -p -h localhost -D trixieverse
```

### Build Failures
Clear cache and reinstall:
```bash
rm -rf node_modules dist/ pnpm-lock.yaml
pnpm install
pnpm run build
```

## 📝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ by the TrixieVerse Team**

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Repository**: https://github.com/TR1XONE/Trixieverse
