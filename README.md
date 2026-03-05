# FinWeave 💰🌟

**Financial Inclusion Platform for Low-Income & Underbanked Communities**

FinWeave is a comprehensive fintech platform designed to improve financial literacy, savings, and financial planning for underserved communities. Built with React, Node.js, Express, and MongoDB.

![FinWeave Banner](https://img.shields.io/badge/FinWeave-Financial%20Inclusion-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)

## 🌟 Features

### 1. User Authentication
- Secure JWT-based login/signup
- User profile management
- Income type and financial goals storage

### 2. Smart Onboarding
- Language selection (8+ Indian languages)
- Income type configuration (daily/weekly/monthly)
- Financial goals setting
- Daily savings target

### 3. Financial Dashboard
- Financial health score
- Income & spending summary
- Savings progress tracking
- AI-powered financial suggestions

### 4. Financial Twin (Prediction Engine)
- Savings growth predictions
- Interactive simulation with sliders
- Scenario comparison (Conservative/Moderate/Aggressive)
- Goal timeline visualization

### 5. Micro-Savings System
- Set daily savings targets
- Track multiple goals
- Visual progress bars
- Quick save buttons

### 6. Community Credit System
- Trust score tracking
- Community leaderboard
- Savings groups

### 7. Voice Finance Assistant (Mock AI)
- Chat interface with AI assistant
- Pre-built financial advice
- Quick question buttons
- Simulated voice input

### 8. Financial Education Hub
- Bite-sized lessons
- Budgeting guidance (50-30-20 rule)
- Daily finance tips

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS**
- **Chart.js** for financial graphs
- **React Router** for navigation

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📁 Project Structure

```
finweave/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FinancialTwin.jsx
│   │   │   ├── MicroSavings.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Education.jsx
│   │   │   └── Goals.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Express backend
│   ├── server.js            # Main server file
│   └── package.json
├── package.json              # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Deva1559/finweave.git
   cd finweave
   ```

2. **Install all dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up MongoDB**
   - Option A: Use local MongoDB
     ```bash
     # Make sure MongoDB is running locally
     mongod
     ```
   - Option B: Use MongoDB Atlas
     ```env
     # Create .env file in backend/
     MONGO_URI=your_mongodb_connection_string
     ```

4. **Start the application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5000
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

### Using the Application

1. **Sign Up** - Create a new account
2. **Onboarding** - Set your language, income, and goals
3. **Dashboard** - View your financial overview
4. **Financial Twin** - Predict your savings growth
5. **Micro Savings** - Set and track savings goals
6. **Community** - See leaderboard and join groups
7. **AI Assistant** - Get financial advice
8. **Education** - Learn financial literacy

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Financial Twin
- `POST /api/financial-twin/predict` - Get savings predictions

### Transactions
- `POST /api/transactions` - Add transaction
- `GET /api/transactions` - Get all transactions

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals/:id/progress` - Update goal progress

### Community
- `GET /api/community/leaderboard` - Get leaderboard

### AI Assistant
- `POST /api/ai/chat` - Get AI response

### Education
- `GET /api/education/content` - Get education content

## 🎨 UI Design

- **Mobile responsive** design
- **Large buttons** for easy interaction
- **Visual indicators** and progress bars
- **Charts and graphs** for data visualization
- **Beginner-friendly** interface

### Color Scheme
- 🟢 **Green** - Financial growth
- 🔵 **Blue** - Trust
- ⚪ **White** - Clean interface

## 📱 Demo Credentials

```
Email: demo@finweave.com
Password: demo123
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finweave
JWT_SECRET=your_secret_key
```

### Frontend Configuration

The frontend is configured to proxy API requests to the backend in `vite.config.js`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Built for financial inclusion
- Designed for hackathons
- Inspired by real-world fintech solutions

---

**FinWeave - Financial Inclusion for All** 🌟💰

