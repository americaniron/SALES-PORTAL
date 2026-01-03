import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Loader, Lock, Mail, AlertCircle, WifiOff, Zap } from 'lucide-react';
import { UserRole } from '../types';

const Login = () => {
  const { login } = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performLogin = async (emailInput: string, passwordInput: string) => {
    setError('');
    setIsSubmitting(true);
    const safeEmail = emailInput.trim().toLowerCase();
    const safePassword = passwordInput.trim();

    try {
      let loginSuccess = false;
      let userData = null;
      let token = '';

      // 1. Attempt Real Backend Login
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: safeEmail, password: safePassword }),
        });

        if (response.ok) {
          const data = await response.json();
          userData = data.user;
          token = data.token;
          loginSuccess = true;
        } else {
            console.warn(`Backend returned status ${response.status}`);
        }
      } catch (err) {
        console.warn("Backend API unreachable or network error, checking local credentials...", err);
      }

      // 2. Fallback / Dev Mode / Offline Support
      // If backend failed (404, 500, or network error), check hardcoded admin
      if (!loginSuccess) {
        if (safeEmail === 'admin@americanironus.com' && safePassword === 'admin123') {
           console.log("⚠️ Logging in via Offline/Dev Mode fallback");
           // Simulate network delay for realism
           await new Promise(resolve => setTimeout(resolve, 600));
           
           userData = {
             id: 'dev-admin',
             name: 'System Admin (Offline Mode)',
             role: UserRole.ADMIN,
             email: safeEmail
           };
           token = 'dev-offline-token-' + Date.now();
           loginSuccess = true;
        }
      }

      // 3. Finalize
      if (loginSuccess && userData) {
        login(token, userData);
      } else {
        throw new Error('Invalid email or password.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoLogin = () => {
    setEmail('admin@americanironus.com');
    setPassword('admin123');
    performLogin('admin@americanironus.com', 'admin123');
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-industrial-500 p-8 text-center relative">
          <div className="absolute top-4 right-4 opacity-20">
            <WifiOff size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">AMERICAN IRON</h1>
          <p className="text-white/80 mt-2">Secure Employee Portal</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start">
                <AlertCircle size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-industrial-500 focus:ring-1 focus:ring-industrial-500 transition-colors"
                  placeholder="name@americanironus.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-industrial-500 focus:ring-1 focus:ring-industrial-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-industrial-600 hover:bg-industrial-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Quick Access</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
               <Zap size={18} className="text-industrial-500 fill-industrial-500" />
               <span>One-Click Demo Login</span>
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Authorized personnel only. All access is logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;