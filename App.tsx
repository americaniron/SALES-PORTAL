import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Bot,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { UserRole } from './types';
import Dashboard from './components/Dashboard';
import QuoteBuilder from './components/QuoteBuilder';
import CustomerList from './components/CustomerList';
import InvoiceList from './components/InvoiceList';
import AIPortal from './components/AIPortal';
import Login from './components/Login';
import Messages from './components/Messages';
import SettingsPage from './components/Settings';
import ExternalQuoter from './components/ExternalQuoter';

// Auth Context
const AuthContext = React.createContext<{
  user: any;
  isLoading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
} | null>(null);

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
      ? 'bg-industrial-500 text-white shadow-lg' 
      : 'text-gray-400 hover:bg-industrial-900 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

interface PortalLayoutProps {
  children?: React.ReactNode;
}

const PortalLayout = ({ children }: PortalLayoutProps) => {
  const { user, logout } = React.useContext(AuthContext)!;
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/', roles: [UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTING] },
    { icon: Bot, label: 'AI Assistant', to: '/ai', roles: [UserRole.ADMIN, UserRole.SALES] },
    { icon: ExternalLink, label: 'AI Quoter (App)', to: '/external-quoter', roles: [UserRole.ADMIN, UserRole.SALES] },
    { icon: Users, label: 'Customers', to: '/customers', roles: [UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTING] },
    { icon: FileText, label: 'Quotes', to: '/quotes', roles: [UserRole.ADMIN, UserRole.SALES] },
    { icon: CreditCard, label: 'Invoices', to: '/invoices', roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
    { icon: MessageSquare, label: 'Messages', to: '/messages', roles: [UserRole.ADMIN, UserRole.SALES] },
    { icon: SettingsIcon, label: 'Settings', to: '/settings', roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#1a1a1a] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-black/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-industrial-500 rounded flex items-center justify-center font-bold text-black">AI</div>
            <span className="text-xl font-bold tracking-tight text-white">AMERICAN <span className="text-industrial-500">IRON</span></span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6 space-y-1">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <SidebarItem 
              key={item.to} 
              icon={item.icon} 
              label={item.label} 
              to={item.to} 
              active={location.pathname === item.to} 
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-gray-400 hover:text-white w-full px-2 py-2 rounded hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm lg:hidden h-16 flex items-center px-4">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-gray-900">American Iron Portal</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem('ai_portal_token');
        const savedUser = localStorage.getItem('ai_portal_user');
        
        if (token && savedUser) {
          // In a production app, verify the token validity with the backend here /api/auth/me
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Session restoration failed", e);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (token: string, userData: any) => {
    setUser(userData);
    localStorage.setItem('ai_portal_token', token);
    localStorage.setItem('ai_portal_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai_portal_token');
    localStorage.removeItem('ai_portal_user');
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading Portal...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/*" element={
            user ? (
              <PortalLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/quotes" element={<QuoteBuilder />} />
                  <Route path="/external-quoter" element={<ExternalQuoter />} />
                  <Route path="/customers" element={<CustomerList />} />
                  <Route path="/invoices" element={<InvoiceList />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/ai" element={<AIPortal />} />
                  <Route path="*" element={<div className="p-8">Page under construction</div>} />
                </Routes>
              </PortalLayout>
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default App;