import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export default function Education() {
  const { API_URL, token } = useApp();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch(`${API_URL}/education/content`);
      const data = await res.json();
      setContent(data);
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'basics', label: 'Basics', icon: '📖' },
    { id: 'savings', label: 'Savings', icon: '💰' },
    { id: 'debt', label: 'Debt', icon: '💳' },
    { id: 'planning', label: 'Planning', icon: '📋' }
  ];

  const filteredContent = selectedCategory === 'all' 
    ? content 
    : content.filter(c => c.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStartLesson = (lessonId) => {
    navigate(`/course?id=${lessonId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">📚 Financial Education Hub</h2>
        <p className="opacity-90 mt-1">Learn smart financial management with bite-sized lessons</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map(lesson => (
            <div 
              key={lesson.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
            >
              {/* Card Header */}
              <div className={`p-4 ${
                lesson.category === 'basics' ? 'bg-blue-50' :
                lesson.category === 'savings' ? 'bg-green-50' :
                lesson.category === 'debt' ? 'bg-red-50' :
                'bg-purple-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    lesson.category === 'basics' ? 'bg-blue-500 text-white' :
                    lesson.category === 'savings' ? 'bg-green-500 text-white' :
                    lesson.category === 'debt' ? 'bg-red-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {lesson.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>⏱️ {lesson.duration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 mb-4">{lesson.description}</p>

                {/* Action Button */}
                <button 
                  onClick={() => handleStartLesson(lesson.id)}
                  className="w-full mt-4 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                >
                  Start Lesson →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budgeting Guide */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-4">📊 The 50-30-20 Budget Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">50%</div>
            <p className="font-semibold text-gray-800 mt-2">Needs</p>
            <p className="text-sm text-gray-600 mt-1">
              Rent, utilities, groceries, transport, minimum debt payments
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <div className="text-3xl font-bold text-yellow-600">30%</div>
            <p className="font-semibold text-gray-800 mt-2">Wants</p>
            <p className="text-sm text-gray-600 mt-1">
              Entertainment, dining out, hobbies, subscriptions
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600">20%</div>
            <p className="font-semibold text-gray-800 mt-2">Savings</p>
            <p className="text-sm text-gray-600 mt-1">
              Emergency fund, investments, extra debt payments
            </p>
          </div>
        </div>
      </div>

      {/* Daily Finance Tips */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">🌟 Daily Finance Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { tip: 'Track every expense for a week', icon: '📝' },
            { tip: 'Save before you spend, not after', icon: '💰' },
            { tip: 'Review your subscriptions monthly', icon: '🔍' },
            { tip: 'Set up automatic savings', icon: '⚙️' },
            { tip: 'Avoid impulsive purchases', icon: '🛑' },
            { tip: 'Cook at home more often', icon: '🍳' }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 bg-white p-4 rounded-xl"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-gray-700">{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

