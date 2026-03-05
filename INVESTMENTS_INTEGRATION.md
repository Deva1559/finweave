# Digital Gold Investment Feature - Integration Guide

## Overview
This document describes the new Digital Gold Investment feature added to the FinWeave project. This feature allows users to invest in digital gold with amounts as low as ₹10.

## New Files Created

### Backend
1. **`backend/models/GoldInvestment.js`** - Mongoose model for gold investments
2. **`backend/routes/investments.js`** - New API routes for gold investment operations
3. **Updated `backend/server.js`** - Added import for investment routes

### Frontend
1. **`frontend/src/pages/Investment.jsx`** - Main investment page
2. **`frontend/src/components/investments/GoldDashboard.jsx`** - Dashboard with gold price and portfolio
3. **`frontend/src/components/investments/BuyGoldModal.jsx`** - Modal for buying gold with Razorpay
4. **`frontend/src/components/investments/SellGoldModal.jsx`** - Modal for selling gold
5. **`frontend/src/components/investments/GoldPortfolio.jsx`** - User's gold holdings display
6. **`frontend/src/components/investments/GoldTransactionHistory.jsx`** - Transaction history
7. **`frontend/src/components/investments/GoldGrowthChart.jsx`** - Gold growth chart
8. **`frontend/src/utils/razorpay.js`** - Razorpay payment integration utility

### Updated Files
- **`frontend/src/App.jsx`** - Added Investment route and InvestmentWithLayout component
- **`frontend/src/components/Sidebar.jsx`** - Added Gold Investment menu item
- **`backend/package.json`** - Added razorpay dependency

## API Endpoints (New)

All endpoints are under `/api/investments` and require authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gold-price` | Get live gold price |
| POST | `/buy` | Buy gold (creates Razorpay order) |
| POST | `/verify-payment` | Verify Razorpay payment |
| POST | `/sell` | Sell gold |
| GET | `/portfolio` | Get user's gold portfolio |
| GET | `/history` | Get transaction history |

## Database Schema

### Collection: `goldinvestments`
```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Reference to User
  amount: Number,          // Amount in INR
  goldGrams: Number,       // Gold amount in grams
  goldPrice: Number,      // Price per gram at time of transaction
  type: String,           // 'buy' or 'sell'
  paymentId: String,       // Razorpay order ID
  transactionId: String,   // Razorpay payment ID
  timestamp: Date,         // Transaction timestamp
  createdAt: Date,
  updatedAt: Date
}
```

## Razorpay Configuration

### Backend Setup
In `backend/routes/investments.js`, update these values:
```javascript
const razorpay = new Razorpay({
  key_id: 'rzp_test_YOUR_KEY_ID',      // Replace with your test key
  key_secret: 'YOUR_KEY_SECRET'        // Replace with your test secret
});
```

### Getting Razorpay Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create a test account if you don't have one
3. Navigate to Settings > API Keys
4. Copy the test key ID and secret
5. Update the values in `backend/routes/investments.js`

## Integration Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install razorpay
```

### 2. Configure Razorpay
Update the Razorpay credentials in `backend/routes/investments.js`

### 3. Start the Backend
```bash
cd backend
npm start
```

### 4. Start the Frontend
```bash
cd frontend
npm run dev
```

### 5. Access the Feature
- Navigate to `/investment` in your browser
- The "Gold Investment" option will appear in the sidebar

## Features

### Buy Gold
- Quick amounts: ₹10, ₹50, ₹100, ₹500, ₹1000, ₹5000
- Custom amount (minimum ₹10)
- Real-time gold gram calculation
- Razorpay payment integration

### Sell Gold
- Quick gold amounts: 0.1g, 0.5g, 1g, 2g, 5g, 10g
- Custom amount input
- Instant sell at current price
- Payout to wallet

### Portfolio Dashboard
- Live gold price display
- Current gold balance
- Total invested amount
- Current value
- Profit/Loss tracking
- Growth chart

### Transaction History
- Complete buy/sell history
- Pagination support
- Date and time tracking

### Smart Features
- Micro-investment suggestions ("You can invest ₹20 in gold today")
- Gold growth chart with value trends

## Testing

### Test Razorpay Flow
1. Use Razorpay test card: 4111 1111 1111 1111
2. Use any valid future expiry date (e.g., 12/28)
3. Use any 3-digit CVV (e.g., 123)

### Demo Mode
If Razorpay is not configured, the system will simulate payment for testing purposes.

## Production Deployment

### Environment Variables
Consider using environment variables for Razorpay keys:
```javascript
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

### Gold Price API
Currently using simulated price. For production, integrate with a real gold price API like:
- MetalpriceAPI
- GoldAPI.io
- Or any other gold price provider

## No Changes to Existing Code

This feature was implemented following the strict rule of NOT modifying any existing code:
- ✅ No changes to existing API routes
- ✅ No changes to existing database collections
- ✅ No changes to existing UI components
- ✅ Only added new files
- ✅ Only added new routes

The feature is completely independent and can be removed without affecting the rest of the application.

