import { useState, useEffect } from 'react';
import { useApp } from '../../App';

export default function GoldDashboard({ goldPrice, portfolio, onBuyClick, onSellClick }) {
  const { user } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (goldPrice && portfolio) {
      setLoading(false);
    }
  }, [goldPrice, portfolio]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">💳 Your Wallet Balance</p>
            <h2 className="text-3xl font-bold text-green-900 mt-1">
              ₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}
            </h2>
            <p className="text-xs text-green-600 mt-1">
              Used for buying & selling gold
            </p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
      </div>

      {/* Gold Price Card */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-700 font-medium">Today's Gold Price (24K)</p>
            <h2 className="text-3xl font-bold text-yellow-900 mt-1">
              ₹{goldPrice?.pricePerGram?.toLocaleString('en-IN')} <span className="text-sm font-normal text-yellow-700">/ gram</span>
            </h2>
            <p className="text-xs text-yellow-600 mt-1">
              Last updated: {goldPrice?.lastUpdated ? new Date(goldPrice.lastUpdated).toLocaleTimeString('en-IN') : 'N/A'}
            </p>
          </div>
          <div className="text-6xl">📊</div>
        </div>
        
        {/* Quick Price Info */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <p className="text-xs text-yellow-700">per gram</p>
            <p className="font-bold text-yellow-900">₹{goldPrice?.pricePerGram?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <p className="text-xs text-yellow-700">per 10g</p>
            <p className="font-bold text-yellow-900">₹{goldPrice?.pricePer10gram?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <p className="text-xs text-yellow-700">per kg</p>
            <p className="font-bold text-yellow-900">₹{goldPrice?.pricePerKg?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Gold Portfolio</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <p className="text-xs text-amber-700">Gold Balance</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{portfolio?.totalGoldGrams?.toFixed(3) || '0.000'}g</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-xs text-green-700">Current Value</p>
            <p className="text-2xl font-bold text-green-900 mt-1">₹{portfolio?.currentValue?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-xs text-blue-700">Total Invested</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">₹{portfolio?.totalInvested?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</p>
          </div>
          
          <div className={`rounded-xl p-4 border ${portfolio?.profitLoss >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
            <p className={`text-xs ${portfolio?.profitLoss >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>P/L</p>
            <p className={`text-2xl font-bold mt-1 ${portfolio?.profitLoss >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
              {portfolio?.profitLoss >= 0 ? '+' : ''}₹{portfolio?.profitLoss?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}
            </p>
            <p className={`text-xs mt-1 ${portfolio?.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {portfolio?.profitLossPercent?.toFixed(2) || '0'}%
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={onBuyClick}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>💰</span> Buy Gold
          </button>
          <button
            onClick={onSellClick}
            disabled={!portfolio?.totalGoldGrams || portfolio.totalGoldGrams <= 0}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>🏷️</span> Sell Gold
          </button>
        </div>
      </div>

      {/* Micro Investment Suggestion */}
      {portfolio?.totalGoldGrams > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-md p-4 border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">Micro-Investment Suggestion</p>
              <p className="text-xs text-indigo-700">You can invest ₹20 in gold today and own {(20 / goldPrice?.pricePerGram).toFixed(4)}g more!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

