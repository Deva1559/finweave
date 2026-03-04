import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    language: 'English',
    incomeType: 'daily',
    income: '',
    financialGoals: [],
    dailySavings: ''
  });
  const [loading, setLoading] = useState(false);
  const { updateUser, user } = useApp();
  const navigate = useNavigate();

  const goalOptions = [
    { id: 'emergency', label: 'Emergency Fund', icon: '🏠' },
    { id: 'phone', label: 'Buy Phone', icon: '📱' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'business', label: 'Start Business', icon: '💼' },
    { id: 'home', label: 'Buy Home', icon: '🏡' },
    { id: 'health', label: 'Health', icon: '🏥' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalToggle = (goalId) => {
    setFormData(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goalId)
        ? prev.financialGoals.filter(g => g !== goalId)
        : [...prev.financialGoals, goalId]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-trust-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= num ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Language */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to FinWeave! 🌟</h2>
              <p className="text-gray-600 mb-6">Let's set up your preferences</p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your preferred language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="input-field text-lg py-4"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
              </select>
            </div>
          )}

          {/* Step 2: Income */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about your income 💰</h2>
              <p className="text-gray-600 mb-6">This helps us customize your savings plan</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How do you get paid?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['daily', 'weekly', 'monthly'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData(prev => ({ ...prev, incomeType: type }))}
                        className={`py-4 rounded-xl font-medium transition-all ${
                          formData.incomeType === type
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average {formData.incomeType} income (₹)
                  </label>
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    className="input-field text-lg py-4"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What are your goals? 🎯</h2>
              <p className="text-gray-600 mb-6">Select all that apply to you</p>
              
              <div className="grid grid-cols-2 gap-4">
                {goalOptions.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      formData.financialGoals.includes(goal.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <p className="font-medium mt-2">{goal.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Savings */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Set your savings goal 💪</h2>
              <p className="text-gray-600 mb-6">Even small amounts add up!</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How much can you save daily? (₹)
                </label>
                <input
                  type="number"
                  name="dailySavings"
                  value={formData.dailySavings}
                  onChange={handleChange}
                  className="input-field text-lg py-4"
                  placeholder="Start with ₹20"
                />
                
                <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                  <p className="text-primary-700">
                    💡 If you save ₹{formData.dailySavings || 0} daily, you'll have approximately
                    <span className="font-bold"> ₹{((formData.dailySavings || 0) * 30).toLocaleString()}</span> in a month!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Get Started!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

