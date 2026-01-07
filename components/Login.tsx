import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Loader, Lock, Mail, AlertCircle, ShieldAlert } from 'lucide-react';
import { UserRole } from '../types';

const Login = () => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performLogin = async (emailInput: string, passwordInput: string) => {
    if (!auth) return;
    const { login } = auth;
    
    setError('');
    setIsSubmitting(true);
    const safeEmail = emailInput.trim().toLowerCase();
    const safePassword = passwordInput.trim();

    try {
      let loginSuccess = false;
      let userData = null;
      let token = '';

      // 1. Attempt API Login
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
        }
      } catch (err) {
        console.warn("API unreachable, attempting fallback.");
      }

      // 2. Fallback / Bypass
      if (!loginSuccess) {
        if (safeEmail === 'admin@americanironus.com' && safePassword === 'admin123') {
           // Emulate network delay slightly for realism
           await new Promise(r => setTimeout(r, 500));
           
           userData = {
             id: 'usr_admin_bypass',
             name: 'System Admin (Bypass)',
             role: UserRole.ADMIN,
             email: safeEmail
           };
           token = 'bypass-token-static';
           loginSuccess = true;
        }
      }

      if (loginSuccess && userData) {
        login(token, userData);
      } else {
        throw new Error('Invalid credentials. Try: admin@americanironus.com / admin123');
      }

    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@americanironus.com');
    setPassword('admin123');
    performLogin('admin@americanironus.com', 'admin123');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="bg-industrial-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-industrial-500/10 rounded-full -mr-16 -mt-16"></div>
          <h1 className="text-3xl font-black text-white relative z-10">AMERICAN <span className="text-industrial-500">IRON</span></h1>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-semibold relative z-10">Portal Access</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={(e) => { e.preventDefault(); performLogin(email, password); }} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start">
                <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-industrial-500 transition-all text-gray-900"
                  placeholder="admin@americanironus.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-industrial-500 transition-all text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-industrial-600 hover:bg-industrial-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center text-lg shadow-lg hover:shadow-industrial-500/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader className="animate-spin" size={24} /> : 'SIGN IN'}
            </button>
            
            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button 
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full bg-gray-100 hover:bg-industrial-100 text-industrial-800 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-200"
            >
               <ShieldAlert size={18} className="text-industrial-500" />
               <span>Emergency Admin Bypass</span>
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
              Protected by American Iron Security Systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;