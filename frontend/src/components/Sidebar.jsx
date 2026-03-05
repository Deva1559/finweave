import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { useState } from 'react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/summary', label: 'Monthly Summary', icon: '📈' },
  { path: '/financial-twin', label: 'Financial Twin', icon: '🔮' },
  { path: '/micro-savings', label: 'Micro Savings', icon: '💰' },
  { path: '/goals', label: 'Goals', icon: '🎯' },
  { path: '/investment', label: 'Gold Investment', icon: '📊' },
  { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
  { path: '/education', label: 'Education', icon: '📚' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white shadow-xl z-50 
        flex flex-col transition-transform duration-300 ease-in-out
        w-64 sm:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h1 className="text-xl sm:text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            FinWeave
          </h1>
          <p className="text-xs text-gray-500 mt-1 hidden sm:block">Financial Inclusion for All</p>
        </div>

        {/* User Info */}
        <div className="p-3 sm:p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">Trust Score: {user?.trustScore || 50}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base
                    ${isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                    }
                  `}
                >
                  <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
                  <span className="truncate hidden sm:inline">{item.label}</span>
                  <span className="truncate sm:hidden">{item.label.split(' ')[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100">
          <Link
            to="/ai-assistant"
            onClick={() => setIsOpen(false)}
            className="block bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-3 sm:p-4 text-white hover:opacity-90 transition-opacity"
          >
            <p className="font-semibold text-sm">Need Help?</p>
            <p className="text-xs opacity-80 mt-1 hidden sm:block">Chat with our AI assistant</p>
          </Link>
        </div>
      </div>
    </>
  );
}

