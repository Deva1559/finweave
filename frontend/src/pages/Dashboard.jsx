import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../App';
import { Line, Doughnut } from 'react-chartjs-2';
import Calendar from '../components/Calendar';
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
import { getOneSignalPlayerId, requestNotificationPermission } from '../onesignal';

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
  const [notifLoading, setNotifLoading] = useState(false);
  const today = new Date();
  const formatDateISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [quickTransaction, setQuickTransaction] = useState({ type: 'savings', amount: '', description: '', date: formatDateISO(new Date()) });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef(null);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [calendarMonth]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Fetch all transactions for calendar view
      const txsRes = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allTransactions = await txsRes.json();
      
      setDashboardData({ ...data, transactions: allTransactions });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTransaction = async (e) => {
    e.preventDefault();
    alert('Submitting transaction: ' + JSON.stringify(quickTransaction));
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(quickTransaction)
      });
      
      console.log('Transaction created, fetching dashboard...');
      if (res.ok) {
        setQuickTransaction({ type: 'savings', amount: '', description: '', date: formatDateISO(new Date()) });
        await fetchDashboard();
        console.log('Dashboard refreshed');
        alert('Transaction added successfully!');
      } else {
        alert('Error adding transaction: ' + res.status);
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('Error: ' + err.message);
    }
  };

  const enableNotifications = async () => {
    console.log('🔔 Button clicked, starting notification setup...');
    setNotifLoading(true);
    try {
      console.log('📱 Requesting notification permission...');
      await requestNotificationPermission();
      console.log('⏳ Waiting for player ID...');
      setTimeout(async () => {
        console.log('🔍 Getting player ID now...');
        const playerId = await getOneSignalPlayerId();
        console.log('🎯 Got player ID:', playerId);
        if (playerId) {
          console.log('💾 Saving player ID to backend...');
          await fetch(`${API_URL}/user/onesignal-id`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ playerId })
          });
          alert('Notifications enabled! Player ID: ' + playerId);
        } else {
          alert('Could not get player ID. Make sure to ALLOW the notification permission!');
        }
        setNotifLoading(false);
      }, 3000);
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setNotifLoading(false);
      alert('Error enabling notifications: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

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

  // Debug: Show dashboard values
  console.log('Dashboard income:', dashboardData?.incomeSummary?.total);
  console.log('Dashboard expenses:', dashboardData?.spendingSummary?.total);
  console.log('Dashboard savings:', dashboardData?.savingsProgress?.total);
  console.log('Dashboard wallet:', dashboardData?.walletBalance);

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
        <button 
          onClick={enableNotifications}
          disabled={notifLoading}
          className="mt-4 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {notifLoading ? 'Enabling...' : '🔔 Enable Notifications'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-3xl font-bold text-trust-600">
                ₹{dashboardData?.incomeSummary?.total?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">
                ₹{dashboardData?.spendingSummary?.total?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">📉</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {dashboardData?.spendingSummary?.recent?.length || 0} transactions
          </p>
        </div>

        {/* Wallet Balance (Remaining Amount) */}
        <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className={`text-3xl font-bold ${
                (dashboardData?.walletBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(dashboardData?.walletBalance || 0).toLocaleString()}
                {(dashboardData?.walletBalance || 0) < 0 && ' (Overdrawn)'}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              (dashboardData?.walletBalance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className="text-2xl">💳</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Income - Expenses = Remaining
          </p>
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

            {/* Date Picker Dropdown */}
            <div ref={calendarRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Date</label>
              <button
                type="button"
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="input-field text-left flex items-center justify-between bg-white hover:border-primary-500 transition-colors cursor-pointer"
              >
                <span className={quickTransaction.date ? 'text-gray-800' : 'text-gray-400'}>
                  {quickTransaction.date
                    ? new Date(quickTransaction.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Select date'}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${calendarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {calendarOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                  {/* Calendar Header */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 flex items-center justify-between text-white">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-bold text-sm">
                      {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {dayNames.map(d => (
                      <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
                    ))}
                  </div>

{/* Day Grid */}
                  <div className="grid grid-cols-7 p-2 gap-1">
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={i} />;
                      const iso = formatDateISO(date);
                      const isSelected = iso === quickTransaction.date;
                      const isToday = iso === formatDateISO(new Date());
                      // Allow only today and tomorrow (next day)
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const isTomorrow = iso === formatDateISO(tomorrow);
                      const isFutureBeyondTomorrow = date > tomorrow;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isFutureBeyondTomorrow}
                          onClick={() => {
                            setQuickTransaction({ ...quickTransaction, date: iso });
                            setCalendarOpen(false);
                          }}
                          className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-150
                            ${
                              isFutureBeyondTomorrow
                                ? 'text-gray-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-primary-500 text-white shadow-md scale-110'
                                : isToday
                                ? 'bg-primary-100 text-primary-700 font-bold'
                                : isTomorrow
                                ? 'bg-yellow-100 text-yellow-700 font-bold'
                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                            }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Today shortcut */}
                  <div className="border-t border-gray-100 px-4 py-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickTransaction({ ...quickTransaction, date: formatDateISO(new Date()) });
                        setCalendarMonth(new Date());
                        setCalendarOpen(false);
                      }}
                      className="text-xs text-primary-600 hover:text-primary-800 font-semibold hover:underline transition-colors"
                    >
                      📅 Jump to Today
                    </button>
                  </div>
                </div>
              )}
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
                    <p className="text-xs text-gray-500">{new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN')}</p>
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

      {/* Monthly Calendar View */}
      <Calendar transactions={dashboardData?.transactions || []} />
    </div>
  );
}
