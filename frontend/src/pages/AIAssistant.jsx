import { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';

export default function AIAssistant() {
  const { user, token, API_URL } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello! I'm FinWeave's AI Assistant 🤖\n\nI'm here to help you with:\n• 💰 Savings advice\n• 📊 Budget tips\n• 🎯 Goal planning\n• 📚 Financial education\n\nWhat would you like to know about?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: input })
      });
      
      const data = await res.json();
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response.text,
        action: data.response.action,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting response:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    { label: 'How to save money?', icon: '💰', category: 'savings' },
    { label: 'Analyze my spending', icon: '📊', category: 'analysis' },
    { label: 'Create a budget', icon: '💵', category: 'budget' },
    { label: 'Set financial goals', icon: '🎯', category: 'goals' },
    { label: 'Emergency fund', icon: '🏠', category: 'emergency' },
    { label: 'Pay off debt', icon: '💳', category: 'debt' },
    { label: 'Investment basics', icon: '📈', category: 'investing' },
    { label: 'Tax saving tips', icon: '🧾', category: 'tax' },
    { label: 'Retirement planning', icon: '🏖️', category: 'retirement' },
    { label: 'Insurance guide', icon: '🛡️', category: 'insurance' }
  ];

  // Extra AI Features
  const aiFeatures = [
    { title: '📈 Spending Analysis', description: 'Get insights on your spending patterns', icon: '📈' },
    { title: '🎯 Goal Tracker', description: 'Track and optimize your financial goals', icon: '🎯' },
    { title: '💡 Smart Budget', description: 'AI-powered budget recommendations', icon: '💡' },
    { title: '⚠️ Expense Alerts', description: 'Get notified of unusual spending', icon: '⚠️' },
    { title: '📊 Monthly Report', description: 'Your monthly financial summary', icon: '📊' },
    { title: '🔮 Future Projection', description: 'See your financial future', icon: '🔮' }
  ];

  const handleFeatureClick = (question) => {
    setInput(question);
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">🤖 Voice Finance Assistant</h2>
        <p className="opacity-90 mt-1">Ask me anything about personal finance!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Quick Questions */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Quick Questions</h3>
          <div className="space-y-2">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => setInput(q.label)}
                className="w-full p-3 text-left bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center gap-2"
              >
                <span>{q.icon}</span>
                <span className="text-sm">{q.label}</span>
              </button>
            ))}
          </div>

          {/* AI Features */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-sm mb-3">🤖 AI Features</h4>
            <div className="space-y-2">
              {aiFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => handleFeatureClick(feature.title.replace(feature.icon + ' ', ''))}
                  className="w-full p-2 text-left bg-gradient-to-r from-primary-50 to-trust-50 rounded-xl hover:from-primary-100 hover:to-trust-100 transition-all flex items-center gap-2"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <div className="text-left">
                    <p className="text-xs font-medium text-gray-800">{feature.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Simulation */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button className="w-full py-4 bg-primary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors">
              <span>🎤</span>
              <span>Voice Input</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Tap to speak (Coming soon)</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl message-enter ${
                    msg.role === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send ➤
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

