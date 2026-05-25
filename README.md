# 💰 ExpensePro — Full Stack Expense Tracker

A premium full-stack expense tracking application with beautiful dark glassmorphism UI, JWT authentication, MongoDB Atlas database, and interactive charts.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS + Custom CSS (Glassmorphism) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Mongoose) |
| Charts | Recharts (Pie, Bar, Area) |
| Authentication | JWT (JSON Web Tokens) |
| Currency | ₹ Indian Rupee (INR) |

---

## ⚙️ Setup Instructions

### Step 1: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/expensepro`
4. Open `server/.env` and replace `MONGO_URI`:
```
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster.mongodb.net/expensepro?retryWrites=true&w=majority
```

### Step 2: Start the Backend

Open a terminal in the project root:
```bash
cd server
node server.js
```

You should see:
```
✅ MongoDB Atlas connected
🚀 Server running on http://localhost:5000
```

### Step 3: Start the Frontend

Open another terminal:
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
expense-tracker/
│
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── BalanceCard.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── ChartSection.jsx
│   │   │   └── CategoryBadge.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── TransactionContext.jsx
│   │   ├── hooks/
│   │   │   └── useLocalStorage.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   └── categories.js
│   │   └── index.css
│   └── vite.config.js
│
└── server/                    # Node.js + Express Backend
    ├── models/
    │   ├── User.js
    │   └── Transaction.js
    ├── routes/
    │   ├── auth.js
    │   └── transactions.js
    ├── controllers/
    │   ├── authController.js
    │   └── transactionController.js
    ├── middleware/
    │   └── auth.js
    ├── server.js
    └── .env                   ← Add your MONGO_URI here!
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, Login, Logout
- 💰 **Add Income & Expenses** — With 19 categories
- 🗑️ **Delete Transactions** — With confirmation
- 🔍 **Search & Filter** — By type (All/Income/Expense)
- 📊 **3 Chart Types** — Category Pie, Monthly Bar, Spending Trend Area
- 💳 **Balance Dashboard** — Live income, expense, balance with savings rate bar
- 📱 **Fully Responsive** — Mobile + Desktop layouts
- 🎨 **Dark Glassmorphism UI** — Premium animated design

---

## 🛡️ API Endpoints

### Auth
| Method | URL | Access |
|--------|-----|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Transactions
| Method | URL | Access |
|--------|-----|--------|
| GET | `/api/transactions` | Private |
| POST | `/api/transactions` | Private |
| DELETE | `/api/transactions/:id` | Private |
| GET | `/api/transactions/stats/monthly` | Private |
| GET | `/api/transactions/stats/categories` | Private |
