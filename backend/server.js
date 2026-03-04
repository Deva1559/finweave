const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const fetch = require('node-fetch');

// NTFY Configuration
const NTFY_TOPIC = 'finweave-alerts';

// OneSignal Configuration
const ONE_SIGNAL_APP_ID = '55438fb8-c6cf-41fb-8b05-bde20d91628e';
const ONE_SIGNAL_REST_API_KEY = 'os_v2_app_kvby7oggz5a7xcyfxxra3elcrz2jpc7xapoea6e6wo46wvs25gka5mcjayvdjkner3ffd7mapbou2awbg3x6lipfn42lmjtonrbbhqy';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyD2R-EAUFN4jpUCDGWuQpYPP9v8JGxIWHQ';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();
const PORT = process.env.PORT || 5002;
const JWT_SECRET = 'finweave_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (using local MongoDB)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finweave';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  language: { type: String, default: 'English' },
  incomeType: { type: String, default: 'daily' },
  income: { type: Number, default: 0 },
  dailySavings: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  financialGoals: [String],
  trustScore: { type: Number, default: 50 },
  savingsGroups: [{ type: String }],
  oneSignalPlayerId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema - Store date as string to avoid timezone issues
const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: { type: String, enum: ['income', 'expense', 'savings'] },
  amount: Number,
  description: String,
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

// Goal Schema
const goalSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  targetAmount: Number,
  currentAmount: { type: Number, default: 0 },
  deadline: Date,
  completed: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Goal = mongoose.model('Goal', goalSchema);

// Import Investment routes
const investmentRoutes = require('./routes/investments');

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== ROUTES ====================

// 1. Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, language, incomeType, income, financialGoals } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      language,
      incomeType,
      income,
      financialGoals: financialGoals || []
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      message: 'User created successfully', 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        language: user.language,
        incomeType: user.incomeType,
        income: user.income,
        trustScore: user.trustScore
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        language: user.language,
        incomeType: user.incomeType,
        income: user.income,
        dailySavings: user.dailySavings,
        financialGoals: user.financialGoals,
        trustScore: user.trustScore,
        savingsGroups: user.savingsGroups
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// 2. User Profile Routes
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { language, incomeType, income, dailySavings, financialGoals } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { language, incomeType, income, dailySavings, financialGoals },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Save OneSignal Player ID endpoint
app.post('/api/user/onesignal-id', authMiddleware, async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    await User.findByIdAndUpdate(req.userId, { oneSignalPlayerId: playerId });
    console.log('✅ OneSignal Player ID saved for user:', req.userId);
    res.json({ message: 'OneSignal ID saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving OneSignal ID' });
  }
});

// 3. Dashboard Routes
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
    const goals = await Goal.find({ userId: req.userId });
    
    // Calculate financial health score
    let healthScore = 50;
    if (user.dailySavings > 0) healthScore += 20;
    if (transactions.length > 0) healthScore += 15;
    if (user.trustScore > 70) healthScore += 15;
    
    // Calculate summaries - using string date comparison
    const incomeTotal = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const savingsTotal = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate wallet balance: Income - Expenses (savings is separate)
    const calculatedWalletBalance = incomeTotal - expenseTotal;
    
    // Calculate today's spending using string date comparison
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySpending = transactions
      .filter(t => t.type === 'expense' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate average daily spending (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const recentExpenses = transactions
      .filter(t => t.type === 'expense' && t.date >= sevenDaysAgoStr);
    
    const totalRecentExpenses = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const avgDailySpending = recentExpenses.length > 0 ? totalRecentExpenses / 7 : 0;
    
    // Generate spending insight notification and send NTFY push
    let spendingInsight = null;
    if (todaySpending > 0 && avgDailySpending > 0 && todaySpending < avgDailySpending * 0.5) {
      const savedAmount = avgDailySpending - todaySpending;
      spendingInsight = {
        type: 'success',
        title: '🎉 Great job saving today!',
        message: `You spent only ₹${todaySpending} today, which is ₹${Math.round(savedAmount)} less than your average!`,
        savedAmount: Math.round(savedAmount),
        suggestions: [
          `Add ₹${Math.round(savedAmount)} to your emergency fund`,
          `Put it in your recurring deposit`,
          `Invest in a short-term SIP`
        ]
      };
    } else if (avgDailySpending > 0 && todaySpending > avgDailySpending * 1.5) {
      spendingInsight = {
        type: 'warning',
        title: '⚠️ High spending today',
        message: `You've spent ₹${todaySpending} today, which is higher than your daily average of ₹${Math.round(avgDailySpending)}.`,
        suggestions: [
          'Review your transactions',
          'Avoid impulse purchases',
        ]
      };
    }
    
    // AI Suggestions
    const suggestions = generateAISuggestions(user, incomeTotal, expenseTotal);
    
    res.json({
      user: {
        name: user.name,
        trustScore: user.trustScore,
        dailySavings: user.dailySavings,
        walletBalance: calculatedWalletBalance
      },
      financialHealthScore: Math.min(healthScore, 100),
      incomeSummary: {
        total: incomeTotal,
        monthly: user.income,
        type: user.incomeType
      },
      spendingSummary: {
        total: expenseTotal,
        recent: transactions.filter(t => t.type === 'expense').slice(0, 5)
      },
      walletBalance: calculatedWalletBalance,
      savingsProgress: {
        total: savingsTotal,
        daily: user.dailySavings,
        monthly: user.dailySavings * 30,
        yearly: user.dailySavings * 365
      },
      goals: goals,
      transactions: transactions.slice(0, 10),
      aiSuggestions: suggestions,
      spendingInsight: spendingInsight
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard', error: err.message });
  }
});

// 4. Financial Twin (Prediction Engine)
app.post('/api/financial-twin/predict', authMiddleware, async (req, res) => {
  try {
    const { dailySavings, monthlyContribution, goalAmount, months } = req.body;
    const user = await User.findById(req.userId);
    
    const currentSavings = await Transaction.find({ 
      userId: req.userId, 
      type: 'savings' 
    }).then(txs => txs.reduce((sum, t) => sum + t.amount, 0));
    
    // Calculate predictions
    const daily = dailySavings || user.dailySavings || 0;
    const monthly = monthlyContribution || daily * 30;
    
    // Generate prediction data points
    const predictions = [];
    for (let i = 0; i <= 12; i++) {
      const amount = currentSavings + (monthly * i);
      predictions.push({
        month: i,
        amount: Math.round(amount),
        label: `Month ${i}`
      });
    }
    
    // Calculate time to reach goal
    const monthsToGoal = goalAmount ? Math.ceil((goalAmount - currentSavings) / monthly) : null;
    
    res.json({
      currentSavings,
      monthlyContribution: monthly,
      predictions,
      goalAmount,
      monthsToGoal,
      projection: {
        monthly: currentSavings + monthly,
        yearly: currentSavings + (monthly * 12),
        after3Years: currentSavings + (monthly * 36)
      },
      scenarios: [
        { name: 'Conservative', multiplier: 1, description: 'Maintain current savings rate' },
        { name: 'Moderate', multiplier: 1.5, description: 'Increase savings by 50%' },
        { name: 'Aggressive', multiplier: 2, description: 'Double your savings rate' }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating prediction' });
  }
});

// 5. Transaction Routes
app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    let { type, amount, description, date } = req.body;
    
    // Convert type to lowercase to match schema enum
    type = type.toLowerCase();
    
    // Store date as string in YYYY-MM-DD format
    const transactionDate = date || new Date().toISOString().split('T')[0];
    
    console.log('Creating transaction:', { type, amount, description, date: transactionDate });
    
    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount: Number(amount),
      description,
      date: transactionDate
    });
    
    await transaction.save();
    
    // Update user trust score and wallet balance
    const updateObj = { $inc: { trustScore: type === 'savings' ? 2 : 0.5 } };
    
    // Update wallet balance based on transaction type (savings doesn't affect wallet)
    if (type === 'income') {
      updateObj.$inc.walletBalance = amount;
    } else if (type === 'expense') {
      updateObj.$inc.walletBalance = -amount;
    }
    
    await User.findByIdAndUpdate(req.userId, updateObj);
    
    const updatedUser = await User.findById(req.userId);
    
    // Check spending comparison and send notification if needed (only for expenses)
    if (type === 'expense') {
      setTimeout(() => {
        checkAndSendSpendingNotification(req.userId, transactionDate);
      }, 1000); // Small delay to ensure transaction is saved
    }
    
    res.status(201).json({
      ...transaction.toObject(),
      walletBalance: updatedUser.walletBalance
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating transaction' });
  }
});

app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Get transactions for a specific month (for calendar view)
app.get('/api/transactions/month/:year/:month', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    
    const transactions = await Transaction.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: -1 });
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching monthly transactions' });
  }
});

// 6. Goals Routes
app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const { name, targetAmount, deadline } = req.body;
    const goal = new Goal({
      userId: req.userId,
      name,
      targetAmount,
      deadline
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Error creating goal' });
  }
});

app.get('/api/goals', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

app.put('/api/goals/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findById(req.params.id);
    
    if (!goal || goal.userId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true;
    }
    
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Error updating goal' });
  }
});

// 7. Community Routes
app.get('/api/community/leaderboard', authMiddleware, async (req, res) => {
  try {
    const topSavers = await User.find()
      .sort({ trustScore: -1 })
      .limit(10)
      .select('name trustScore dailySavings');
    
    res.json({
      leaderboard: topSavers.map((user, index) => ({
        rank: index + 1,
        name: user.name || `User ${user._id.toString().slice(0, 6)}`,
        trustScore: user.trustScore,
        dailySavings: user.dailySavings
      })),
      yourRank: 5
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// 8. AI Assistant Routes - Using Gemini API
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.userId);
    
    const userContext = `
      User Profile:
      - Name: ${user.name}
      - Income: ₹${user.income} (${user.incomeType})
      - Daily Savings: ₹${user.dailySavings}
      - Trust Score: ${user.trustScore}
      - Financial Goals: ${user.financialGoals?.join(', ') || 'Not set'}
      - Language: ${user.language}
    `;
    
    const systemPrompt = `You are FinWeave AI, a friendly and helpful financial assistant for a fintech app called FinWeave. 
    Your role is to help users with:
    - Personal finance management
    - Savings advice and tips
    - Budget creation and tracking
    - Debt management strategies
    - Investment guidance for beginners
    - Financial goal setting
    
    ${userContext}
    
    Please provide helpful, practical advice in a friendly tone. When giving financial recommendations, always consider the user's income level and suggest realistic solutions. Use Indian Rupees (₹) for currency. Keep responses concise but informative. If you're unsure about specific financial advice, suggest they consult a financial advisor.`;
    
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });
    
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser question: ${message}`);
    const geminiResponse = result.response.text();
    
    res.json({ 
      response: {
        text: geminiResponse,
        action: 'gemini_ai'
      },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Gemini API Error:', err);
    const user = await User.findById(req.userId);
    const fallbackResponse = generateAIResponse(req.body.message, user);
    res.json({ 
      response: fallbackResponse,
      timestamp: new Date()
    });
  }
});

// 9. Education Content Routes
app.get('/api/education/content', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Budgeting 101',
      description: 'Learn how to create a simple budget that works for you',
      category: 'basics',
      tips: ['Track your daily expenses', 'Separate needs from wants', 'Save 20% of your income']
    },
    {
      id: 2,
      title: 'Emergency Fund',
      description: 'Why you need an emergency fund and how to build one',
      category: 'savings',
      tips: ['Start with small amounts', 'Aim for 3-6 months of expenses', 'Keep it separate from daily savings']
    },
    {
      id: 3,
      title: 'Smart Savings',
      description: 'Strategies to maximize your savings without much money',
      category: 'savings',
      tips: ['Save before you spend', 'Use the 50-30-20 rule', 'Automate your savings']
    },
    {
      id: 4,
      title: 'Debt Management',
      description: 'How to manage and pay off debt effectively',
      category: 'debt',
      tips: ['Pay more than minimum', 'Focus on high-interest debt first', 'Consider debt consolidation']
    },
    {
      id: 5,
      title: 'Financial Goals',
      description: 'Set and achieve your financial goals',
      category: 'planning',
      tips: ['Make goals specific and measurable', 'Break big goals into small steps', 'Review progress regularly']
    }
  ]);
});

// ==================== HELPER FUNCTIONS ====================

function generateAISuggestions(user, income, expense) {
  const suggestions = [];
  const savingsRate = income > 0 ? (income - expense) / income : 0;
  
  if (savingsRate < 0.1) {
    suggestions.push({
      type: 'warning',
      title: 'Increase Savings Rate',
      message: 'Your savings rate is below 10%. Try to save at least ₹50 daily for financial security.'
    });
  }
  
  if (user.dailySavings === 0) {
    suggestions.push({
      type: 'info',
      title: 'Start Small',
      message: 'Start with just ₹20 daily. It adds up to ₹600 monthly!'
    });
  }
  
  if (user.trustScore < 70) {
    suggestions.push({
      type: 'success',
      title: 'Build Trust Score',
      message: 'Make regular deposits to increase your community trust score.'
    });
  }
  
  suggestions.push({
    type: 'tip',
    title: 'Use the 50-30-20 Rule',
    message: '50% for needs, 30% for wants, 20% for savings and debt repayment.'
  });
  
  return suggestions;
}

function generateAIResponse(message, user) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return {
      text: `Great question about savings! Based on your income of ₹${user.income} (${user.incomeType}), I recommend saving at least 20% - that's about ₹${Math.round(user.income * 0.2)} ${user.incomeType}. Even saving ₹50 daily can help you reach your goals faster!`,
      action: 'view_savings_tips'
    };
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('spend')) {
    return {
      text: `Here's a simple budget for you:\n\n• Needs (50%): ₹${Math.round(user.income * 0.5)}\n• Wants (30%): ₹${Math.round(user.income * 0.3)}\n• Savings (20%): ₹${Math.round(user.income * 0.2)}\n\nThis simple framework can help you manage your money better!`,
      action: 'create_budget'
    };
  }
  
  if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
    return {
      text: `Setting financial goals is great! To reach a goal of ₹10,000, you could save ₹100 daily for about 3-4 months. Use our Financial Twin to simulate different scenarios!`,
      action: 'open_goals'
    };
  }
  
  const defaultResponses = [
    `That's a great question! Remember, small steps lead to big changes. Your current trust score is ${user.trustScore}. Keep making smart financial decisions!`,
    `I'm here to help! Could you tell me more about what you'd like to know? I can help with savings, budgeting, goals, and more.`,
    `Financial literacy is key to success! Would you like me to show you some educational content about managing money?`
  ];
  
  return {
    text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    action: 'suggest_topics'
  };
}

// NTFY Push Notification Function
function sendNTFYNotification(userId, title, message) {
  const userTopic = `finweave-${userId.toString()}`;
  
  const postData = JSON.stringify({
    topic: userTopic,
    title: title,
    message: message,
    priority: 'high',
    tags: ['money', 'wallet', 'alert']
  });
  
  const options = {
    hostname: 'ntfy.sh',
    port: 443,
    path: `/${userTopic}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };
  
  const req = https.request(options, (res) => {
    console.log('📱 NTFY Notification sent to user:', userId, '- Title:', title);
  });
  
  req.on('error', (e) => {
    console.log('📱 NTFY Error:', e.message);
  });
  
  req.write(postData);
  req.end();
}

// OneSignal Push Notification Function
async function sendOneSignalNotification(playerId, title, message) {
  if (!playerId) {
    console.log('📱 OneSignal: No player ID provided');
    return;
  }
  
  const postData = JSON.stringify({
    app_id: ONE_SIGNAL_APP_ID,
    include_player_ids: [playerId],
    headings: { en: title },
    contents: { en: message },
    url: 'finweave://dashboard'
  });
  
  const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONE_SIGNAL_REST_API_KEY}`,
      'Content-Length': postData.length
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('📱 OneSignal Notification sent - Title:', title);
    });
  });
  
  req.on('error', (e) => {
    console.log('📱 OneSignal Error:', e.message);
  });
  
  req.write(postData);
  req.end();
}

// Check spending comparison and send notification if 2nd day > 1st day
async function checkAndSendSpendingNotification(userId, transactionDate) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.oneSignalPlayerId) {
      console.log('📱 No OneSignal player ID for user:', userId);
      return;
    }
    
    // Get all expenses for the user
    const transactions = await Transaction.find({ 
      userId: userId, 
      type: 'expense' 
    }).sort({ date: -1 });
    
    // Calculate spending for each day (last 2 days)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Get today's total spending
    const todaySpending = transactions
      .filter(t => t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Get yesterday's total spending
    const yesterdaySpending = transactions
      .filter(t => t.date === yesterdayStr)
      .reduce((sum, t) => sum + t.amount, 0);
    
    console.log(`📊 Spending comparison - Today (${todayStr}): ₹${todaySpending}, Yesterday (${yesterdayStr}): ₹${yesterdaySpending}`);
    
    // If today > yesterday, send notification
    if (todaySpending > yesterdaySpending && yesterdaySpending > 0) {
      const difference = todaySpending - yesterdaySpending;
      const title = '⚠️ Spending Alert!';
      const message = `You have spent more today (₹${todaySpending}) than yesterday (₹${yesterdaySpending}). That's ₹${difference} more!`;
      
      await sendOneSignalNotification(user.oneSignalPlayerId, title, message);
      console.log('📱 High spending notification sent!');
    }
  } catch (err) {
    console.log('📱 Error checking spending notification:', err.message);
  }
}

// Create demo user if not exists
const createDemoUser = async () => {
  const demoEmail = 'demo@finweave.com';
  const existingDemo = await User.findOne({ email: demoEmail });
  
  if (!existingDemo) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = new User({
      name: 'Demo User',
      email: demoEmail,
      password: hashedPassword,
      language: 'English',
      incomeType: 'monthly',
      income: 30000,
      dailySavings: 200,
      financialGoals: ['Emergency Fund', 'New Phone', 'Vacation'],
      trustScore: 75,
      savingsGroups: ['Daily Savers', 'Weekend Warriors']
    });
    await demoUser.save();
    console.log('✅ Demo user created: demo@finweave.com / demo123');
  }
};

// Use Investment routes
app.use('/api/investments', investmentRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await createDemoUser();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.log('⚠️ MongoDB not connected, running with in-memory data');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT} (without MongoDB)`);
    });
  });
