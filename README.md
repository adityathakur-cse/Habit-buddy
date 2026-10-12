# HabitBuddy 🎯

HabitBuddy is a modern full-stack habit tracking web application designed to help users build consistency, maintain streaks, and accomplish their daily goals.

---

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login.
- **Habit Management**: Create, view, update, and manage your daily habits.
- **Streak & Progress Tracking**: Keep track of current and longest streaks.
- **Modern UI**: Built with Next.js App Router and responsive styling.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: Tailwind CSS / Vanilla CSS

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (`pg` pool)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs`

---

## 📦 Project Structure

```text
HabitBuddy/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/     # App router pages (dashboard, login, register)
│   └── package.json
├── server/          # Node.js Express API backend
│   ├── controllers/ # Route handlers & business logic
│   ├── middleware/  # Auth middleware
│   ├── routes/      # API endpoints
│   ├── schema.sql   # PostgreSQL database schema
│   ├── db.js        # Database connection pool
│   ├── index.js     # Server entry point
│   └── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### 1. Database Setup
Create a PostgreSQL database and run the schema:
```bash
# In PostgreSQL CLI (psql):
CREATE DATABASE habitbuddy;
\c habitbuddy
\i server/schema.sql
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory based on `.env.example`:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=habitbuddy
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:
```bash
npm run dev
# or: node index.js
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
ISC
