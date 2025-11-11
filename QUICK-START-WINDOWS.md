# LifeTracker - Quick Start Guide (Windows)

## Super Simple Setup (5 Steps)

### Prerequisites
1. Install Node.js: https://nodejs.org/ (download the LTS version)
2. Install PostgreSQL: https://www.postgresql.org/download/windows/
   - **Remember the password you set!**

---

## Step-by-Step Setup

### 1. Create the Database
- Open **pgAdmin** (comes with PostgreSQL)
- Enter your postgres password
- Right-click **Databases** → **Create** → **Database**
- Name it: `lifetracker`
- Click **Save**

### 2. Run Setup Script
Open Command Prompt in the `lifetracker` folder and run:
```bash
setup-windows.bat
```

This will:
- Install all dependencies
- Create a `.env` file

### 3. Edit Configuration
When Notepad opens automatically:
- Find this line: `DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/lifetracker?schema=public"`
- Replace `YOUR_PASSWORD_HERE` with your actual PostgreSQL password
- Save and close

### 4. Setup Database Tables
```bash
setup-database.bat
```

### 5. Start the App
```bash
start-app.bat
```

Open your browser to: **http://localhost:3000**

---

## Having Issues?

### "psql is not recognized"
That's OK! Just use pgAdmin to create the database (Step 1)

### "Cannot connect to database"
- Make sure PostgreSQL is running (check Services or pgAdmin)
- Check your password in `server\.env` is correct
- Make sure the database `lifetracker` exists in pgAdmin

### "Port 3000 is already in use"
Something else is using that port. Either:
1. Close the other app
2. Or run: `netstat -ano | findstr :3000` then `taskkill /PID <number> /F`

### Still stuck?
Check the full README.md for detailed troubleshooting!

---

## Daily Usage

After setup, just run:
```bash
start-app.bat
```

Then go to: http://localhost:3000

Press `Ctrl+C` in the terminal to stop the app.
