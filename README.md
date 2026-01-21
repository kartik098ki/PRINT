# JPRINT v2.1

A modern print shop management system with Vendor Dashboard, Real-time status, and Stationery support.

## 🚀 Deployment Instructions for User (Fixing Login Issues)

If your users are disappearing or you get "Invalid Email" errors after some time, it is because you are using a temporary database.

**YOU MUST DO THIS ON RENDER:**
1.  Go to your **Neon Console** (neon.tech) and copy your **Connection String**.
2.  Go to your **Render Dashboard** -> **Environment**.
3.  Add a new Environment Variable:
    -   **Key**: `DATABASE_URL`
    -   **Value**: `postgres://...` (Your Neon connection string)
4.  Redeploy.

## ✨ Features

-   **Vendor Dashboard**: Real-time order queue, OTP Search, History.
-   **Student Panel**: Order History, PDF Upload (with robust scanning), Stationery Store.
-   **Print Logic**: Auto-calculates price based on pages, color, binding.

## 🛠️ Tech Stack

-   **Frontend**: React + Vite (Tailwind CSS, Framer Motion)
-   **Backend**: Node.js + Express
-   **Database**: PostgreSQL (Neon) or SQLite (Local Fallback)
