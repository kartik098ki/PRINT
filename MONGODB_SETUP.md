# 🍃 MongoDB Atlas Setup Guide (Step-by-Step)

Follow these steps exactly to get your database running for free.

## Phase 1: Create the Database (MongoDB Atlas)

1.  **Go to Website**: Open [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up (Google Login is easiest).
2.  **Create Cluster**:
    -   Click **+ Create**.
    -   Select **M0 Free** (Shared).
    -   Choose "AWS" and a region near you (e.g., N. Virginia or Mumbai).
    -   Click **Create Deployment**.

## Phase 2: Security Setup (Crucial!)

3.  **Create Database User**:
    -   Go to **Database Access** (on the left menu).
    -   Click **+ Add New Database User**.
    -   **Username**: `admin` (or whatever you want).
    -   **Password**: `password123` (Make it strong! **Write it down**).
    -   Click **Add User**.
    
4.  **Network Access (Allow Render)**:
    -   Go to **Network Access** (on the left menu).
    -   Click **+ Add IP Address**.
    -   Click **Allow Access From Anywhere** (enters `0.0.0.0/0`).
    -   Click **Confirm**.
    -   *Note: This is required for Render to connect.*

## Phase 3: Get Connection String

5.  **Get the Link**:
    -   Go back to **Database** (left menu).
    -   Click **Connect** button (on your cluster).
    -   Select **Drivers** (Node.js).
    -   **Copy the Connection String**. It looks like:
        `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

6.  **Prepare the Link**:
    -   Paste it into Notepad.
    -   Replace `<password>` with the real password you created in Step 3.
    -   Example: `mongodb+srv://admin:password123@cluster0...`

## Phase 4: Connect Render

7.  **Go to Render**:
    -   Open your Render Dashboard -> Click your Backend Service.
    -   Go to **Environment**.
    -   Click **Add Environment Variable**.
    -   **Key**: `MONGO_URI`
    -   **Value**: Paste your *prepared link* from Step 6.
    -   Click **Save Changes**.

## FAQ

**Q: Do I need to create tables or columns in MongoDB?**
A: **NO.** I wrote code (`User.js`, `Order.js`) that automatically creates the collections when the first user registers. You just need to connect it.

**Q: What if I forget my password?**
A: Go to **Database Access** > **Edit** > **Edit Password** to set a new one. Update it in Render too.
 
 