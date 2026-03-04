import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Summary() {
  const { token, API_URL } = useApp();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on selected month, year, and category
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const monthMatch = txDate.getMonth() === selectedMonth;
      const yearMatch = txDate.getFullYear() === selectedYear;
      const categoryMatch = selectedCategory === 'all' || tx.type === selectedCategory;
      return monthMatch && yearMatch && categoryMatch;
    });
  }, [transactions, selectedMonth, selectedYear, selectedCategory]);

  // Calculate summary
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const savings = filteredTransactions
      .filter(tx => tx.type === 'savings')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { income, expense, savings, netBalance: income - expense };
  }, [filteredTransactions]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years for dropdown
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">📊 Monthly Financial Summary</h2>
        <p className="opacity-90 mt-1">View your financial summary for any month</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="income">📈 Income</option>
              <option value="expense">📉 Expense</option>
              <option value="savings">💰 Savings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                +₹{summary.income.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                -₹{summary.expense.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-xl">📉</span>
            </div>
          </div>
        </div>

        {/* Total Savings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{summary.savings.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.netBalance >= 0 ? '+' : ''}₹{summary.netBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl">💵</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Transactions - {monthNames[selectedMonth]} {selectedYear}
          {selectedCategory !== 'all' && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({selectedCategory === 'income' ? '📈 Income' : selectedCategory === 'expense' ? '📉 Expense' : '💰 Savings'})
            </span>
          )}
        </h3>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {tx.type === 'income' ? '📈' : tx.type === 'expense' ? '📉' : '💰'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.date).toLocaleDateString('en-IN', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{tx.type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for the selected criteria</p>
            <p className="text-sm text-gray-400 mt-1">Try selecting a different month or category</p>
          </div>
        )}
      </div>

      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

