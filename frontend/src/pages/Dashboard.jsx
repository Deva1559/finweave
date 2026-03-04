import { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user, token, API_URL } = useApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickTransaction, setQuickTransaction] = useState({ type: 'savings', amount: '', description: '' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(quickTransaction)
      });
      
      if (res.ok) {
        setQuickTransaction({ type: 'savings', amount: '', description: '' });
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const healthScore = dashboardData?.financialHealthScore || 50;
  
  // Chart configurations
  const savingsChartData = {
    labels: dashboardData?.savingsProgress ? 
      ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 6', 'Month 12'] : [],
    datasets: [
      {
        label: 'Projected Savings',
        data: dashboardData?.savingsProgress ? [
          dashboardData.savingsProgress.total,
          dashboardData.savingsProgress.total + (dashboardData.savingsProgress.monthly * 1),
          dashboardData.savingsProgress.total + (dashboardData.savingsProgress.monthly * 2),
          dashboardData.savingsProgress.total + (dashboardData.savingsProgress.monthly * 3),
          dashboardData.savingsProgress.total + (dashboardData.savingsProgress.monthly * 6),
          dashboardData.savingsProgress.total + (dashboardData.savingsProgress.monthly * 12),
        ] : [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const spendingChartData = {
    labels: ['Needs', 'Wants', 'Savings'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {dashboardData?.user?.name || 'User'}! 👋</h2>
        <p className="opacity-90 mt-1">Here's your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Financial Health Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className="text-3xl font-bold text-primary-600">{healthScore}</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center trust-pulse ${
              healthScore >= 70 ? 'bg-primary-100' : healthScore >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className="text-2xl">❤️</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {healthScore >= 70 ? 'Excellent!' : healthScore >= 50 ? 'Good, keep improving!' : 'Needs attention'}
            </p>
          </div>
        </div>

        {/* Income */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{dashboardData?.incomeSummary?.type || 'Monthly'} Income</p>
              <p className="text-3xl font-bold text-trust-600">
                ₹{dashboardData?.incomeSummary?.monthly?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Savings</p>
              <p className="text-3xl font-bold text-primary-600">
                ₹{dashboardData?.savingsProgress?.total?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ₹{dashboardData?.savingsProgress?.monthly?.toLocaleString() || 0}/month
          </p>
        </div>

        {/* Trust Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trust Score</p>
              <p className="text-3xl font-bold text-trust-600">
                {dashboardData?.user?.trustScore || 50}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Community reputation</p>
        </div>
      </div>

      {/* Quick Transaction & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Transaction */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Transaction</h3>
          <form onSubmit={handleQuickTransaction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={quickTransaction.type}
                onChange={(e) => setQuickTransaction({ ...quickTransaction, type: e.target.value })}
                className="input-field"
              >
                <option value="savings">💰 Savings</option>
                <option value="income">📈 Income</option>
                <option value="expense">📉 Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={quickTransaction.amount}
                onChange={(e) => setQuickTransaction({ ...quickTransaction, amount: e.target.value })}
                className="input-field"
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={quickTransaction.description}
                onChange={(e) => setQuickTransaction({ ...quickTransaction, description: e.target.value })}
                className="input-field"
                placeholder="What's this for?"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Add Transaction
            </button>
          </form>
        </div>

        {/* Savings Projection Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Savings Projection</h3>
          <Line 
            data={savingsChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => '₹' + value.toLocaleString()
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Budget Distribution & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Budget Distribution</h3>
          <div className="flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut 
                data={spendingChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Needs</p>
              <p className="font-bold text-trust-600">50%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wants</p>
              <p className="font-bold text-yellow-600">30%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Savings</p>
              <p className="font-bold text-primary-600">20%</p>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">💡 AI Financial Suggestions</h3>
          <div className="space-y-3">
            {dashboardData?.aiSuggestions?.map((suggestion, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  suggestion.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  suggestion.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                  suggestion.type === 'info' ? 'bg-trust-50 border-l-4 border-trust-400' :
                  'bg-gray-50 border-l-4 border-gray-400'
                }`}
              >
                <p className="font-semibold text-gray-800">{suggestion.title}</p>
                <p className="text-sm text-gray-600 mt-1">{suggestion.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {dashboardData?.transactions?.length > 0 ? (
            dashboardData.transactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${
                    tx.type === 'savings' ? '🟢' : tx.type === 'income' ? '🔵' : '🔴'
                  }`}>
                    {tx.type === 'savings' ? '💰' : tx.type === 'income' ? '📈' : '📉'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  tx.type === 'savings' || tx.type === 'income' ? 'text-primary-600' : 'text-red-600'
                }`}>
                  {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

