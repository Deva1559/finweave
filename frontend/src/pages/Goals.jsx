import { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function Goals() {
  const { user, token, API_URL } = useApp();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: ''
  });

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

  const handleCreateGoal = async (e) => {
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
        setShowModal(false);
        setNewGoal({ name: '', targetAmount: '', deadline: '' });
        fetchGoals();
      }
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const handleAddProgress = async (goalId, amount) => {
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

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const res = await fetch(`${API_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  // Calculate totals
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedGoals = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🎯 Financial Goals</h2>
            <p className="opacity-90 mt-1">Track and achieve your financial dreams</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            + New Goal
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Goals</p>
          <p className="text-3xl font-bold text-gray-800">{goals.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completedGoals}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Target</p>
          <p className="text-3xl font-bold text-trust-600">₹{totalTarget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Saved</p>
          <p className="text-3xl font-bold text-primary-600">₹{totalSaved.toLocaleString()}</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Your Goals</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = goal.deadline 
                ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <div key={goal._id} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        goal.completed ? 'bg-green-100' : 'bg-pink-100'
                      }`}>
                        {goal.completed ? '✅' : '🎯'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                        <p className="text-sm text-gray-500">
                          {goal.completed ? 'Completed!' : 
                           daysLeft > 0 ? `${daysLeft} days remaining` : 
                           daysLeft === 0 ? 'Due today!' : 'Past deadline'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{goal.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        of ₹{goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full progress-bar ${
                        goal.completed ? 'bg-green-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                    <p className="text-sm font-medium text-gray-600">
                      {Math.round(progress)}% Complete
                    </p>
                    
                    {!goal.completed && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddProgress(goal._id, 100)}
                          className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                        >
                          +₹100
                        </button>
                        <button
                          onClick={() => handleAddProgress(goal._id, 500)}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          +₹500
                        </button>
                        <button
                          onClick={() => handleAddProgress(goal._id, 1000)}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
                        >
                          +₹1000
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">No goals yet</h4>
            <p className="text-gray-500 mb-6">Start setting your financial goals!</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Templates */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Emergency Fund', target: 50000, icon: '🏠' },
            { name: 'New Phone', target: 15000, icon: '📱' },
            { name: 'Vacation', target: 25000, icon: '✈️' }
          ].map((template, index) => (
            <button
              key={index}
              onClick={() => {
                setNewGoal({
                  name: template.name,
                  targetAmount: template.target.toString(),
                  deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
                setShowModal(true);
              }}
              className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-colors text-left"
            >
              <span className="text-3xl">{template.icon}</span>
              <p className="font-medium text-gray-800 mt-2">{template.name}</p>
              <p className="text-sm text-gray-500">₹{template.target.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Buy a laptop"
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
                  placeholder="10000"
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
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary bg-pink-500 hover:bg-pink-600">
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

