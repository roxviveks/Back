# Saksham Bharti (अक्षम से सक्षम) — Automated Email Backend

Node.js + Express + SQLite backend with **automatic daily Gmail wishes & event reminders** using `nodemailer` and `node-cron`.

## Phone Setup & Free Deployment (No Laptop Needed)

### Step 1: Get Your 16-Digit Gmail App Password
1. Open your Google Account on your phone -> **Security**.
2. Turn on **2-Step Verification** (if not already on).
3. Search for **App passwords**, create one named `Saksham Bharti`, and copy the 16-digit code.

### Step 2: Upload to GitHub & Deploy on Render (Free)
1. Upload this folder to a GitHub repository (e.g. `saksham-bharti-backend`).
2. Open [render.com](https://render.com) in your phone browser -> **New +** -> **Web Service** -> connect your GitHub repo.
3. Set:
   - **Build Command:** `npm install && npm run seed`
   - **Start Command:** `npm start`
4. Add **Environment Variables** in Render:
   - `JWT_SECRET`: any random secret string
   - `GMAIL_USER`: your Gmail address
   - `GMAIL_APP_PASSWORD`: the 16-digit App Password
   - `ADMIN_EMAIL`: your Gmail address for daily admin summaries
   - `FRONTEND_URL`: your frontend URL (or `*` during testing)

## Local Run
```bash
npm install
cp .env.example .env
npm run seed
npm start
```

## Key API Endpoints
- `GET /api/health` — Server & mailer status
- `POST /api/auth/login` — Admin login (`admin@sakshambharti.org` / `password123`)
- `GET/POST/PUT/DELETE /api/members` — Students, teachers, volunteers
- `GET /api/members/birthdays` — Birthday list
- `GET/POST/PUT/DELETE /api/occasions` — Special occasions
- `GET/POST/PUT/DELETE /api/templates` — Email templates
- `GET /api/messages` — Sent email history
- `POST /api/messages/send` — Send an immediate email campaign to a group
- `POST /api/messages/run-auto` — Manually trigger today's birthday & occasion auto-mailer right now
- `GET /api/reports/overview` — Dashboard stats
- `GET/PUT /api/settings` — Organization profile & preferences
