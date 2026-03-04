const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
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
  financialGoals: [String],
  trustScore: { type: Number, default: 50 },
  savingsGroups: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: { type: String, enum: ['income', 'expense', 'savings'] },
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now }
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
    
    // Calculate summaries
    const incomeTotal = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const savingsTotal = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // AI Suggestions
    const suggestions = generateAISuggestions(user, incomeTotal, expenseTotal);
    
    res.json({
      user: {
        name: user.name,
        trustScore: user.trustScore,
        dailySavings: user.dailySavings
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
      savingsProgress: {
        total: savingsTotal,
        daily: user.dailySavings,
        monthly: user.dailySavings * 30,
        yearly: user.dailySavings * 365
      },
      goals: goals,
      transactions: transactions.slice(0, 10),
      aiSuggestions: suggestions
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
    const { type, amount, description } = req.body;
    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      description
    });
    
    await transaction.save();
    
    // Update user trust score
    await User.findByIdAndUpdate(req.userId, {
      $inc: { trustScore: type === 'savings' ? 2 : 0.5 }
    });
    
    res.status(201).json(transaction);
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
    // Get top savers (mock community data)
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
      yourRank: 5 // Simplified - would calculate in production
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// 8. AI Assistant Routes
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.userId);
    
    const response = generateAIResponse(message, user);
    res.json({ 
      response,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error getting AI response' });
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
      tips: [
        'Track your daily expenses',
        'Separate needs from wants',
        'Save 20% of your income'
      ]
    },
    {
      id: 2,
      title: 'Emergency Fund',
      description: 'Why you need an emergency fund and how to build one',
      category: 'savings',
      tips: [
        'Start with small amounts',
        'Aim for 3-6 months of expenses',
        'Keep it separate from daily savings'
      ]
    },
    {
      id: 3,
      title: 'Smart Savings',
      description: 'Strategies to maximize your savings without much money',
      category: 'savings',
      tips: [
        'Save before you spend',
        'Use the 50-30-20 rule',
        'Automate your savings'
      ]
    },
    {
      id: 4,
      title: 'Debt Management',
      description: 'How to manage and pay off debt effectively',
      category: 'debt',
      tips: [
        'Pay more than minimum',
        'Focus on high-interest debt first',
        'Consider debt consolidation'
      ]
    },
    {
      id: 5,
      title: 'Financial Goals',
      description: 'Set and achieve your financial goals',
      category: 'planning',
      tips: [
        'Make goals specific and measurable',
        'Break big goals into small steps',
        'Review progress regularly'
      ]
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
  
  // Savings related
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return {
      text: `Great question about savings! Based on your income of ₹${user.income} (${user.incomeType}), I recommend saving at least 20% - that's about ₹${Math.round(user.income * 0.2)} ${user.incomeType}. Even saving ₹50 daily can help you reach your goals faster!`,
      action: 'view_savings_tips'
    };
  }
  
  // Budget related
  if (lowerMessage.includes('budget') || lowerMessage.includes('spend')) {
    return {
      text: `Here's a simple budget for you:\n\n• Needs (50%): ₹${Math.round(user.income * 0.5)}\n• Wants (30%): ₹${Math.round(user.income * 0.3)}\n• Savings (20%): ₹${Math.round(user.income * 0.2)}\n\nThis simple framework can help you manage your money better!`,
      action: 'create_budget'
    };
  }
  
  // Goal related
  if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
    return {
      text: `Setting financial goals is great! To reach a goal of ₹10,000, you could save ₹100 daily for about 3-4 months. Use our Financial Twin to simulate different scenarios!`,
      action: 'open_goals'
    };
  }
  
  // Debt related
  if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
    return {
      text: `For debt management, I recommend:\n\n1. Pay more than minimum payments\n2. Focus on high-interest debt first\n3. Consider the avalanche method\n\nWould you like help creating a debt payoff plan?`,
      action: 'debt_calculator'
    };
  }
  
  // Investment related
  if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
    return {
      text: `For beginners, I suggest starting with:\n\n• Fixed Deposits (safe, low returns)\n• Public Provident Fund (long-term)\n• Mutual Funds (diversified)\n\nStart small and learn as you go!`,
      action: 'learn_investing'
    };
  }
  
  // Emergency fund
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
    return {
      text: `An emergency fund is crucial! Aim for 3-6 months of expenses. Start building yours today - even ₹5000-10,000 can help with minor emergencies.`,
      action: 'set_emergency_goal'
    };
  }
  
  // Default responses
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

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
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

