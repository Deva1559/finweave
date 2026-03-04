import { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function MicroSavings() {
  const { user, token, API_URL, updateUser } = useApp();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newGoal.name,
          targetAmount: parseFloat(newGoal.targetAmount),
          deadline: newGoal.deadline
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewGoal({ name: '', targetAmount: '', deadline: '' });
        fetchGoals();
      }
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const handleAddToGoal = async (goalId, amount) => {
    try {
      const res = await fetch(`${API_URL}/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const handleQuickSave = async (amount) => {
    try {
      // Add as transaction
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'savings',
          amount,
          description: 'Quick save'
        })
      });

      // Update user's daily savings
      updateUser({ dailySavings: (user?.dailySavings || 0) + amount });
    } catch (err) {
      console.error('Error in quick save:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">💰 Micro Savings</h2>
            <p className="opacity-90 mt-1">Set goals and track your progress</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            + Add Goal
          </button>
        </div>
      </div>

      {/* Quick Save */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">⚡ Quick Save</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[10, 20, 50, 100, 200].map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickSave(amount)}
              className="py-3 bg-primary-50 text-primary-700 rounded-xl font-medium hover:bg-primary-100 transition-colors"
            >
              +₹{amount}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            💡 Your current daily savings target: <span className="font-semibold">₹{user?.dailySavings || 0}</span>
          </p>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Daily Savings</p>
          <p className="text-2xl font-bold text-primary-600">₹{user?.dailySavings || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Monthly</p>
          <p className="text-2xl font-bold text-trust-600">₹{((user?.dailySavings || 0) * 30).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Yearly</p>
          <p className="text-2xl font-bold text-purple-600">₹{((user?.dailySavings || 0) * 365).toLocaleString()}</p>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">🎯 Your Goals</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={goal._id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                      <p className="text-sm text-gray-500">
                        ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        {daysLeft > 0 && ` • ${daysLeft} days left`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      goal.completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {goal.completed ? '✅ Completed' : `${Math.round(progress)}%`}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-primary-500 rounded-full progress-bar"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  
                  {/* Add to Goal */}
                  {!goal.completed && (
                    <div className="flex gap-2">
                      {[10, 50, 100].map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleAddToGoal(goal._id, amount)}
                          className="flex-1 py-2 bg-white border border-primary-500 text-primary-600 rounded-lg text-sm hover:bg-primary-50 transition-colors"
                        >
                          +₹{amount}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No goals yet. Create your first goal!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Buy a phone"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="input-field"
                  placeholder="5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

