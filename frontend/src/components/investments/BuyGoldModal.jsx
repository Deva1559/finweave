import { useState, useEffect } from 'react';
import { useApp } from '../../App';
import { loadRazorpay } from '../../utils/razorpay';

export default function BuyGoldModal({ isOpen, onClose, goldPrice, onSuccess }) {
  const { API_URL, token, user } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goldGrams, setGoldGrams] = useState(0);

  const quickAmounts = [10, 50, 100, 500, 1000, 5000];

  useEffect(() => {
    if (amount && goldPrice?.pricePerGram) {
      const grams = parseFloat(amount) / goldPrice.pricePerGram;
      setGoldGrams(grams);
    } else {
      setGoldGrams(0);
    }
  }, [amount, goldPrice]);

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) < 10) {
      setError('Minimum investment amount is ₹10');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order on backend (uses wallet now)
      const response = await fetch(`${API_URL}/investments/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Success! Wallet was deducted and gold was purchased
      // Since we're using wallet, no need for Razorpay
      console.log('Purchase successful:', data);
      onSuccess();
      handleClose();

    } catch (err) {
      console.error('Buy gold error:', err);
      setError(err.message || 'Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment for demo/testing
  const simulatePayment = async (orderId) => {
    try {
      const verifyResponse = await fetch(`${API_URL}/investments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_signature'
        })
      });

      if (verifyResponse.ok) {
        onSuccess();
        handleClose();
      }
    } catch (err) {
      setError('Payment simulation failed');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setAmount('');
    setGoldGrams(0);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💰</span> Buy Gold
            </h3>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Wallet Balance */}
          <div className="bg-green-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-green-700">Your Wallet Balance</p>
            <p className="text-xl font-bold text-green-900">₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</p>
          </div>

          {/* Current Price */}
          <div className="bg-yellow-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-yellow-700">Current Gold Price</p>
            <p className="text-xl font-bold text-yellow-900">₹{goldPrice?.pricePerGram?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/g</p>
          </div>

          {/* Quick Amounts */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Select Amount</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickAmount(amt)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    parseFloat(amount) === amt
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Enter Custom Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min ₹10)"
              min="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
            />
          </div>

          {/* Gold Calculation */}
          {goldGrams > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-4 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">You will get</p>
                  <p className="text-2xl font-bold text-amber-900">{goldGrams.toFixed(4)}g</p>
                </div>
                <div className="text-4xl">✨</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={loading || !amount || parseFloat(amount) < 10}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span>💳</span> Pay ₹{amount || '0'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

