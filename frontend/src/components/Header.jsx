import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-14 sm:h-16 bg-white shadow-sm z-30 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      {/* Left - Page Title or Welcome */}
      <div className="flex items-center">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Welcome back, {user?.name || 'User'}
        </h2>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications - Hidden on very small screens */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden xs:block">
          <span className="text-lg sm:text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative group">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:block font-medium text-gray-700 text-sm">{user?.name || 'User'}</span>
            <span className="hidden sm:block text-gray-400 text-xs">▼</span>
          </button>
          
          {/* Dropdown Menu */}
          <div className={`
            absolute right-0 top-full mt-1 sm:mt-2 w-40 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-100 
            transition-all duration-200
            ${isProfileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          `}>
            <div className="p-1.5 sm:p-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

