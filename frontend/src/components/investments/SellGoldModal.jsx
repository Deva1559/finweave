import { useState, useEffect } from 'react';
import { useApp } from '../../App';

export default function SellGoldModal({ isOpen, onClose, goldPrice, portfolio, onSuccess }) {
  const { API_URL, token } = useApp();
  const [goldGrams, setGoldGrams] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sellAmount, setSellAmount] = useState(0);

  const quickGrams = [0.1, 0.5, 1, 2, 5, 10];

  useEffect(() => {
    if (goldGrams && goldPrice?.pricePerGram) {
      const amount = parseFloat(goldGrams) * goldPrice.pricePerGram;
      setSellAmount(amount);
    } else {
      setSellAmount(0);
    }
  }, [goldGrams, goldPrice]);

  const handleQuickGrams = (value) => {
    setGoldGrams(value.toString());
  };

  const handleSell = async () => {
    const grams = parseFloat(goldGrams);
    
    if (!grams || grams <= 0) {
      setError('Please enter valid gold amount');
      return;
    }

    if (grams > (portfolio?.totalGoldGrams || 0)) {
      setError('Insufficient gold balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/investments/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ goldGrams: grams })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sell gold');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Sell gold error:', err);
      setError(err.message || 'Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGoldGrams('');
    setSellAmount(0);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏷️</span> Sell Gold
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
          {/* Current Price */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-gray-600">Current Gold Price</p>
            <p className="text-xl font-bold text-gray-900">₹{goldPrice?.pricePerGram?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/g</p>
          </div>

          {/* Available Balance */}
          <div className="bg-amber-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-amber-700">Available Gold Balance</p>
            <p className="text-xl font-bold text-amber-900">{portfolio?.totalGoldGrams?.toFixed(4) || '0.0000'}g</p>
          </div>

          {/* Quick Select */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Select (grams)</p>
            <div className="grid grid-cols-3 gap-2">
              {quickGrams.map((g) => (
                <button
                  key={g}
                  onClick={() => handleQuickGrams(g)}
                  disabled={g > (portfolio?.totalGoldGrams || 0)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    parseFloat(goldGrams) === g
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Enter Gold Amount (grams)
            </label>
            <input
              type="number"
              value={goldGrams}
              onChange={(e) => setGoldGrams(e.target.value)}
              placeholder="Enter gold in grams"
              step="0.0001"
              min="0.0001"
              max={portfolio?.totalGoldGrams}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
            />
          </div>

          {/* Sell Calculation */}
          {sellAmount > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">You will receive</p>
                  <p className="text-2xl font-bold text-gray-900">₹{sellAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-4xl">💵</div>
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
              onClick={handleSell}
              disabled={loading || !goldGrams || parseFloat(goldGrams) <= 0 || parseFloat(goldGrams) > (portfolio?.totalGoldGrams || 0)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <span>🏷️</span> Sell {goldGrams || '0'}g
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

