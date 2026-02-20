# LinkUp Golf - Deployment Guide

Complete deployment guide for LinkUp Golf, a professional networking app through golf.

## Table of Contents

1. [Quick Start (Demo Mode)](#quick-start-demo-mode)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Railway/Render)](#backend-deployment-railwayrender)
5. [Realtime Server Deployment](#realtime-server-deployment)
6. [Database Setup (Neon)](#database-setup-neon)
7. [Environment Variables Checklist](#environment-variables-checklist)
8. [Custom Domain & DNS Setup](#custom-domain--dns-setup)
9. [SSL Certificates](#ssl-certificates)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)
12. [Cost Breakdown](#cost-breakdown)

---

## Quick Start (Demo Mode)

Deploy a fully working demo in under 15 minutes - no Clerk account required.

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository and set root directory to `backend`
4. Add these environment variables:

```env
NODE_ENV=production
PORT=3001
DEMO_MODE=true
DATABASE_URL=postgresql://neondb_owner:npg_F2ExyoZcS8nf@ep-rough-shadow-aiwi8u9h-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
CLERK_SECRET_KEY=demo_placeholder
CLERK_WEBHOOK_SECRET=demo_placeholder
CLERK_PUBLISHABLE_KEY=demo_placeholder
CORS_ORIGIN=https://your-frontend.vercel.app
LOG_LEVEL=info
```

5. Deploy and copy your Railway URL (e.g., `https://xxx.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New" > "Project"
3. Import your repository, set root directory to `frontend`
4. Add these environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-railway-url.up.railway.app
```

5. Deploy!

### Step 3: Update CORS

After Vercel gives you a URL, go back to Railway and update `CORS_ORIGIN` to match your Vercel URL exactly.

**That's it!** Your demo is live with:
- 60 demo professionals
- 45 real golf courses
- 190+ tee times
- User switching functionality
- Full app features

---

## Architecture Overview

```
                    +------------------+
                    |    Vercel        |
                    |   (Frontend)     |
                    |   Next.js PWA    |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |     Railway       |         |     Railway       |
    |    (Backend)      |         |   (Realtime)      |
    |   Express API     |         |   WebSocket       |
    +---------+---------+         +---------+---------+
              |                             |
              +--------------+--------------+
                             |
                    +--------v--------+
                    |      Neon       |
                    |   PostgreSQL    |
                    |   (Database)    |
                    +-----------------+
                             |
                    +--------v--------+
                    |    Upstash      |
                    |     Redis       |
                    |  (Optional)     |
                    +-----------------+
```

---

## Frontend Deployment (Vercel)

### Configuration Files

**vercel.json** - Already configured with:
- Security headers (X-Frame-Options, CSP, etc.)
- Cache optimization for static assets
- PWA service worker settings
- API route configurations

**next.config.mjs** - Production optimizations:
- Image optimization (AVIF, WebP)
- Bundle tree shaking
- Standalone output mode
- Security headers

### Vercel Deployment Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel

   # Login and deploy
   vercel login
   cd frontend
   vercel
   ```

2. **Or use Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set root directory: `frontend`
   - Framework preset: Next.js (auto-detected)

3. **Environment Variables** (in Vercel Dashboard > Settings > Environment Variables)

   | Variable | Value | Required |
   |----------|-------|----------|
   | `NEXT_PUBLIC_API_URL` | Backend URL | Yes |
   | `NEXT_PUBLIC_WS_URL` | WebSocket URL | Yes |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk key | Demo: No |
   | `CLERK_SECRET_KEY` | Clerk secret | Demo: No |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox token | Optional |

4. **Build Settings** (usually auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Vercel Free Tier Limits

- 100 GB bandwidth/month
- Serverless Function execution: 100 GB-hours
- 6000 build minutes/month
- Custom domains included

---

## Backend Deployment (Railway/Render)

### Option A: Railway (Recommended)

Railway offers $5 free credit monthly and excellent DX.

1. **Create Project**
   ```bash
   # Install Railway CLI (optional)
   npm i -g @railway/cli

   # Login and init
   railway login
   cd backend
   railway init
   railway up
   ```

2. **Or use Dashboard**
   - Go to [railway.app](https://railway.app)
   - New Project > Deploy from GitHub
   - Select repo, set root directory: `backend`

3. **Configuration Files**
   - `railway.json` - Deployment configuration
   - `nixpacks.toml` - Build settings
   - `Procfile` - Process definitions

4. **Environment Variables** (Railway Dashboard > Variables)

   See `.env.production.example` for full list.

### Option B: Render

Render offers a generous free tier but with cold starts.

1. **Create Service**
   - Go to [render.com](https://render.com)
   - New > Web Service
   - Connect GitHub repo
   - Root directory: `backend`

2. **Configuration**
   - `render.yaml` already configured
   - Build: `npm ci && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && npm start`

3. **Free Tier Notes**
   - Spins down after 15 minutes of inactivity
   - ~30 second cold start
   - 750 hours/month

### Health Check Endpoint

Both platforms use `/health` for health checks:

```bash
curl https://your-backend.up.railway.app/health
# Response: {"status":"ok","timestamp":"..."}
```

---

## Realtime Server Deployment

The realtime server handles WebSocket connections, job queues, and notifications.

### Railway Deployment

1. Create a new service in the same Railway project
2. Set root directory: `realtime`
3. Add environment variables (see `.env.production.example`)

### Important: WebSocket Considerations

- **Railway**: WebSockets work on free tier
- **Render**: Requires paid plan ($7/mo) for WebSocket support
- **Heroku**: WebSockets work but with dyno sleeping

### Configuration Files

- `railway.json` - Railway-specific settings
- `nixpacks.toml` - Build configuration
- `render.yaml` - Render-specific settings
- `Procfile` - Heroku-compatible

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WS_PORT` | WebSocket port (default: 3002) | Yes |
| `DATABASE_URL` | Same as backend | Yes |
| `REDIS_URL` | For job queues | Recommended |
| `JWT_SECRET` | Must match backend | Yes |

---

## Database Setup (Neon)

### Current Configuration

The app is configured to use Neon PostgreSQL (already set up).

### Connection String Format

```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```

**Important**: Use the **pooled** connection string for production:
- Non-pooled: `ep-xxx.region.aws.neon.tech` (limited connections)
- Pooled: `ep-xxx-pooler.region.aws.neon.tech` (recommended)

### Connection Pooling

Neon's connection pooler handles connection limits automatically:
- Free tier: 100 pooled connections
- Uses PgBouncer under the hood

### Prisma Configuration

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Free Tier Limits

- 512 MB storage
- 1 project
- Unlimited compute hours (with auto-suspend)
- 100 pooled connections

### Database Migrations

Migrations run automatically on deploy:

```bash
# In Railway/Render start command
npx prisma migrate deploy
```

---

## Environment Variables Checklist

### Frontend (Vercel)

```env
# Required
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-realtime.up.railway.app

# Authentication (Demo: use placeholders)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Optional
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

### Backend (Railway/Render)

```env
# Required
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...?sslmode=require
CORS_ORIGIN=https://your-frontend.vercel.app

# Demo Mode
DEMO_MODE=true

# Authentication (Demo: use placeholders)
CLERK_SECRET_KEY=sk_live_xxx
CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Optional
REDIS_URL=rediss://...
OPENWEATHER_API_KEY=xxx
LOG_LEVEL=info
```

### Realtime Server (Railway/Render)

```env
# Required
NODE_ENV=production
WS_PORT=3002
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=your-secret-key

# Required for jobs
REDIS_URL=rediss://...

# Optional - Push Notifications
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx

# Optional - Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=xxx
SMTP_PASS=xxx
```

---

## Custom Domain & DNS Setup

### Vercel (Frontend)

1. Go to Project Settings > Domains
2. Add your domain: `app.linkupgolf.com`
3. Update DNS records:

```
Type: CNAME
Name: app (or @)
Value: cname.vercel-dns.com
```

### Railway (Backend)

1. Go to Service Settings > Networking > Custom Domain
2. Add domain: `api.linkupgolf.com`
3. Update DNS:

```
Type: CNAME
Name: api
Value: your-project.up.railway.app
```

### Render (Alternative)

1. Go to Service > Settings > Custom Domain
2. Add domain and follow DNS instructions

### Recommended DNS Structure

```
linkupgolf.com          -> Marketing site (optional)
app.linkupgolf.com      -> Vercel frontend
api.linkupgolf.com      -> Railway backend
ws.linkupgolf.com       -> Railway realtime (optional)
```

---

## SSL Certificates

### Automatic SSL

All three platforms provide automatic SSL certificates:

- **Vercel**: Automatic Let's Encrypt certificates
- **Railway**: Automatic SSL provisioning
- **Render**: Automatic managed certificates

### Requirements

1. DNS must be properly configured
2. Domain must resolve to the platform
3. Certificate issuance takes 1-5 minutes

### Forcing HTTPS

Already configured in:
- `vercel.json`: Security headers
- `next.config.mjs`: HSTS header
- Backend: `helmet` middleware

---

## Production Deployment

For production with real users, disable demo mode and configure Clerk.

### Step 1: Create Clerk Account

1. Go to [clerk.com](https://clerk.com) and create account
2. Create a new application
3. Copy your API keys

### Step 2: Configure Clerk Webhooks

1. In Clerk Dashboard > Webhooks
2. Add endpoint: `https://api.linkupgolf.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret

### Step 3: Update Environment Variables

**Backend:**
```env
DEMO_MODE=false
CLERK_SECRET_KEY=sk_live_actual_key
CLERK_PUBLISHABLE_KEY=pk_live_actual_key
CLERK_WEBHOOK_SECRET=whsec_actual_secret
```

**Frontend:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_actual_key
CLERK_SECRET_KEY=sk_live_actual_key
```

### Step 4: Configure Clerk Appearance

In Clerk Dashboard:
1. Set redirect URLs
2. Customize sign-in/sign-up pages
3. Enable desired OAuth providers

---

## Troubleshooting

### Common Issues

#### "UNAUTHORIZED" Error
- **Cause**: Authentication not configured
- **Solution**: Ensure `DEMO_MODE=true` in backend for demo, or configure real Clerk keys

#### CORS Errors
- **Cause**: Frontend/backend URL mismatch
- **Solution**: Update `CORS_ORIGIN` in backend to match exact Vercel URL (with https://)

#### Database Connection Failed
- **Cause**: Invalid connection string or SSL issues
- **Solution**:
  - Verify `DATABASE_URL` is correct
  - Ensure `?sslmode=require` at the end
  - Use pooled connection string

#### Build Failed on Railway
- **Cause**: Missing dependencies or incorrect config
- **Solution**:
  - Check `nixpacks.toml` for correct setup
  - Verify `package.json` scripts
  - Check Railway build logs

#### WebSocket Connection Failed
- **Cause**: WSS URL incorrect or service not running
- **Solution**:
  - Verify `NEXT_PUBLIC_WS_URL` uses `wss://`
  - Check realtime server is deployed and healthy
  - Render requires paid plan for WebSockets

### Debugging Commands

```bash
# Check backend health
curl https://your-backend.up.railway.app/health

# Check realtime health
curl https://your-realtime.up.railway.app/health

# View Railway logs
railway logs -f

# Test database connection
npx prisma db pull
```

---

## Cost Breakdown

### Free Tier Setup

| Service | Free Tier Limits | Monthly Cost |
|---------|------------------|--------------|
| **Vercel** | 100GB bandwidth, 6000 build mins | $0 |
| **Railway** | $5 credit (~500 hours) | $0* |
| **Neon DB** | 512MB storage, auto-suspend | $0 |
| **Upstash Redis** | 10,000 commands/day | $0 |
| **Clerk** | 10,000 MAU | $0 |
| **OpenWeather** | 1,000 calls/day | $0 |
| **Mapbox** | 50,000 map loads/month | $0 |

*Railway: $5/month credit covers demo usage

**Total for Demo: $0/month**

### Production Estimate

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Vercel** | Pro | $20 |
| **Railway** | Pro | $20 |
| **Neon DB** | Launch | $19 |
| **Clerk** | Pro | $25+ |
| **Upstash** | Pay-as-you-go | ~$5 |

**Total for Production: ~$90-150/month**

---

## Features Included

After deployment, you'll have:

### Core Features
- Tee time feed with filters
- Interactive map with course markers
- Quick Match (find games near you)
- Real-time chat with status indicators
- Post-round connect flow
- Meeting notes for business connections
- Player reviews and ratings

### Premium UX
- Dark mode toggle
- PWA support (install as app)
- Offline indicator
- Responsive mobile design
- Weather widget with playability scores
- Course condition reports

### Business Golf Features
- Golf Resume on profiles
- Connection requests after rounds
- Private meeting notes
- Player review system

---

## Getting Help

1. **Check browser console** for frontend errors
2. **View Railway/Render logs** for backend issues
3. **Verify environment variables** are set correctly
4. **Test health endpoints** to confirm services are running

### Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Clerk Documentation](https://clerk.com/docs)

---

## Mobile App Deployment (EAS)

Deploy the React Native mobile app to iOS App Store and Google Play Store using Expo Application Services (EAS).

### Prerequisites

1. **Apple Developer Account** ($99/year) - Required for iOS App Store
2. **Google Play Developer Account** ($25 one-time) - Required for Google Play
3. **Expo Account** - Free at [expo.dev](https://expo.dev)

### Step 1: Install and Configure EAS CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Navigate to mobile directory
cd mobile
```

### Step 2: Configure EAS Build

1. Initialize EAS in your project:
   ```bash
   eas build:configure
   ```

2. Update `app.json` with your EAS project ID:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-actual-project-id"
         }
       }
     }
   }
   ```

3. Create `eas.json` with build profiles:
   ```json
   {
     "cli": {
       "version": ">= 5.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": true
         }
       },
       "production": {
         "autoIncrement": true,
         "env": {
           "EXPO_PUBLIC_API_URL": "https://api.linkupgolf.com",
           "EXPO_PUBLIC_WS_URL": "wss://ws.linkupgolf.com",
           "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_live_xxx"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

### Step 3: Configure App Credentials

#### iOS Credentials
```bash
# EAS will guide you through credential setup
eas credentials --platform ios

# Options:
# - Let EAS manage credentials (recommended)
# - Use your own Apple Developer certificates
```

#### Android Credentials
```bash
# EAS will guide you through keystore setup
eas credentials --platform android

# Options:
# - Let EAS manage keystore (recommended)
# - Upload your own keystore
```

### Step 4: Build Production Apps

#### Build for iOS
```bash
# Build production IPA for App Store
eas build --platform ios --profile production

# This will:
# 1. Upload code to EAS servers
# 2. Build the iOS app
# 3. Sign with your credentials
# 4. Return a downloadable IPA
```

#### Build for Android
```bash
# Build production AAB for Google Play
eas build --platform android --profile production

# This will:
# 1. Upload code to EAS servers
# 2. Build the Android app
# 3. Sign with your keystore
# 4. Return a downloadable AAB
```

#### Build Both Platforms
```bash
eas build --platform all --profile production
```

### Step 5: Submit to App Stores

#### Submit to iOS App Store
```bash
# Requires Apple Developer account credentials
eas submit --platform ios --latest

# Or specify a build ID
eas submit --platform ios --id BUILD_ID
```

Before submission, ensure you have:
- [ ] App Store Connect account set up
- [ ] App listing created with metadata
- [ ] Screenshots for all required device sizes
- [ ] Privacy policy URL
- [ ] App description and keywords

#### Submit to Google Play Store
```bash
# Requires Google Play service account
eas submit --platform android --latest

# Or specify a build ID
eas submit --platform android --id BUILD_ID
```

Before submission, ensure you have:
- [ ] Google Play Console account set up
- [ ] App listing created
- [ ] Screenshots and feature graphic
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed

### Step 6: Configure Over-the-Air Updates

EAS Update allows pushing JavaScript updates without rebuilding:

```bash
# Configure EAS Update
eas update:configure

# Push an update to production
eas update --branch production --message "Bug fixes and improvements"
```

Add to `app.json`:
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### Mobile Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | Yes |
| `EXPO_PUBLIC_WS_URL` | WebSocket URL | Yes |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk key | Yes |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps API key | Yes |

### App Store Checklist

#### iOS App Store
- [ ] App icon (1024x1024)
- [ ] Screenshots (iPhone 6.7", 6.5", 5.5")
- [ ] App Preview videos (optional)
- [ ] App description (up to 4000 characters)
- [ ] Keywords (up to 100 characters)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] In-app purchases configured (if any)

#### Google Play Store
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone, 7" tablet, 10" tablet)
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target audience and content
- [ ] Data safety questionnaire

### Mobile Deployment Cost

| Service | Free Tier | Paid |
|---------|-----------|------|
| **EAS Build** | 30 builds/month | $99/month for priority |
| **EAS Submit** | Unlimited | Included |
| **EAS Update** | 10,000 MAU | $99/month |
| **Apple Developer** | - | $99/year |
| **Google Play** | - | $25 one-time |

---

## Complete Deployment Summary

After following all deployment steps, you will have:

| Component | Platform | URL |
|-----------|----------|-----|
| Web Frontend | Vercel | app.linkupgolf.com |
| Backend API | Railway | api.linkupgolf.com |
| Realtime Server | Railway | ws.linkupgolf.com |
| Database | Neon | (managed) |
| iOS App | App Store | LinkUp Golf |
| Android App | Play Store | LinkUp Golf |

### Final Verification Checklist

- [ ] Web app loads and authenticates users
- [ ] Tee times display correctly
- [ ] Real-time chat works
- [ ] Mobile apps install and run
- [ ] Push notifications work
- [ ] Calendar sync functions
- [ ] Email notifications send (if configured)
- [ ] All OAuth providers work (Google, Apple)
