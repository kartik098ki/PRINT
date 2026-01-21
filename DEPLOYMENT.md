# JPRINT Deployment Guide (Free Tier & High Scale)

This guide helps you deploy JPRINT for **free** while ensuring it runs smoothly.

## ⚠️ Important Scalability Warning
**Current Architecture**: Files are stored directly in the Database (Base64).
**Limitation**: Free databases (Neon/Render) have storage limits (e.g., 500MB). 
- **10k Users**: If 10,000 users upload a 1MB file each, you need **10,000 GB** of storage. This is NOT free.
- **Immediate Solution**: This deployment works great for testing and ~50-100 users.
- **For 10k Users**: You **MUST** switch file storage to **Firebase Storage** or **Cloudinary** (Free tiers available). Do not store files in the database for that scale.

---

## 🚀 Deployment Stack
1.  **Database**: **Neon** (PostgreSQL) - Free, Fast, Scalable.
2.  **Backend**: **Render** (Node.js) - Free Web Service.
3.  **Frontend**: **Vercel** or **Netlify** (React) - Free, High Performance (CDN).

---

## Step 1: Database (Neon.tech)
1.  Go to [Neon.tech](https://neon.tech) and Sign Up.
2.  Create a **New Project**.
3.  Copy the **Connection String** (looks like `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`).
    *   *Save this for Step 2.*

## Step 2: Backend (Render.com)
1.  Push your latest code to GitHub.
2.  Go to [Render.com](https://render.com) and Sign Up.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub Repository (`PRINT`).
5.  Configure the service:
    *   **Name**: `jprint-api` (or unique name).
    *   **Root Directory**: `server` (Important!).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node index.js`.
6.  Scroll down to **Environment Variables**:
    *   Key: `DATABASE_URL`
    *   Value: *(Paste your Neon Connection String from Step 1)*
7.  Click **Create Web Service**.
8.  Wait for deployment to finish. **Copy the Service URL** (e.g., `https://jprint-api.onrender.com`).

## Step 3: Frontend (Netlify)
1.  Go to [Netlify.com](https://www.netlify.com) and Sign Up.
2.  Click **"Add new site"** -> **"Import an existing project"**.
3.  Select **GitHub** and choose your `PRINT` repository.
4.  Configure the build:
    *   **Base directory**: *(Leave empty)*.
    *   **Build command**: `npm run build`.
    *   **Publish directory**: `dist`.
5.  **Environment Variables** (Click "Add environment variables"):
    *   Key: `VITE_API_URL`
    *   Value: *(Paste your Render Service URL from Step 2)*.
    *   *(Example: `https://jprint-api.onrender.com`)* - **No trailing slash**.
6.  Click **Deploy**.

## Step 3a: Alternative Frontend (Vercel)
If you prefer Vercel (or already deployed there):
1.  Go to [Vercel.com](https://vercel.com) -> New Project.
2.  Import your `PRINT` repo.
3.  **Framework Preset**: Vite (should contain `npm run build`).
4.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: *(Paste your Render Service URL)* (e.g., `https://jprint-api.onrender.com`)
5.  Click **Deploy**.
    *   *Note: If you see "Backend connection failed" error, you forgot Step 4.*

## Step 4: Verification
1.  Open your **Netlify URL** (e.g., `https://jprint.netlify.app`).
2.  Try to **Register/Login**. (This tests the connection to Render + Neon).
3.  Try to **Upload a File**. (This tests the increased body limit).
4.  Open the **Vendor Dashboard** (/vendor-login) to check orders.

---

### Troubleshooting
- **Frontend 404 on API**: Check if `VITE_API_URL` is set correctly in Netlify/Vercel.
    - **Specific Vercel Fix**: Go to Settings -> Environment Variables. Add `VITE_API_URL` = `https://your-render-app.onrender.com`. Redeploy.
- **Database Error**: Check if `DATABASE_URL` is set correctly in Render.
- **Slow First Load**: Render's free tier "sleeps" after inactivity. The first request might take 50 seconds to wake up. This is normal for free tier.
