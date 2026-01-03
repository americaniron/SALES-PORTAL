import React from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react';

const mockCustomers = [
  { id: 1, name: 'Texas Excavation Inc.', contact: 'Mike Smith', email: 'mike@texasexcavation.com', phone: '(713) 555-0101', location: 'Houston, TX', balance: 4500.00, status: 'Active' },
  { id: 2, name: 'Bayou Heavy Haul', contact: 'Sarah Jones', email: 's.jones@bayouhaul.com', phone: '(225) 555-0102', location: 'Baton Rouge, LA', balance: 0.00, status: 'Active' },
  { id: 3, name: 'Alamo Construction', contact: 'David Wilson', email: 'dwilson@alamo.com', phone: '(210) 555-0103', location: 'San Antonio, TX', balance: 12500.50, status: 'Overdue' },
  { id: 4, name: 'Gulf Coast Cranes', contact: 'Robert Brown', email: 'bob@gulfcranes.com', phone: '(409) 555-0104', location: 'Galveston, TX', balance: 0.00, status: 'Inactive' },
];

const CustomerList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button className="bg-industrial-600 hover:bg-industrial-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-industrial-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>

        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-right">Outstanding Balance</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-xs text-gray-500">ID: #{customer.id.toString().padStart(4, '0')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={14} className="text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{customer.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                  ${customer.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      customer.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;