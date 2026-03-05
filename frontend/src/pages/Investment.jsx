import { useState, useEffect } from 'react';
import { useApp } from '../App';
import GoldDashboard from '../components/investments/GoldDashboard';
import GoldPortfolio from '../components/investments/GoldPortfolio';
import GoldTransactionHistory from '../components/investments/GoldTransactionHistory';
import GoldGrowthChart from '../components/investments/GoldGrowthChart';
import BuyGoldModal from '../components/investments/BuyGoldModal';
import SellGoldModal from '../components/investments/SellGoldModal';

export default function Investment() {
  const { API_URL, token, user, updateUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [goldPrice, setGoldPrice] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching from:', `${API_URL}/investments/gold-price`);
      
      // Fetch gold price
      const priceResponse = await fetch(`${API_URL}/investments/gold-price`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!priceResponse.ok) {
        throw new Error(`HTTP ${priceResponse.status}: ${priceResponse.statusText}`);
      }
      
      const priceData = await priceResponse.json();
      setGoldPrice(priceData);

      // Fetch portfolio
      const portfolioResponse = await fetch(`${API_URL}/investments/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!portfolioResponse.ok) {
        throw new Error(`HTTP ${portfolioResponse.status}: ${portfolioResponse.statusText}`);
      }
      
      const portfolioData = await portfolioResponse.json();
      setPortfolio(portfolioData);

      // Fetch transaction history
      const historyResponse = await fetch(`${API_URL}/investments/history?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!historyResponse.ok) {
        throw new Error(`HTTP ${historyResponse.status}: ${historyResponse.statusText}`);
      }
      
      const historyData = await historyResponse.json();
      setTransactions(historyData.investments || []);

      // Fetch dashboard data to get wallet balance (same as Dashboard page)
      const dashboardResponse = await fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        // Update user context with wallet balance from dashboard (same calculation as Dashboard)
        updateUser({ 
          walletBalance: dashboardData.walletBalance,
          name: dashboardData.user?.name,
          trustScore: dashboardData.user?.trustScore
        });
      }

    } catch (err) {
      console.error('Error fetching investment data:', err);
      setError('Failed to load investment data. Make sure backend is running on port 3002.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuySuccess = async () => {
    await fetchData(); // Refresh data after successful purchase
    // Force a re-render of user context to update Dashboard's wallet display
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      updateUser({ walletBalance: data.walletBalance });
    }
  };

  const handleSellSuccess = async () => {
    await fetchData(); // Refresh data after successful sale
    // Force a re-render of user context to update Dashboard's wallet display
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      updateUser({ walletBalance: data.walletBalance });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gold Investment</h1>
          <p className="text-gray-500 mt-1">Loading your investment data...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="text-4xl">📊</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gold Investment</h1>
            <p className="text-gray-500 mt-1">Invest in digital gold with as little as ₹10</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="space-y-6">
        {/* Gold Dashboard with Price & Actions */}
        <GoldDashboard 
          goldPrice={goldPrice}
          portfolio={portfolio}
          onBuyClick={() => setShowBuyModal(true)}
          onSellClick={() => setShowSellModal(true)}
        />

        {/* Charts and Portfolio Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gold Growth Chart */}
          <GoldGrowthChart 
            transactions={transactions}
            currentValue={portfolio?.currentValue}
          />

          {/* Portfolio Details */}
          <GoldPortfolio 
            portfolio={portfolio}
            goldPrice={goldPrice}
          />
        </div>

        {/* Transaction History */}
        <GoldTransactionHistory />
      </div>

      {/* Modals */}
      <BuyGoldModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        goldPrice={goldPrice}
        onSuccess={handleBuySuccess}
      />

      <SellGoldModal 
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        goldPrice={goldPrice}
        portfolio={portfolio}
        onSuccess={handleSellSuccess}
      />
    </div>
  );
}

