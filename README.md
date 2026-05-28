# BlogForge — Full-Stack Blog Platform

A complete blogging platform with user auth, post CRUD, comments, and admin dashboard.

**Stack:** React (Vite) + Node.js/Express + MongoDB Atlas  
**Deploy:** Vercel (frontend) + Render (backend)

---

## Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@blogforge.com    | admin123  |
| User  | alice@blogforge.com    | user123   |
| User  | bob@blogforge.com      | user123   |

---

## Features

- ✅ User registration & login (JWT, 7-day expiry)
- ✅ Role-based access: Admin / User
- ✅ Create, edit, delete blog posts (with draft/publish workflow)
- ✅ Rich markdown rendering + cover images
- ✅ Comment section with nested replies, edit & delete
- ✅ Category filter, search, pagination
- ✅ Author profiles
- ✅ Admin dashboard: stats, post management, user management
- ✅ Toast notifications, responsive design

---

## Local Development

### 1. Clone & install

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Configure environment variables

```bash
# server/.env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/blogforge
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
# client/.env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
cd server
MONGODB_URI="your_uri_here" node seed/seed.js
```

### 4. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open: http://localhost:5173

---

## Deployment

### Step 1 — MongoDB Atlas
1. Go to https://cloud.mongodb.com → create free cluster
2. Create database user → copy connection URI
3. Whitelist all IPs: `0.0.0.0/0`
4. Run seed: `MONGODB_URI="..." node server/seed/seed.js`

### Step 2 — Render (Backend)
1. New Web Service → connect GitHub repo
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Environment variables:**
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = any long random string
   - `CLIENT_URL` = your Vercel URL (add after Vercel deploy)
6. Copy your Render URL (e.g. `https://blogforge-api.onrender.com`)

### Step 3 — Vercel (Frontend)
1. New Project → import GitHub repo
2. **Root Directory:** `client`
3. **Framework:** Vite
4. **Environment variable:**
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
5. Deploy → copy Vercel URL

### Step 4 — Update CORS
Go to Render → update `CLIENT_URL` env var → your Vercel URL → redeploy.

---

## Project Structure

```
blogforge/
├── server/
│   ├── models/          User, Post, Comment
│   ├── routes/          auth, posts, comments, users
│   ├── middleware/       protect, adminOnly, optionalAuth
│   ├── seed/            seed.js (demo data)
│   └── server.js
└── client/
    └── src/
        ├── components/  Navbar, Footer, PostCard
        ├── context/     AuthContext, ToastContext
        ├── hooks/       useApi (axios instance)
        └── pages/
            ├── Home, PostDetail, Login, Register
            ├── WritePost, EditPost, MyPosts, Profile
            └── admin/   AdminDashboard, AdminPosts, AdminUsers
```
