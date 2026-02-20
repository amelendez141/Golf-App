# LinkUp Golf Authentication Setup Guide

This guide explains how to set up Clerk authentication for LinkUp Golf. The app supports two modes:

1. **Demo Mode** - Works without any authentication setup (default)
2. **Production Mode** - Full Clerk authentication with user management

## Table of Contents

- [Quick Start (Demo Mode)](#quick-start-demo-mode)
- [Setting Up Clerk (Production Mode)](#setting-up-clerk-production-mode)
- [Environment Variables Checklist](#environment-variables-checklist)
- [Webhook Setup for User Sync](#webhook-setup-for-user-sync)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Demo Mode)

The app works out of the box without any Clerk configuration. In demo mode:

- Authentication is bypassed
- A dev user is automatically created and used
- All features work except real user accounts
- Perfect for local development and testing

**No setup required!** Just start the app:

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

---

## Setting Up Clerk (Production Mode)

Follow these steps to enable real user authentication.

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click **"Start building for free"**
3. Sign up with GitHub, Google, or email
4. Clerk's free tier includes:
   - 10,000 monthly active users
   - Unlimited applications
   - All authentication methods
   - Webhooks

### Step 2: Create an Application

1. After signing in, click **"Add application"**
2. Name your app (e.g., "LinkUp Golf" or "LinkUp Golf Dev")
3. Select authentication methods:
   - **Recommended:** Email, Google, Apple
   - Optional: GitHub, LinkedIn (good for professional networking)
4. Click **"Create application"**

### Step 3: Get Your API Keys

1. In your Clerk Dashboard, go to **"API Keys"** in the left sidebar
2. You'll see two keys:

   **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   ```
   pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - Safe to expose in frontend code
   - Used for client-side authentication

   **Secret Key** (starts with `sk_test_` or `sk_live_`)
   ```
   sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - Keep this private! Never commit to git
   - Used for backend token verification

### Step 4: Configure Frontend Environment

Edit `frontend/.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here

# Clerk URLs (keep these as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/feed
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/feed
```

### Step 5: Configure Backend Environment

Edit `backend/.env`:

```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_actual_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 6: Restart Both Services

```bash
# Stop and restart backend
cd backend && npm run dev

# Stop and restart frontend
cd frontend && npm run dev
```

---

## Environment Variables Checklist

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes* | Clerk publishable key (pk_test_... or pk_live_...) |
| `CLERK_SECRET_KEY` | Yes* | Clerk secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Sign-in page path (default: /sign-in) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Sign-up page path (default: /sign-up) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | No | Redirect after sign-in (default: /feed) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | No | Redirect after sign-up (default: /feed) |

*Required for production mode. Leave empty for demo mode.

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | Yes* | Clerk secret key for token verification |
| `CLERK_PUBLISHABLE_KEY` | Yes* | Clerk publishable key |
| `CLERK_WEBHOOK_SECRET` | Yes* | Webhook signing secret for user sync |

*Required for production mode. Leave empty for demo mode.

---

## Webhook Setup for User Sync

Webhooks sync user data from Clerk to your database when users sign up, update their profile, or delete their account.

### Step 1: Create Webhook Endpoint

1. In Clerk Dashboard, go to **"Webhooks"** in the left sidebar
2. Click **"Add Endpoint"**
3. Enter your webhook URL:
   - **Local development:** Use a tunnel like ngrok
     ```
     https://your-ngrok-url.ngrok.io/api/webhooks/clerk
     ```
   - **Production:**
     ```
     https://your-api-domain.com/api/webhooks/clerk
     ```

### Step 2: Select Events

Select these events to subscribe to:

- `user.created` - New user signed up
- `user.updated` - User updated their profile
- `user.deleted` - User deleted their account

### Step 3: Get Webhook Secret

1. After creating the endpoint, click on it to view details
2. Copy the **"Signing Secret"** (starts with `whsec_`)
3. Add it to your backend `.env`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### Step 4: Test the Webhook

1. In the webhook endpoint details, click **"Testing"**
2. Select `user.created` event
3. Click **"Send test webhook"**
4. Check your backend logs for the webhook processing

---

## Testing Your Setup

### Test 1: Frontend Clerk Configuration

1. Start the frontend: `npm run dev`
2. Navigate to `/sign-in`
3. If configured correctly, you'll see the Clerk sign-in form
4. If not configured, you'll see "Demo Mode Active" with a "Continue as Dev User" button

### Test 2: Backend Authentication

1. Start the backend: `npm run dev`
2. Check the console logs for:
   ```
   RUNNING IN DEMO MODE - Authentication bypassed
   ```
   (If you see this, Clerk is not configured)

   Or no warning (Clerk is configured and working)

### Test 3: Complete Sign-Up Flow

1. Go to `/sign-up` and create an account
2. Verify your email (if email verification is enabled in Clerk)
3. You should be redirected to `/feed`
4. Check your database for the new user (webhook should have created them)

### Test 4: API Authentication

With Clerk configured, API requests require a valid token:

```bash
# This should fail (no token)
curl http://localhost:3001/api/users/me

# Get a token from the frontend after signing in
# Then use it:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/users/me
```

---

## Troubleshooting

### "Demo Mode Active" even after adding keys

**Cause:** Keys are empty or using placeholder values.

**Solution:**
1. Make sure keys don't contain "your_" or "placeholder"
2. Keys must start with proper prefixes:
   - Publishable: `pk_test_` or `pk_live_`
   - Secret: `sk_test_` or `sk_live_`
   - Webhook: `whsec_`
3. Restart both frontend and backend after changing `.env` files

### Sign-in page shows error

**Cause:** Invalid or mismatched Clerk keys.

**Solution:**
1. Verify you copied the correct keys from Clerk Dashboard
2. Make sure you're using keys from the same Clerk application
3. Check browser console for specific error messages

### Webhooks not working

**Cause:** Webhook secret not configured or URL not accessible.

**Solution:**
1. Verify `CLERK_WEBHOOK_SECRET` is set correctly in backend `.env`
2. For local development, use ngrok or similar tunnel
3. Check Clerk Dashboard webhook logs for delivery status
4. Verify your backend is running and accessible at the webhook URL

### "User not found" after signing in

**Cause:** Webhook didn't create the user in your database.

**Solution:**
1. Check webhook endpoint is configured and receiving events
2. Verify webhook secret matches
3. Check backend logs for webhook processing errors
4. Manually trigger the webhook from Clerk Dashboard

### CORS errors

**Cause:** Frontend and backend domains not configured correctly.

**Solution:**
1. Add your frontend URL to `CORS_ORIGIN` in backend `.env`:
   ```bash
   CORS_ORIGIN="http://localhost:3000,http://localhost:3002"
   ```
2. Restart the backend

---

## Mode Comparison

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| User accounts | Single dev user | Real user accounts |
| Sign in/Sign up | Bypassed | Clerk authentication |
| Token verification | Skipped | Full verification |
| Webhooks | Disabled | User sync enabled |
| Best for | Development, testing | Production, staging |

---

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Use `sk_live_` keys only in production** - Test keys are for development
3. **Keep webhook secrets private** - They verify webhook authenticity
4. **Rotate keys if compromised** - Generate new keys in Clerk Dashboard

---

## Need Help?

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord Community](https://discord.com/invite/clerk)
- [Clerk GitHub Issues](https://github.com/clerkinc/javascript/issues)
