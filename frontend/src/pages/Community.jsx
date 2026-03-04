import { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function Community() {
  const { user, token, API_URL } = useApp();
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/community/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock community data
  const savingsGroups = [
    { id: 1, name: 'Neighborhood Savers', members: 24, totalSaved: 125000, myContribution: 5000 },
    { id: 2, name: 'Daily Wagers Group', members: 15, totalSaved: 85000, myContribution: 3000 },
    { id: 3, name: 'Women Entrepreneurs', members: 18, totalSaved: 156000, myContribution: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-trust-500 to-trust-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">👥 Community</h2>
        <p className="opacity-90 mt-1">Connect with others and grow together</p>
      </div>

      {/* Your Trust Score */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Your Trust Score</p>
            <p className="text-4xl font-bold text-trust-600">{user?.trustScore || 50}</p>
          </div>
          <div className="w-20 h-20 rounded-full bg-trust-100 flex items-center justify-center trust-pulse">
            <span className="text-3xl">⭐</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-trust-500 rounded-full"
              style={{ width: `${user?.trustScore || 50}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {user?.trustScore < 70 ? 'Make more deposits to increase your trust score!' : 'Great! You have a high trust score.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'leaderboard' 
              ? 'bg-trust-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'groups' 
              ? 'bg-trust-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          👥 Savings Groups
        </button>
      </div>

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Savers This Month</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard?.leaderboard?.map((saver, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : index === 2 ? 'bg-orange-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' : 
                      index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {saver.rank}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{saver.name}</p>
                      <p className="text-sm text-gray-500">Saves ₹{saver.dailySavings}/day</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-trust-600">⭐ {saver.trustScore}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Savings Groups */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {savingsGroups.map(group => (
            <div key={group.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-500">{group.members} members</p>
                </div>
                <button className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors">
                  Join
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Total Saved</p>
                  <p className="font-bold text-primary-600">₹{group.totalSaved.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Your Contribution</p>
                  <p className="font-bold text-trust-600">
                    {group.myContribution > 0 ? `₹${group.myContribution.toLocaleString()}` : 'Not joined'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Create Group Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-dashed border-gray-200">
            <div className="text-center">
              <p className="text-4xl mb-4">➕</p>
              <h4 className="font-semibold text-gray-800">Create a Savings Group</h4>
              <p className="text-sm text-gray-500 mt-1">Start a group with friends and family</p>
              <button className="mt-4 btn-secondary">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

