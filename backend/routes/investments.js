const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const GoldInvestment = require('../models/GoldInvestment');

const JWT_SECRET = 'finweave_secret_key_2024';

// Initialize Razorpay (use test credentials)
const razorpay = new Razorpay({
  key_id: 'rzp_test_your_key_id', // Replace with actual test key
  key_secret: 'your_key_secret'    // Replace with actual test secret
});

// Gold Price API - Using free gold price API
const getGoldPrice = async () => {
  try {
    // Using a free gold price API - replace with actual API in production
    // For demo purposes, using a simulated price around ₹6000-7000 per gram
    const basePrice = 6200; // Base price per gram
    const variation = Math.random() * 200 - 100; // Random variation
    const price = basePrice + variation;
    
    return {
      pricePerGram: Math.round(price * 100) / 100,
      pricePer10gram: Math.round(price * 10 * 100) / 100,
      pricePerKg: Math.round(price * 1000 * 100) / 100,
      lastUpdated: new Date().toISOString(),
      currency: 'INR'
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return {
      pricePerGram: 6200,
      pricePer10gram: 62000,
      pricePerKg: 6200000,
      lastUpdated: new Date().toISOString(),
      currency: 'INR',
      error: 'Using fallback price'
    };
  }
};

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

// ==================== INVESTMENT ROUTES ====================

// GET /api/investments/gold-price - Get live gold price
router.get('/gold-price', authMiddleware, async (req, res) => {
  try {
    const goldPrice = await getGoldPrice();
    res.json(goldPrice);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gold price', error: err.message });
  }
});

// POST /api/investments/buy - Buy gold using wallet balance
router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount < 10) {
      return res.status(400).json({ message: 'Minimum investment amount is ₹10' });
    }
    
    // Get current gold price
    const goldPrice = await getGoldPrice();
    const pricePerGram = goldPrice.pricePerGram;
    
    // Calculate gold grams
    const goldGrams = amount / pricePerGram;
    
    // Get user and check wallet balance using mongoose
    // Calculate wallet balance from transactions (in case stored balance is outdated)
    const Transaction = mongoose.model('Transaction');
    const userIdObj = new mongoose.Types.ObjectId(req.userId);
    const user = await mongoose.model('User').findById(userIdObj);
    
    // Calculate actual wallet balance from transactions
    const transactions = await Transaction.find({ userId: req.userId });
    let calculatedBalance = 0;
    transactions.forEach(t => {
      if (t.type === 'income') calculatedBalance += t.amount;
      else if (t.type === 'expense') calculatedBalance -= t.amount;
      // savings don't affect wallet balance
    });
    
    // Use calculated balance or stored balance (whichever is greater, in case stored was updated)
    const walletBalance = Math.max(user.walletBalance || 0, calculatedBalance);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check wallet balance (use calculated balance)
    if (walletBalance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient wallet balance',
        walletBalance: walletBalance,
        required: amount
      });
    }
    
    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();
    
    // Create investment record (completed directly via wallet)
    const investment = new GoldInvestment({
      userId: req.userId,
      amount: amount,
      goldGrams: goldGrams,
      goldPrice: pricePerGram,
      type: 'buy',
      paymentId: `wallet_${Date.now()}`,
      transactionId: `txn_${Date.now()}`
    });
    
    await investment.save();
    
    res.json({
      success: true,
      message: 'Gold purchased successfully using wallet',
      investment: {
        id: investment._id,
        amount: amount,
        goldGrams: goldGrams,
        goldPrice: pricePerGram,
        timestamp: investment.timestamp
      },
      walletBalance: user.walletBalance
    });
  } catch (err) {
    console.error('Error in buy gold:', err);
    res.status(500).json({ message: 'Error processing gold purchase', error: err.message });
  }
});

// POST /api/investments/verify-payment - Verify Razorpay payment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    // Verify signature (in production, use proper verification)
    const generatedSignature = require('crypto')
      .createHmac('sha256', razorpay.key_secret)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');
    
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Update investment record
    const investment = await GoldInvestment.findOneAndUpdate(
      { paymentId: razorpayOrderId },
      { 
        transactionId: razorpayPaymentId,
        type: 'buy'
      },
      { new: true }
    );
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment record not found' });
    }
    
    res.json({ 
      message: 'Payment verified successfully',
      investment: investment
    });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying payment', error: err.message });
  }
});

// POST /api/investments/sell - Sell gold and add amount to wallet
router.post('/sell', authMiddleware, async (req, res) => {
  try {
    const { goldGrams } = req.body;
    
    if (!goldGrams || goldGrams <= 0) {
      return res.status(400).json({ message: 'Please enter valid gold amount to sell' });
    }
    
    // Get user's total gold
    const portfolio = await getUserPortfolio(req.userId);
    
    if (portfolio.totalGoldGrams < goldGrams) {
      return res.status(400).json({ 
        message: 'Insufficient gold balance',
        available: portfolio.totalGoldGrams
      });
    }
    
    // Get current gold price
    const goldPrice = await getGoldPrice();
    const pricePerGram = goldPrice.pricePerGram;
    
    // Calculate sell amount
    const sellAmount = goldGrams * pricePerGram;
    
    // Get user to add sell amount to wallet using mongoose
    const userId = new mongoose.Types.ObjectId(req.userId);
    const user = await mongoose.model('User').findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add sell amount to wallet
    user.walletBalance += sellAmount;
    await user.save();
    
    // Create sell transaction
    const investment = new GoldInvestment({
      userId: req.userId,
      amount: sellAmount,
      goldGrams: goldGrams,
      goldPrice: pricePerGram,
      type: 'sell',
      paymentId: null,
      transactionId: `sell_${Date.now()}`
    });
    
    await investment.save();
    
    res.json({
      success: true,
      message: 'Gold sold successfully. Amount added to wallet.',
      investment: {
        id: investment._id,
        goldGrams: goldGrams,
        amount: sellAmount,
        goldPrice: pricePerGram,
        timestamp: investment.timestamp
      },
      walletBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).json({ message: 'Error selling gold', error: err.message });
  }
});

// GET /api/investments/portfolio - Get user's gold portfolio
router.get('/portfolio', authMiddleware, async (req, res) => {
  try {
    const portfolio = await getUserPortfolio(req.userId);
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching portfolio', error: err.message });
  }
});

// GET /api/investments/history - Get transaction history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    
    const investments = await GoldInvestment.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await GoldInvestment.countDocuments({ userId: req.userId });
    
    res.json({
      investments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history', error: err.message });
  }
});

// Helper function to get user portfolio
async function getUserPortfolio(userId) {
  const investments = await GoldInvestment.find({ userId: userId });
  
  let totalGoldGrams = 0;
  let totalInvested = 0;
  let totalSold = 0;
  
  investments.forEach(inv => {
    if (inv.type === 'buy') {
      totalGoldGrams += inv.goldGrams;
      totalInvested += inv.amount;
    } else if (inv.type === 'sell') {
      totalGoldGrams -= inv.goldGrams;
      totalSold += inv.amount;
    }
  });
  
  // Get current gold price
  const goldPrice = await getGoldPrice();
  const currentValue = totalGoldGrams * goldPrice.pricePerGram;
  const profitLoss = currentValue - (totalInvested - totalSold);
  
  return {
    totalGoldGrams: Math.round(totalGoldGrams * 1000) / 1000,
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalSold: Math.round(totalSold * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    profitLoss: Math.round(profitLoss * 100) / 100,
    profitLossPercent: totalInvested > 0 ? Math.round((profitLoss / totalInvested) * 10000) / 100 : 0,
    currentGoldPrice: goldPrice.pricePerGram
  };
}

module.exports = router;

