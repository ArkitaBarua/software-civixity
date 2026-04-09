# <img src="public/logo.jpg" alt="Civixity Logo" height="32" style="vertical-align:middle; margin-right:8px;"/> Civixity: Next-Gen Civic Engagement Platform

Civixity is a modern, AI-powered civic engagement platform for cities and communities. It empowers citizens to report issues, participate in governance, join volunteer activities, and earn rewards—all in a beautiful, gamified web experience.

---

## 🚀 Features

- **AI-Powered Civic Assistant**  
  Get instant help and information with an AI chatbot that answers questions, guides users, and summarizes city activity.

- **Smart Issue Reporting & Detection**  
  Report civic issues with photos and location. Advanced AI detects image authenticity and categorizes issues for faster resolution.

- **Real-Time City Heatmaps & Analytics**  
  Visualize civic issues, trends, and department performance with interactive heatmaps and analytics dashboards.

- **Community DAO & Polls**  
  Participate in city governance through community polls and DAO voting. Help prioritize projects and funding democratically.

- **Volunteer Activities & Events**  
  Discover, join, and track local volunteer events. Earn points and badges for making a difference in your community.

- **Rewards, Badges & Points Economy**  
  Earn CIVI points for engagement, unlock badges, and redeem rewards for real-world benefits and recognition.

- **City Resources & Documents**  
  Access important city documents, emergency contacts, and public resources in one place.

---

## 🏗️ Project Structure

```
civi/
  backend/         # Node.js/Express backend (API, AI, Supabase integration)
    config/        # Supabase and Gemini AI config
    routes/        # API endpoints (chatbot, image detection)
    uploads/       # Uploaded images for AI detection
    trial.py       # Python script for deepfake image detection
    package.json   # Backend dependencies
    README.md      # Backend-specific documentation
  src/             # React frontend (Vite, TypeScript, shadcn-ui, Tailwind)
    components/    # UI components (ChatBot, Navbar, Sidebar, etc.)
      ui/          # shadcn/ui-based reusable components
    contexts/      # React context providers (e.g., PointsContext)
    hooks/         # Custom React hooks
    lib/           # Supabase client, utility functions
    pages/         # Main user-facing pages (Home, Polls, Heatmaps, etc.)
    index.css      # Global styles
    App.tsx        # Main app entry
  public/          # Static assets (logo, images, favicon)
  database-schema.sql # Supabase SQL schema for points, redemptions, donations, etc.
  README.md        # Main project documentation
```

---

## 🖥️ Tech Stack

- **Frontend:** React, Vite, TypeScript, shadcn-ui, Tailwind CSS, React Router, Recharts, Google Maps API
- **Backend:** Node.js, Express, Supabase, Gemini AI, Python (image deepfake detection)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email, Google)
- **APIs:** RESTful endpoints for chatbot, posts, analytics, image detection

---

## ⚡ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Supabase account (for database and auth)
- Google API key (for Maps/Heatmaps)
- Gemini AI API key (for chatbot)

### 1. Clone the Repository

```sh
git clone <YOUR_GIT_URL>
cd civi
```

### 2. Install Dependencies

```sh
npm install
cd backend
npm install
```

### 3. Environment Variables

Create a `.env` file in the root and in `/backend`:

#### Frontend (`.env` in root)

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_BACKEND_URL=http://localhost:4000
```

#### Backend (`backend/.env`)

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### 4. Database Setup

- Run the SQL in `database-schema.sql` in your Supabase SQL editor to create all required tables and policies.

### 5. Run the App

**Frontend:**
```sh
npm run dev
```

**Backend:**
```sh
cd backend
npm run dev
```

---

## 🧩 Key Modules & Pages

- **ChatBot:** AI-powered assistant for civic queries and help (`src/components/ChatBot.tsx`)
- **Home:** Report issues, see recent activity, and interact with the community (`src/pages/HomePage.tsx`)
- **Polls:** Participate in DAO-style voting and city governance (`src/pages/Polls.tsx`)
- **Heatmaps:** Visualize city issues and analytics (`src/pages/Heatmaps.tsx`)
- **Volunteer Activities:** Join and track local events (`src/pages/VolunteerActivities.tsx`)
- **Redeem Points:** Exchange points for rewards or donate to NGOs (`src/pages/RedeemPoints.tsx`)
- **Badges:** Track achievements and gamification progress (`src/pages/Badges.tsx`)
- **Documents:** Access city resources and important documents (`src/pages/Documents.tsx`)
- **Reusable UI:** 40+ shadcn/ui-based components in `src/components/ui/`
- **Context & Hooks:** Points management, toast notifications, mobile detection, etc.

---

## 🛠️ Scripts

- `npm run dev` – Start frontend in development mode
- `npm run build` – Build frontend for production
- `npm run preview` – Preview production build
- `cd backend && npm run dev` – Start backend in development mode

---

## 📝 API Endpoints (Backend)

- `POST /api/chatbot/chat` – AI chatbot
- `POST /api/detect-image` – AI image authenticity detection
- `GET /api/chatbot/posts/location/:location` – Posts by location
- `GET /api/chatbot/posts/category/:category` – Posts by category
- `GET /api/chatbot/posts/summary` – Recent posts summary

---

## 🌐 Deployment

- Deploy frontend (Vite) to Vercel, Netlify, or your preferred host.
- Deploy backend (Node.js) to Render, Railway, or your preferred host.
- Set environment variables in your deployment platform.

