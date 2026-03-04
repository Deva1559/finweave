const mongoose = require('mongoose');

// Gold Investment Schema - Separate collection as requested
const goldInvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  goldGrams: {
    type: Number,
    required: true
  },
  goldPrice: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  paymentId: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
goldInvestmentSchema.index({ userId: 1, timestamp: -1 });

const GoldInvestment = mongoose.model('GoldInvestment', goldInvestmentSchema);

module.exports = GoldInvestment;

