<![CDATA[<div align="center">

# ⛳ LinkUp Golf

### *Where Business Meets the Fairway*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**LinkUp Golf** is a professional networking platform that connects business professionals through their shared love of golf. Find tee times, match with like-minded professionals, and build valuable connections on the course.

[🚀 Live Demo](https://linkup-golf.vercel.app) • [📖 API Docs](https://api.linkup-golf.com/api-docs) • [🐛 Report Bug](https://github.com/your-repo/issues)

</div>

---

## ✨ Features

### 🏌️ Tee Time Management
- **Create & Host** tee times at any course
- **Join Open Rounds** with industry professionals
- **Smart Matching** based on skill level and industry preferences
- **Real-time Slot Updates** with optimistic locking to prevent double-booking

### 🗺️ Course Discovery
- **Interactive Map** powered by Mapbox with course locations
- **Detailed Course Info** including type, par, slope rating, yardage, and green fees
- **Course Conditions** - Community-reported greens, fairways, and bunker ratings
- **Favorite Courses** - Save your go-to courses for quick access

### 🌤️ Weather Integration
- **Live Weather Data** for golf course locations
- **Course-Specific Forecasts** to plan your perfect round
- **Playing Conditions** - Temperature, wind, and precipitation alerts

### 👥 Professional Networking
- **Industry-Based Matching** - Connect with professionals in Tech, Finance, Healthcare, Legal, Real Estate, and more
- **Skill Level Filtering** - Find players from Beginner to Expert (with handicap tracking)
- **Rich User Profiles** - Company, job title, bio, and golf stats

### 💬 Communication
- **In-Round Messaging** - Chat with your group before hitting the course
- **Push Notifications** - Alerts for joins, cancellations, and reminders
- **Real-time Updates** via WebSocket connections

### 🎨 Modern UI/UX
- **Responsive Design** - Beautiful on desktop and mobile
- **Dark Mode Support** - Easy on the eyes for early morning tee times
- **Smooth Animations** with Framer Motion
- **Accessible Components** following WAI-ARIA standards

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 18** | UI library with Server Components |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **React Query** | Server state & caching |
| **Mapbox GL** | Interactive maps |
| **Framer Motion** | Animations |
| **Clerk** | Authentication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 4** | REST API framework |
| **Prisma** | Type-safe ORM |
| **PostgreSQL 16** | Primary database |
| **PostGIS** | Geospatial queries |
| **Redis 7** | Caching & sessions |
| **Zod** | Request validation |
| **Swagger** | API documentation |
| **Winston** | Structured logging |

### Real-time Engine
| Technology | Purpose |
|------------|---------|
| **WebSocket (ws)** | Real-time communication |
| **BullMQ** | Job queues |
| **Node-Cron** | Scheduled tasks |
| **Web Push** | Push notifications |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Vercel** | Frontend hosting |
| **Railway** | Backend hosting |
| **Neon** | Serverless PostgreSQL |

---

## 📸 Screenshots

<div align="center">

### Feed & Tee Time Discovery
![Feed View](./screenshots/feed.png)

### Interactive Course Map
![Course Map](./screenshots/map.png)

### Course Details & Conditions
![Course Details](./screenshots/course-details.png)

### User Profile
![Profile](./screenshots/profile.png)

### Mobile View
![Mobile](./screenshots/mobile.png)

</div>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **Docker** & **Docker Compose** (recommended)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/linkup-golf.git
   cd linkup-golf
   ```

2. **Copy environment files**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (see below)

### Environment Variables

#### Root `.env` (for Docker Compose)
```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Mapbox
MAPBOX_TOKEN=pk.your_mapbox_token

# Demo Mode (bypasses auth for testing)
DEMO_MODE=true
```

#### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

#### Backend (`backend/.env`)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/linkup_golf
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
CORS_ORIGIN=http://localhost:3000
```

---

## 🐳 Running with Docker (Recommended)

The easiest way to run the full stack locally:

```bash
# Start all services (frontend, backend, postgres, redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Run database migrations and seed data
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run db:seed

# Stop all services
docker-compose down
```

**Services:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs | http://localhost:3001/api-docs |
| Adminer (DB UI) | http://localhost:8080 |
| Redis Commander | http://localhost:8081 |

To start with development tools:
```bash
docker-compose --profile tools up -d
```

---

## 💻 Running Without Docker

### 1. Start PostgreSQL and Redis

You'll need PostgreSQL 16+ and Redis 7+ running locally.

**macOS (Homebrew):**
```bash
brew services start postgresql@16
brew services start redis
```

**Windows (WSL or native):**
```bash
# Install and start PostgreSQL
# Install and start Redis
```

### 2. Setup the Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data (60 professionals, 45 courses, 190+ tee times)
npm run db:seed

# Start development server
npm run dev
```

### 3. Setup the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. (Optional) Start Real-time Engine

```bash
cd realtime

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📦 Deployment

### Frontend → Vercel

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Set the root directory to `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
   CLERK_SECRET_KEY=sk_live_xxx
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
   ```
4. Deploy!

### Backend → Railway

1. Connect your GitHub repository to [Railway](https://railway.app)
2. Set the root directory to `backend`
3. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   CLERK_SECRET_KEY=sk_live_xxx
   CLERK_WEBHOOK_SECRET=whsec_xxx
   CORS_ORIGIN=https://your-frontend.vercel.app
   DEMO_MODE=false
   LOG_LEVEL=info
   ```
4. Deploy!

### Database → Neon

1. Create a serverless PostgreSQL database at [Neon](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 📚 API Documentation

The backend API is fully documented with Swagger/OpenAPI.

**Local:** http://localhost:3001/api-docs

**Production:** https://your-backend.railway.app/api-docs

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me` | Get current user profile |
| `GET` | `/api/users` | List users with filters |
| `GET` | `/api/courses` | List golf courses |
| `GET` | `/api/courses/:slug` | Get course details |
| `GET` | `/api/tee-times` | List tee times with filters |
| `POST` | `/api/tee-times` | Create a new tee time |
| `POST` | `/api/tee-times/:id/join` | Join a tee time |
| `DELETE` | `/api/tee-times/:id/leave` | Leave a tee time |
| `GET` | `/api/weather/:courseSlug` | Get weather for course |
| `GET` | `/api/conditions/:courseId` | Get course conditions |
| `POST` | `/api/conditions` | Report course conditions |
| `GET` | `/health` | Health check |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   cd backend && npm test
   cd frontend && npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- **TypeScript** for all code
- **ESLint** for linting
- **Prettier** for formatting (recommended)
- **Prisma** for database migrations

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Mapbox](https://mapbox.com) for beautiful maps
- [Clerk](https://clerk.com) for authentication
- [Vercel](https://vercel.com) for frontend hosting
- [Railway](https://railway.app) for backend hosting
- [Neon](https://neon.tech) for serverless PostgreSQL
- All the amazing open-source libraries that make this possible

---

<div align="center">

**Built with ❤️ for golfers who mean business**

[⬆ Back to Top](#-linkup-golf)

</div>
]]>