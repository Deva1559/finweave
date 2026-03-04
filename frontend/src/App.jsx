import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';

// Context for global state
export const AppContext = createContext();

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Summary from './pages/Summary';
import FinancialTwin from './pages/FinancialTwin';
import MicroSavings from './pages/MicroSavings';
import Community from './pages/Community';
import AIAssistant from './pages/AIAssistant';
import Education from './pages/Education';
import Goals from './pages/Goals';
import Investment from './pages/Investment';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// OneSignal
import { initializeOneSignal, getOneSignalPlayerId, requestNotificationPermission } from './onesignal';

// API Helper
const API_URL = '/api';

export const useApp = () => useContext(AppContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    checkAuth();
    // Initialize OneSignal
    initializeOneSignal().then(() => {
      console.log('OneSignal initialized');
    }).catch(err => {
      console.log('OneSignal not available:', err.message);
    });
  }, []);

  // Function to save OneSignal player ID to backend
  const saveOneSignalPlayerId = async (playerId) => {
    if (!playerId || !token) return;
    try {
      await fetch(`${API_URL}/user/onesignal-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ playerId })
      });
    } catch (err) {
      console.error('Error saving OneSignal ID:', err);
    }
  };

  // Request notification permission and get player ID
  const setupNotifications = async () => {
    try {
      await requestNotificationPermission();
      const playerId = await getOneSignalPlayerId();
      if (playerId) {
        await saveOneSignalPlayerId(playerId);
        console.log('OneSignal player ID saved:', playerId);
      }
    } catch (err) {
      console.error('Error setting up notifications:', err);
    }
  };

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
    setLoading(false);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-trust-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FinWeave...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, token, login, logout, updateUser, API_URL }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={user ? <DashboardWithLayout /> : <Navigate to="/login" />} />
          <Route path="/summary" element={user ? <SummaryWithLayout /> : <Navigate to="/login" />} />
          <Route path="/financial-twin" element={user ? <FinancialTwinWithLayout /> : <Navigate to="/login" />} />
          <Route path="/micro-savings" element={user ? <MicroSavingsWithLayout /> : <Navigate to="/login" />} />
          <Route path="/community" element={user ? <CommunityWithLayout /> : <Navigate to="/login" />} />
          <Route path="/ai-assistant" element={user ? <AIAssistantWithLayout /> : <Navigate to="/login" />} />
          <Route path="/education" element={user ? <EducationWithLayout /> : <Navigate to="/login" />} />
<Route path="/goals" element={user ? <GoalsWithLayout /> : <Navigate to="/login" />} />
          <Route path="/investment" element={user ? <InvestmentWithLayout /> : <Navigate to="/login" />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

// Layout Components
function DashboardWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

function SummaryWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <Summary />
        </main>
      </div>
    </div>
  );
}

function FinancialTwinWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <FinancialTwin />
        </main>
      </div>
    </div>
  );
}

function MicroSavingsWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <MicroSavings />
        </main>
      </div>
    </div>
  );
}

function CommunityWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <Community />
        </main>
      </div>
    </div>
  );
}

function AIAssistantWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <AIAssistant />
        </main>
      </div>
    </div>
  );
}

function EducationWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <Education />
        </main>
      </div>
    </div>
  );
}

function GoalsWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <Goals />
        </main>
      </div>
    </div>
  );
}

function InvestmentWithLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-20 px-6">
          <Investment />
        </main>
      </div>
    </div>
  );
}

export default App;

