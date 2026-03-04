import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/summary', label: 'Monthly Summary', icon: '📈' },
  { path: '/financial-twin', label: 'Financial Twin', icon: '🔮' },
  { path: '/micro-savings', label: 'Micro Savings', icon: '💰' },
  { path: '/goals', label: 'Goals', icon: '🎯' },
  { path: '/community', label: 'Community', icon: '👥' },
  { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
  { path: '/education', label: 'Education', icon: '📚' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useApp();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          FinWeave
        </h1>
        <p className="text-xs text-gray-500 mt-1">Financial Inclusion for All</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">Trust Score: {user?.trustScore || 50}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <p className="font-semibold text-sm">Need Help?</p>
          <p className="text-xs opacity-80 mt-1">Chat with our AI assistant</p>
        </div>
      </div>
    </div>
  );
}

