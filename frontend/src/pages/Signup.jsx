import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

// Icons as SVG components
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'English',
    incomeType: 'daily',
    income: '',
    financialGoals: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const goalOptions = [
    'Emergency Fund',
    'Buy Phone',
    'Education',
    'Start Business',
    'Home',
    'Health',
    'Marriage',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter(g => g !== goal)
        : [...prev.financialGoals, goal]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          income: parseFloat(formData.income) || 0
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          scope: 'email profile openid',
          callback: async (response) => {
            if (response.access_token) {
              try {
                const res = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: response.access_token })
                });
                const data = await res.json();
                if (res.ok) {
                  login(data.user, data.token);
                  navigate('/dashboard');
                } else {
                  setError('Google signup not configured on server.');
                }
              } catch (err) {
                setError('Failed to complete Google signup');
              }
            }
          },
        });
        client.requestAccessToken({ prompt: 'consent' });
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Failed to initiate Google signup.');
    }
  };

  const handleAppleSignup = async () => {
    try {
      const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID';
      const redirectUri = `${window.location.origin}/api/auth/apple/callback`;
      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://appleid.apple.com/auth/authorize?client_id=${appleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20name&state=${state}`;
      sessionStorage.setItem('apple_oauth_state', state);
      window.location.href = authUrl;
    } catch (err) {
      console.error('Apple signup error:', err);
      setError('Failed to initiate Apple signup.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-trust-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background Elements - hidden on small mobile */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob hidden sm:block"></div>
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-trust-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 hidden sm:block"></div>
      <div className="absolute -bottom-8 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 hidden sm:block"></div>
      
      {/* Fixed container - no scrolling */}
      <div className="w-full max-w-lg relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src="/src/assets/logo.png" 
              alt="FinWeave Logo" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">Create your account - Start your financial journey</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            )}

            {/* Name with Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
              <div className={`relative transition-all duration-300 ${nameFocused ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none transition-colors duration-300 ${nameFocused ? 'text-primary-500' : 'text-gray-400'}`}>
                  <UserIcon />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  className={`input-field pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300 ${nameFocused ? 'border-primary-500 shadow-lg shadow-primary-500/20' : ''}`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email with Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
              <div className={`relative transition-all duration-300 ${emailFocused ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none transition-colors duration-300 ${emailFocused ? 'text-primary-500' : 'text-gray-400'}`}>
                  <MailIcon />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`input-field pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300 ${emailFocused ? 'border-primary-500 shadow-lg shadow-primary-500/20' : ''}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password with Icon & Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Password</label>
              <div className={`relative transition-all duration-300 ${passwordFocused ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none transition-colors duration-300 ${passwordFocused ? 'text-primary-500' : 'text-gray-400'}`}>
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`input-field pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300 ${passwordFocused ? 'border-primary-500 shadow-lg shadow-primary-500/20' : ''}`}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Preferred Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="input-field py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Marathi">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Income Type & Amount - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Income Type</label>
                <select
                  name="incomeType"
                  value={formData.incomeType}
                  onChange={handleChange}
                  className="input-field py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Income (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none text-gray-400">
                    <CurrencyIcon />
                  </div>
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    className="input-field pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base"
                    placeholder="Amount"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Financial Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Financial Goals (Select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {goalOptions.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      formData.financialGoals.includes(goal)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 sm:py-3.5 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 sm:w-6 sm:h-6"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 sm:px-3 bg-white text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Social Signup Buttons - stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-lg transition-all duration-200 font-medium text-gray-700 group text-sm sm:text-base"
            >
              <GoogleIcon />
              <span className="group-hover:text-gray-900 transition-colors">Google</span>
            </button>
            <button
              type="button"
              onClick={handleAppleSignup}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-lg transition-all duration-200 font-medium text-gray-700 group text-sm sm:text-base"
            >
              <AppleIcon />
              <span className="group-hover:text-gray-900 transition-colors">Apple</span>
            </button>
          </div>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

