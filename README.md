# Expense Tracker
A modern, full-stack personal finance application built with the MERN stack (MongoDB, Express, React, Node.js). It provides real-time income and expense tracking, category breakdowns, financial health summaries, interactive monthly analytics, and user account management with cascade deletion.

# Features

1. Financial Analytics & Dashboard
   Live Financial Summaries : Instant calculation of Total Balance, Monthly Income, and Monthly Expenses.
   Categorical Breakdown : Dynamic categorization (Food, Transport, Utilities, Housing, Entertainment, etc.) with proportional spending distribution.
   6-Month Trend Visualizer : Continuous monthly trend charts showing income vs. expense patterns over time.
   Recent Transactions : Real-time stream of latest ledger entries with pagination, date filters, and multi-field text search.

2. Authentication & Profile Management
   JWT-Based Authentication : Protected endpoints with token-based access and bcrypt password hashing.
   In-Modal Password Reset : Built-in email verification and direct password update workflow without external mail dependencies.
   Inline Account Management : Slide-out modal to edit full name, update passwords on demand, or permanently delete the account.
   Cascade Deletion : Automatically purges all associated transactions from MongoDB when a user account is deleted, preventing orphaned records.

3. Production & Security Optimizations
   Database Indexing : Compound indexes on (user, date), (user, type, category), and full-text indexes for search.
   Aggregation Pipelines : Multi-faceted MongoDB aggregation queries to process summaries on the database engine.
   Security Hardening : Rate limiting on auth endpoints with express-rate-limit, secure HTTP headers with helmet, and payload size restrictions.

# Tech Stack

1. Frontend : React (SPA), React Router, Context API, CSS3 Modules / Custom Dark Theme
2. Backend : Node.js, Express.js, Express Validator
3. Database : MongoDB, Mongoose ODM
4. Security : JSON Web Tokens (JWT), Bcrypt.js, Helmet, Express Rate Limit
   
# Project Structure

expense-tracker/
├── backend/
│ ├── config/
│ │ └── db.js # Database connection setup
│ ├── controllers/
│ │ ├── authController.js # Auth, password reset & profile handlers
│ │ ├── dashboardController.js# Aggregation & chart data
│ │ └── transactionController.js # Transaction CRUD & filters
│ ├── middleware/
│ │ └── auth.js # JWT verification & lean user hydration
│ ├── models/
│ │ ├── Transaction.js # Transaction schema & compound indexes
│ │ └── User.js # User schema, bcrypt hooks & cascade pre-hook
│ ├── routes/
│ │ ├── auth.js # Authentication & profile routes
│ │ ├── dashboard.js # Analytics routes
│ │ └── transactions.js # Transaction endpoints
│ ├── server.js # App configuration & middleware chain
│ └── package.json
│
└── frontend/
├── src/
│ ├── context/
│ │ └── AuthContext.jsx # Global session state provider
│ ├── pages/
│ │ ├── DashboardPage.jsx # Analytics and summary view
│ │ ├── LoginPage.jsx # Login form & verification modal
│ │ ├── RegisterPage.jsx # New user sign-up
│ │ ├── ResetPasswordPage.jsx
│ │ └── TransactionsPage.jsx # Full transaction ledger & filters
│ ├── utils/
│ │ └── api.js # Axios client & centralized endpoint map
│ ├── App.jsx # Navigation layout, sidebar & routes
│ └── App.css # Shared styling & dark UI theme
└── package.json


Getting Started
- Prerequisites
- 1. Node.js (v16 or higher)
  2. MongoDB running locally on port 00000 or a MongoDB Atlas URI. (Port changes)

# Backend Setup
Navigate to the backend directory:

1. Bash
cd backend
Install dependencies:

2. Bash
npm install
Configure environment variables by creating a .env file in the backend/ root:

Code snippet
PORT=8000
MONGO_URI=mongodb://localhost:portnumber/claustername
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
Start the server:

3. Bash
npm run dev

Or standard node runner

node server.js
The backend will be live at http://localhost:8000.

# Frontend Setup
Open a new terminal and navigate to the frontend directory:

1. Bash
cd frontend
Install dependencies:

2. Bash
npm install
Start the React development server:

3. Bash
npm start
The frontend will run at http://localhost:3000.

# API Reference

Authentication & Account (/api/auth)

Method Endpoint Access Description

POST /api/auth/register Public Register a new user account
POST /api/auth/login Public Authenticate user & return JWT
POST /api/auth/verify-email Public Verify if an email address exists
POST /api/auth/direct-reset-password Public Reset password for verified account
GET /api/auth/me Protected Fetch current user session details
PUT /api/auth/update-profile Protected Update name or change account password
DELETE /api/auth/delete-account Protected Delete user account & cascade wipe all records

Transactions (/api/transactions)

Method Endpoint Access Description

GET /api/transactions Protected Get paginated, filtered, & searched transactions
GET /api/transactions/:id Protected Fetch a single transaction entry
POST /api/transactions Protected Create a new income or expense transaction
PUT /api/transactions/:id Protected Update an existing transaction
DELETE /api/transactions/:id Protected Delete a single transaction entry

Dashboard Analytics (/api/dashboard)

Method Endpoint Access Description

GET /api/dashboard Protected Aggregate totals, month balance, categories, & trends

# Author : Snehith Amirishetty
# Live Link:
