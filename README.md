# 💰 BellCorp Expense Tracker

A full-featured Personal Expense Tracker built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (with Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |

---

## 📁 Project Structure

```
bellcorp-expense-tracker/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   ├── transactionController.js  # Full CRUD + search/filter
│   │   └── dashboardController.js   # Aggregated stats
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/
│   │   ├── User.js            # User schema with bcrypt
│   │   └── Transaction.js     # Transaction schema + indexes
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── dashboard.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.js        # App shell
    │   │   │   └── Sidebar.js       # Collapsible sidebar nav
    │   │   └── transactions/
    │   │       └── TransactionModal.js  # Add/Edit modal
    │   ├── context/
    │   │   └── AuthContext.js       # Auth state + token management
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js     # Charts + summary
    │   │   └── TransactionsPage.js  # Full explorer
    │   ├── utils/
    │   │   └── api.js               # Axios helpers + constants
    │   ├── App.js                   # Routes + Protected routes
    │   ├── index.css                # Global design system
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bellcorp_expense_tracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Start the App

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev    # uses nodemon for hot-reload
# or: npm start
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm start
```

App runs at: **https://expensetrackerbysnehith.netlify.app/**  

---

## 🔑 Features Implemented

### Authentication
- ✅ User Registration (name, email, password with bcrypt hashing)
- ✅ User Login (JWT token issued)
- ✅ Protected routes (frontend + backend middleware)
- ✅ Persistent login via localStorage token
- ✅ Auto-logout on invalid/expired token

### Transaction Management
- ✅ Add transaction (title, amount, category, date, notes, type)
- ✅ Edit transaction (pre-filled form, inline validation)
- ✅ Delete transaction (confirmation modal)
- ✅ View transaction details (click any row)
- ✅ Expense / Income type toggle

### Transaction Explorer (Scalable)
- ✅ **Server-side pagination** (15 per page, dynamic nav)
- ✅ **Debounced text search** (400ms, title/notes/category)
- ✅ **Filter by category** (13 categories)
- ✅ **Filter by type** (expense/income)
- ✅ **Date range filter** (from/to)
- ✅ **Sort options** (date asc/desc, amount asc/desc)
- ✅ **Active filter chips** with individual remove
- ✅ **Empty state handling** for no results
- ✅ **Skeleton loaders** during data fetch
- ✅ **UI state preservation** during navigation

### Dashboard
- ✅ Total balance, income, expenses stats
- ✅ Current month summary
- ✅ Category breakdown (pie chart with percentages)
- ✅ 6-month income vs expenses trend (area chart)
- ✅ Recent 5 transactions preview

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List with pagination/search/filters |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

**Query params for GET /api/transactions:**
- `page`, `limit` — pagination
- `search` — text search (title, notes, category)
- `category` — filter by category
- `type` — expense | income
- `startDate`, `endDate` — date range (ISO)
- `minAmount`, `maxAmount` — amount range
- `sortBy` — field name (date, amount)
- `sortOrder` — asc | desc

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Summary, categories, recent, trend |

---

## 🏷️ Transaction Categories
Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Housing, Education, Travel, Personal Care, Investment, Income, Other

---

## 🛡️ Security Features
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with configurable expiry
- All transaction routes scoped to authenticated user
- Input validation with express-validator
- CORS configured for frontend origin
