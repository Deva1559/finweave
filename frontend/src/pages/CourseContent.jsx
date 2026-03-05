import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export default function CourseContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { API_URL } = useApp();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const courseId = searchParams.get('id');

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/education/content`);
      const data = await res.json();
      const foundCourse = data.find(c => c.id === parseInt(courseId));
      setCourse(foundCourse);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.includes('**') && !line.startsWith('** ')) {
        const match = line.match(/^\*\*(.+?)\*\*:?$/);
        if (match) {
          return <p key={index} className="font-bold text-gray-800 text-lg mt-6 mb-3">{match[1]}</p>;
        }
      }
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return <p key={index} className="font-bold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('•')) {
        return (
          <div key={index} className="flex items-start gap-3 text-gray-700 my-2">
            <span className="text-yellow-500 mt-1">•</span>
            <span>{line.replace('• ', '')}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\.\s/)[1];
        return (
          <div key={index} className="flex items-start gap-3 text-gray-700 my-2">
            <span className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{num}</span>
            <span>{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      if (line.includes('✅') || line.includes('🚨') || line.includes('❌')) {
        return <p key={index} className="text-gray-700 my-2 font-medium">{line}</p>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-600 my-2">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">Course not found</p>
        <button 
          onClick={() => navigate('/education')}
          className="mt-4 text-yellow-600 hover:underline"
        >
          ← Back to Education
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button 
        onClick={() => navigate('/education')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>←</span>
        <span>Back to Courses</span>
      </button>

      <div className={`rounded-2xl p-6 text-white ${
        course.category === 'basics' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        course.category === 'savings' ? 'bg-gradient-to-r from-green-500 to-green-600' :
        course.category === 'debt' ? 'bg-gradient-to-r from-red-500 to-red-600' :
        'bg-gradient-to-r from-purple-500 to-purple-600'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {course.category}
          </span>
          <span className={`px-3 py-1 bg-white/20 rounded-full text-sm ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
          <span className="text-sm">⏱️ {course.duration}</span>
        </div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="opacity-90 mt-2">{course.description}</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">📖 Course Content</h2>
        <div className="prose max-w-none">
          {formatContent(course.content)}
        </div>
      </div>

      {course.tips && course.tips.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">💡 Key Takeaways</h2>
          <div className="space-y-3">
            {course.tips.map((tip, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 bg-white p-3 rounded-lg"
              >
                <span className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

