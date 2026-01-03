import React, { useState, useContext } from 'react';
import { Save, UserPlus, Shield, Loader, CheckCircle } from 'lucide-react';
import { AuthContext } from '../App';
import { UserRole } from '../types';

const SettingsPage = () => {
  const { user } = useContext(AuthContext)!;
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.SALES });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('ai_portal_token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: `User ${newUser.email} created successfully!` });
      setNewUser({ name: '', email: '', password: '', role: UserRole.SALES });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* User Management (Admin Only) */}
      {user.role === UserRole.ADMIN && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
            <Shield size={20} className="text-industrial-600" />
            User Management
          </h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <h3 className="font-medium text-blue-900 mb-2">Create New Login</h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  placeholder="jane@americanironus.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.SALES}>Sales Representative</option>
                  <option value={UserRole.ACCOUNTING}>Accounting</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-2">
                <button 
                  type="submit" 
                  disabled={isCreatingUser}
                  className="flex items-center justify-center space-x-2 w-full md:w-auto px-6 py-2 bg-industrial-600 hover:bg-industrial-500 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isCreatingUser ? <Loader className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  <span>Create User</span>
                </button>
                {message && (
                  <div className={`mt-3 p-3 rounded text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' && <CheckCircle size={16} />}
                    {message.text}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branding Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Branding & Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" defaultValue="American Iron LLC" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color (Hex)</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-gray-200 bg-[#ea580c]"></div>
              <input type="text" defaultValue="#ea580c" className="flex-1 border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Disclaimer (Quotes/Invoices)</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24" defaultValue="Quotes are valid for 30 days. Shipping costs are estimated and may vary. 20% restocking fee on returned parts. No returns on electrical components." />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Email Alerts for New Quotes</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-industrial-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">SMS Reminders for Overdue Invoices</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-industrial-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* API Keys (Admin Only) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-75">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Integrations (Server-Side Configured)</h2>
        <p className="text-sm text-gray-500 mb-4">These keys are set in Cloudflare Environment Variables.</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Stripe Payments</span>
            <span className="text-green-600 text-sm font-bold">Connected</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">SendGrid Email</span>
            <span className="text-green-600 text-sm font-bold">Connected</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Google Gemini AI</span>
            <span className="text-green-600 text-sm font-bold">Connected</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center space-x-2 px-6 py-2 bg-industrial-600 hover:bg-industrial-500 text-white rounded-lg font-medium shadow-sm transition-colors">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;