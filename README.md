# LifeTracker

A secure, full-stack, mobile-responsive web application for personal goal tracking, habit streaks, and mood logging with a clean, minimalist UI.

## Features

### Core Functionality
- **User Authentication**: Secure sign-up and login with JWT tokens and bcrypt password hashing
- **Daily Mood Logging**: Track your mood on a 5-point scale with optional journaling (max 500 characters)
- **Goal Tracking**: Create and manage three types of goals:
  - **Habit Goals**: Binary yes/no tracking (e.g., "Worked Out") with streak counting
  - **Metric Goals**: Numerical value tracking (e.g., "Run 50 km") with progress bars
  - **Time Goals**: Duration tracking (e.g., "Meditate 600 minutes") with progress visualization
- **Streak Check-in**: Log daily progress with a single click on the dashboard
- **Calendar**: Pre-populated with UK Public Holidays (2025-2026) and custom event creation
- **Rewards System**: Earn badges for milestone streaks:
  - 🥉 Bronze: 7 days
  - 🥈 Silver: 30 days
  - 🥇 Gold: 100 days
  - 💎 Platinum: 365 days
- **Insights Dashboard**: Visual correlation graph showing mood vs goal completion rate
- **Data Export**: One-click CSV export of all user data

### Design Specifications
- **Color Palette**:
  - Background: `#FFFFFF` (White)
  - Primary Text: `#1D2C3B` (Dark Blue)
  - Accent/Success: `#8194A8` (Muted Blue/Grey)
  - Secondary Text: `#3E4B58`
  - Dividers: `#E3E3F1`
  - Hover State: `#BDD5EA`
- **UI/UX**: Clean, minimalist, highly scannable interface
- **Mobile-First**: Fully responsive design optimized for mobile and desktop

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens + bcrypt
- **Validation**: Zod

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (custom color palette)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd lifetracker
```

### 2. Install dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Set up the database

Create a PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE lifetracker;
\q
```

### 4. Configure environment variables

Create a `.env` file in the `server` directory:
```bash
cd server
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/lifetracker?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 5. Run database migrations

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```

Or run them separately:

**Backend** (runs on http://localhost:3001):
```bash
cd server
npm run dev
```

**Frontend** (runs on http://localhost:3000):
```bash
cd client
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user info (authenticated)

### Goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals` - Get all user goals (query: `?active=true`)
- `GET /api/goals/:id` - Get specific goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Progress
- `POST /api/progress` - Log progress for a goal
- `GET /api/progress/:goalId` - Get progress history (query: `?startDate=...&endDate=...`)

### Mood Logging
- `POST /api/mood` - Log daily mood and journal entry
- `GET /api/mood` - Get mood logs (query: `?startDate=...&endDate=...`)
- `GET /api/mood/insights/data` - Get insights data (query: `?days=30`)

### Calendar
- `POST /api/calendar` - Create custom event
- `GET /api/calendar` - Get all events (query: `?startDate=...&endDate=...`)
- `DELETE /api/calendar/:id` - Delete custom event

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all user categories
- `DELETE /api/categories/:id` - Delete category

### Rewards
- `GET /api/rewards` - Get all user badges

### Data Export
- `GET /api/export` - Export all user data as CSV

## Database Schema

### Models
- **User**: Authentication and user profile
- **Goal**: Goal definitions with type (HABIT/METRIC/TIME)
- **Category**: User-defined categories for organizing goals
- **GoalProgress**: Daily progress logs for goals
- **DailyLog**: Daily mood and journal entries
- **CalendarEvent**: UK holidays and custom events
- **UserReward**: Earned badges and milestones

See `server/prisma/schema.prisma` for full schema details.

## Project Structure

```
lifetracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Main application pages
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # API client and utilities
│   │   ├── App.tsx        # Main app component with routing
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles + Tailwind
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Auth middleware
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # JWT, password, validation
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── package.json           # Root package (workspace)
└── README.md
```

## Usage Guide

### Getting Started
1. **Sign up** for a new account or **login** if you already have one
2. Navigate to the **Dashboard** - your daily landing page

### Daily Routine (Morning)
1. **Log your mood** using the 5-point scale
2. Optionally add a **quick journal note** (max 500 characters)
3. **Check in on your goals** - click "Log +1" for each goal you've completed
4. Earn **badges** automatically when you hit streak milestones

### Managing Goals
1. Go to the **Goals** page
2. Click **"+ New Goal"** to create a goal:
   - Choose goal type: Habit, Metric, or Time
   - Set targets for Metric/Time goals
   - Optionally assign to a category
3. Track progress through **progress bars** and **streak counters**
4. **Pause** or **Delete** goals as needed

### Calendar
1. View UK Public Holidays (pre-loaded)
2. Click any date to add a **custom event**
3. See all events for the current month
4. Delete custom events as needed

### Insights
1. View the **correlation graph** showing mood vs goal completion
2. Adjust the time range (7, 14, 30, 60, or 90 days)
3. See your **average mood** and **completion rate**
4. View all earned **badges**

### Data Export
- Click **"Export Data"** in the header to download a CSV file containing:
  - All goals and their progress
  - Mood logs and journal entries
  - Earned badges
  - Calendar events

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Token stored in localStorage (HttpOnly cookies recommended for production)
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM
- CORS enabled for cross-origin requests
- Environment variables for sensitive data

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `npx prisma migrate dev` to apply migrations

### Port Conflicts
- Backend default: 3001 (change in `server/.env`)
- Frontend default: 3000 (change in `client/vite.config.ts`)

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Regenerate Prisma client: `cd server && npx prisma generate`

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Goal templates library
- [ ] Social sharing of achievements
- [ ] Mobile app (React Native)
- [ ] Dark mode toggle
- [ ] Advanced analytics and insights
- [ ] Goal reminders and notifications
- [ ] Collaboration features (share goals with friends)

## License

ISC

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ for personal growth and habit tracking
