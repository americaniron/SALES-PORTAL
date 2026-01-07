import React from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, MapPin, FilePlus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <button className="bg-industrial-600 hover:bg-industrial-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-industrial-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
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
                <tr 
                  key={customer.id} 
                  className={`group transition-all hover:bg-gray-50 relative
                    ${customer.status === 'Overdue' ? 'bg-red-50/30' : ''}
                  `}
                >
                  <td className={`px-6 py-4 ${customer.status === 'Overdue' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}`}>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">ID: #{customer.id.toString().padStart(4, '0')}</div>
                  </td>
                  
                  {/* Contact Column with Tooltip */}
                  <td className="px-6 py-4 relative">
                    <div className="group/tooltip relative inline-flex items-center cursor-help">
                      <span className="font-medium text-gray-700 border-b border-dashed border-gray-300 pb-0.5">{customer.contact}</span>
                      
                      {/* Tooltip Content */}
                      <div className="invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all duration-200 absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none transform translate-y-2 group-hover/tooltip:translate-y-0">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                          <span className="font-bold text-gray-100">Contact Details</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail size={12} className="text-gray-400 shrink-0"/> 
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-gray-400 shrink-0"/> 
                          <span>{customer.phone}</span>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{customer.location}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <span className={customer.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-gray-900'}>
                      ${customer.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {customer.status === 'Overdue' && (
                       <AlertTriangle size={12} className="inline-block ml-1 text-red-500 mb-0.5" />
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1
                      ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        customer.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to="/quotes" 
                        title="Create Quote"
                        className="p-2 text-industrial-600 hover:bg-industrial-100 rounded-lg transition-colors"
                      >
                        <FilePlus size={18} />
                      </Link>
                      <button 
                        title="More Actions"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;