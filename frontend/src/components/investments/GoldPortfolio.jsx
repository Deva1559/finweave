import { useApp } from '../../App';

export default function GoldPortfolio({ portfolio, goldPrice }) {
  const { user } = useApp();

  if (!portfolio || portfolio.totalGoldGrams === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Gold Portfolio</h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 mb-2">No gold holdings yet</p>
          <p className="text-sm text-gray-400">Start investing in digital gold today!</p>
        </div>
      </div>
    );
  }

  // Calculate portfolio allocation (assuming total gold as 100%)
  const allocation = 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Gold Portfolio</h3>
      
      {/* Portfolio Value Card */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700">Total Gold Value</p>
            <p className="text-3xl font-bold text-amber-900">₹{portfolio.currentValue?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-200">
          <div>
            <p className="text-xs text-amber-600">Gold Holdings</p>
            <p className="text-lg font-semibold text-amber-900">{portfolio.totalGoldGrams?.toFixed(4) || '0'}g</p>
          </div>
          <div>
            <p className="text-xs text-amber-600">Total Invested</p>
            <p className="text-lg font-semibold text-amber-900">₹{portfolio.totalInvested?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`rounded-xl p-4 border ${portfolio.profitLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${portfolio.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {portfolio.profitLoss >= 0 ? 'Profit' : 'Loss'}
          </p>
          <p className={`text-xl font-bold ${portfolio.profitLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {portfolio.profitLoss >= 0 ? '+' : ''}₹{portfolio.profitLoss?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">Returns</p>
          <p className={`text-xl font-bold ${portfolio.profitLossPercent >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {portfolio.profitLossPercent >= 0 ? '+' : ''}{portfolio.profitLossPercent?.toFixed(2) || '0'}%
          </p>
        </div>
      </div>

      {/* Allocation Visual */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Portfolio Allocation</p>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
            style={{ width: `${allocation}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Gold: {allocation}%</span>
        </div>
      </div>

      {/* Current Market Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Current Market Price</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">₹{goldPrice?.pricePerGram?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/g</p>
            <p className="text-xs text-gray-500">24K Gold</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">₹{goldPrice?.pricePer10gram?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/10g</p>
            <p className="text-xs text-gray-400">Last updated: {goldPrice?.lastUpdated ? new Date(goldPrice.lastUpdated).toLocaleTimeString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

