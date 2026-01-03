import React from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
];

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="flex items-end space-x-2">
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <span className="text-sm text-green-600 font-medium mb-1">{sub}</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back to the American Iron command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue (MTD)" 
          value="$142,300" 
          sub="+12.5%" 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Active Quotes" 
          value="24" 
          sub="8 Pending" 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="New Leads" 
          value="12" 
          sub="+3 this week" 
          icon={Users} 
          color="bg-industrial-500" 
        />
        <StatCard 
          title="Overdue Invoices" 
          value="$12,450" 
          sub="3 Accounts" 
          icon={AlertTriangle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-industrial-500"></div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Quote #102{i} accepted by ABC Corp</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
