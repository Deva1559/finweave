import { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FinancialTwin() {
  const { user, token, API_URL } = useApp();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState({
    dailySavings: user?.dailySavings || 50,
    goalAmount: 10000,
    months: 12
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`${API_URL}/financial-twin/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(simulation)
      });
      const data = await res.json();
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulation = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchPredictions();
  };

  // Chart data
  const projectionChartData = {
    labels: predictions?.predictions?.map(p => p.label) || [],
    datasets: [
      {
        label: 'Projected Savings',
        data: predictions?.predictions?.map(p => p.amount) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const scenarioChartData = {
    labels: ['Conservative', 'Moderate', 'Aggressive'],
    datasets: [
      {
        label: '1 Year Projection',
        data: predictions ? [
          predictions.projection.yearly,
          predictions.projection.yearly * 1.5,
          predictions.projection.yearly * 2
        ] : [],
        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'],
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">🔮 Financial Twin</h2>
        <p className="opacity-90 mt-1">Predict and simulate your financial future</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">🎛️ Simulation Controls</h3>
          <form onSubmit={handleSimulation} className="space-y-6">
            {/* Daily Savings Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Savings: ₹{simulation.dailySavings}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={simulation.dailySavings}
                onChange={(e) => setSimulation({ ...simulation, dailySavings: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹10</span>
                <span>₹500</span>
              </div>
            </div>

            {/* Goal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Amount (₹)
              </label>
              <input
                type="number"
                value={simulation.goalAmount}
                onChange={(e) => setSimulation({ ...simulation, goalAmount: parseInt(e.target.value) })}
                className="input-field"
                placeholder="Enter goal amount"
              />
            </div>

            {/* Months Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period: {simulation.months} months
              </label>
              <input
                type="range"
                min="1"
                max="36"
                step="1"
                value={simulation.months}
                onChange={(e) => setSimulation({ ...simulation, months: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 month</span>
                <span>36 months</span>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              {loading ? 'Calculating...' : 'Run Simulation'}
            </button>
          </form>

          {/* Quick Scenarios */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-700 mb-3">Quick Scenarios</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSimulation({ ...simulation, dailySavings: 30 });
                  setTimeout(() => document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true })), 100);
                }}
                className="w-full p-3 bg-green-50 text-green-700 rounded-xl text-left hover:bg-green-100 transition-colors"
              >
                <p className="font-medium">₹30/day → ₹10,800/year</p>
              </button>
              <button
                onClick={() => {
                  setSimulation({ ...simulation, dailySavings: 50 });
                  setTimeout(() => document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true })), 100);
                }}
                className="w-full p-3 bg-blue-50 text-blue-700 rounded-xl text-left hover:bg-blue-100 transition-colors"
              >
                <p className="font-medium">₹50/day → ₹18,000/year</p>
              </button>
              <button
                onClick={() => {
                  setSimulation({ ...simulation, dailySavings: 100 });
                  setTimeout(() => document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true })), 100);
                }}
                className="w-full p-3 bg-purple-50 text-purple-700 rounded-xl text-left hover:bg-purple-100 transition-colors"
              >
                <p className="font-medium">₹100/day → ₹36,000/year</p>
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projection Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">📈 Savings Projection</h3>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
              </div>
            ) : (
              <Line 
                data={projectionChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `₹${context.parsed.y.toLocaleString()}`
                      }
                    }
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
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Current Savings</p>
              <p className="text-2xl font-bold text-primary-600">
                ₹{predictions?.currentSavings?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Monthly Contribution</p>
              <p className="text-2xl font-bold text-trust-600">
                ₹{predictions?.monthlyContribution?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">1 Year Projection</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{predictions?.projection?.yearly?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Scenario Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">⚖️ Scenario Comparison</h3>
            <Bar 
              data={scenarioChartData}
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
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              {predictions?.scenarios?.map((scenario, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800">{scenario.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{scenario.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Timeline */}
          {predictions?.monthsToGoal && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">🎯 Goal Timeline</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">To reach ₹{predictions.goalAmount?.toLocaleString()}</p>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    {predictions.monthsToGoal} months
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">At ₹{simulation.dailySavings}/day</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You'll achieve your goal on {new Date(Date.now() + predictions.monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (12 / predictions.monthsToGoal) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

