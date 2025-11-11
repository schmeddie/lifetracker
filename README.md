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

### Required Software
1. **Node.js (v18 or higher)** - [Download here](https://nodejs.org/)
2. **PostgreSQL (v14 or higher)** - [Download here](https://www.postgresql.org/download/)
3. **Git** (for cloning) - [Download here](https://git-scm.com/downloads)

### Installation Check
After installing, verify in your terminal:
```bash
node --version    # Should show v18 or higher
npm --version     # Should show 9.0 or higher
psql --version    # Should show PostgreSQL 14 or higher
```

---

## 🪟 Windows Setup (Step-by-Step)

### Step 1: Install PostgreSQL

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. **IMPORTANT**: Remember the password you set for the `postgres` user!
4. Keep the default port: `5432`
5. Complete the installation

### Step 2: Create Database

**Option A - Using pgAdmin (Easiest for Windows):**
1. Open pgAdmin (installed with PostgreSQL)
2. Enter your postgres password
3. Right-click "Databases" → "Create" → "Database"
4. Name it: `lifetracker`
5. Click "Save"

**Option B - Using Command Line:**
```bash
# Open Command Prompt or PowerShell
psql -U postgres
# Enter your postgres password when prompted
```

Then type:
```sql
CREATE DATABASE lifetracker;
\q
```

### Step 3: Clone and Install

Open Command Prompt or PowerShell in your projects folder:

```bash
# Clone the repository
git clone <repository-url>
cd lifetracker

# Install all dependencies (this takes a few minutes)
npm install
cd client
npm install
cd ../server
npm install
cd ..
```

### Step 4: Configure Environment

```bash
# Go to server folder
cd server

# Copy the example file (Windows)
copy .env.example .env

# Now edit the .env file
notepad .env
```

**Edit these values in the .env file:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/lifetracker?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=change-this-to-any-random-string-you-want
JWT_EXPIRES_IN=7d
```

**Replace `YOUR_PASSWORD_HERE` with your actual PostgreSQL password!**

Save and close Notepad.

### Step 5: Set Up Database Tables

```bash
# Make sure you're in the server folder
# If not: cd server

# Create database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

If you see any errors about the database not existing, go back to Step 2.

### Step 6: Start the Application

```bash
# Go back to project root
cd ..

# Start both frontend and backend
npm run dev
```

**You should see:**
- ✓ Server running on http://localhost:3001
- ✓ Frontend running on http://localhost:3000

Open your browser and go to: **http://localhost:3000**

---

## 🍎 Mac/Linux Setup (Quick)

### Step 1: Install PostgreSQL
```bash
# Mac (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 2: Create Database
```bash
createdb lifetracker
```

### Step 3: Install and Configure
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Configure environment
cd server
cp .env.example .env
nano .env  # or use your preferred editor
```

Edit the DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifetracker?schema=public"
```

### Step 4: Set Up Database
```bash
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### Step 5: Run
```bash
npm run dev
```

Visit: http://localhost:3000

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

### ❌ "psql is not recognized" (Windows)
**Problem**: PostgreSQL not in your system PATH

**Solution**:
1. Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\15\bin`)
2. Add it to your PATH:
   - Search Windows for "Environment Variables"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit" → "New"
   - Add: `C:\Program Files\PostgreSQL\15\bin` (adjust version number)
   - Click OK on all windows
   - **Restart your terminal**

**OR** just use pgAdmin (GUI) - easier!

### ❌ "Database does not exist"
**Problem**: Database wasn't created

**Solution**:
1. Open pgAdmin
2. Create database named `lifetracker`
3. Run migrations again: `cd server` then `npx prisma migrate dev --name init`

### ❌ "Port 3000 is already in use"
**Problem**: Another app is using port 3000 or 3001

**Windows Solution**:
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

**Or change the port**:
- Frontend: Edit `client/vite.config.ts` and change `port: 3000` to `port: 3005`
- Backend: Edit `server/.env` and change `PORT=3001` to `PORT=3002`

### ❌ "Cannot connect to database"
**Problem**: Wrong password or PostgreSQL not running

**Solution**:
1. Check PostgreSQL is running:
   - Windows: Open Services → Find "postgresql" → Should say "Running"
   - Or open pgAdmin - if it connects, PostgreSQL is running
2. Check your password in `server/.env` matches your PostgreSQL password
3. Make sure the database exists (should see `lifetracker` in pgAdmin)

### ❌ "Module not found" errors
**Problem**: Dependencies not installed properly

**Solution**:
```bash
# Windows - delete node_modules folders
cd lifetracker
rmdir /s /q node_modules
cd client
rmdir /s /q node_modules
cd ../server
rmdir /s /q node_modules
cd ..

# Reinstall everything
npm install
cd client
npm install
cd ../server
npm install
cd ..
```

### ❌ "Prisma Client did not initialize yet"
**Problem**: Prisma client not generated

**Solution**:
```bash
cd server
npx prisma generate
cd ..
```

### ❌ Application starts but shows blank page
**Problem**: Frontend can't reach backend

**Solution**:
1. Make sure BOTH servers are running (you should see two terminals/command prompts)
2. Backend should show: "Server running on http://localhost:3001"
3. Frontend should show: "Local: http://localhost:3000"
4. Open browser to http://localhost:3000 (not 3001)

### ❌ "git is not recognized"
**Problem**: Git not installed

**Solution**:
1. Download Git from: https://git-scm.com/downloads
2. Install it
3. Restart your terminal
4. Try again

### 🆘 Still Having Issues?

1. **Make sure PostgreSQL is running**
   - Windows: Check Services or pgAdmin
   - Mac: `brew services list`
   - Linux: `sudo systemctl status postgresql`

2. **Verify all prerequisites are installed**:
   ```bash
   node --version    # Should show v18+
   npm --version     # Should show 9+
   psql --version    # Should show PostgreSQL 14+
   ```

3. **Check the terminal output for specific error messages**
   - Red text usually indicates the problem
   - Copy the error and search online if needed

4. **Common Windows Issues**:
   - Use Command Prompt or PowerShell (not Git Bash for npm commands)
   - Run as Administrator if you get permission errors
   - Disable antivirus temporarily if it's blocking Node.js

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
