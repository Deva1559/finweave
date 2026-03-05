import { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';

export default function AIAssistant() {
  const { user, token, API_URL } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isInitialLoad) {
      loadChatHistory();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map((msg, index) => ({
          ...msg,
          id: index + 1,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        // Set initial welcome message if no history
        setMessages([{
          id: 1,
          role: 'assistant',
          content: `Hello! I'm FinWeave's AI Assistant 🤖

I'm here to help you with:
• 💰 Savings advice
• 📊 Budget tips
• 🎯 Goal planning
• 📚 Financial education

What would you like to know about?`,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
      // Set initial welcome message on error
      setMessages([{
        id: 1,
        role: 'assistant',
        content: `Hello! I'm FinWeave's AI Assistant 🤖

I'm here to help you with:
• 💰 Savings advice
• 📊 Budget tips
• 🎯 Goal planning
• 📚 Financial education

What would you like to know about?`,
        timestamp: new Date()
      }]);
    }
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

  const handleQuickQuestion = (question) => {
    setInput(question);
    setIsMenuOpen(false);
  };

  const quickQuestions = [
    { label: 'How to save money?', icon: '💰' },
    { label: 'Analyze my spending', icon: '📊' },
    { label: 'Create a budget', icon: '💵' },
    { label: 'Set financial goals', icon: '🎯' },
    { label: 'Emergency fund', icon: '🏠' },
    { label: 'Pay off debt', icon: '💳' },
    { label: 'Investment basics', icon: '📈' },
    { label: 'Tax saving tips', icon: '🧾' },
    { label: 'Retirement planning', icon: '🏖️' },
    { label: 'Insurance guide', icon: '🛡️' }
  ];

  const aiFeatures = [
    { title: 'Spending Analysis', icon: '📈' },
    { title: 'Goal Tracker', icon: '🎯' },
    { title: 'Smart Budget', icon: '💡' },
    { title: 'Expense Alerts', icon: '⚠️' },
    { title: 'Monthly Report', icon: '📊' },
    { title: 'Future Projection', icon: '🔮' }
  ];

  return (
    <div className="relative h-[calc(100vh-140px)] animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
        <h2 className="text-2xl font-bold">🤖 FinWeave AI Assistant</h2>
        <p className="opacity-90 mt-1">Ask me anything about personal finance!</p>
      </div>

      {/* Toggle Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed right-6 bottom-6 z-50 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
      >
        {isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Slider Menu */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto p-4 pt-20">
          {/* Quick Questions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-800">Quick Questions</h3>
            <div className="space-y-2">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(q.label)}
                  className="w-full p-3 text-left bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center gap-2"
                >
                  <span>{q.icon}</span>
                  <span className="text-sm">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-sm mb-3 text-gray-800">AI Features</h4>
            <div className="space-y-2">
              {aiFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(feature.title)}
                  className="w-full p-3 text-left bg-gradient-to-r from-primary-50 to-trust-50 rounded-xl hover:from-primary-100 hover:to-trust-100 transition-all flex items-center gap-3"
                >
                  <span className="text-xl">{feature.icon}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">{feature.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button className="w-full py-4 bg-primary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors">
              <span>🎤</span>
              <span>Voice Input</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Tap to speak (Coming soon)</p>
          </div>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Chat Area - Full Screen */}
      <div className="bg-white rounded-xl shadow-sm flex flex-col h-[calc(100%-120px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white' : 'text-gray-500'}`}>
                  {msg.timestamp && typeof msg.timestamp === 'object' && msg.timestamp.toLocaleTimeString ? msg.timestamp.toLocaleTimeString() : new Date(msg.timestamp).toLocaleTimeString()}
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
  );
}

