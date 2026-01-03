import React from 'react';
import { Search, Filter, Download, ArrowUpRight } from 'lucide-react';

const mockInvoices = [
  { id: 'INV-2024-001', customer: 'Texas Excavation Inc.', date: '2024-01-15', due: '2024-02-14', amount: 4500.00, status: 'Sent' },
  { id: 'INV-2023-894', customer: 'Alamo Construction', date: '2023-12-01', due: '2023-12-31', amount: 12500.50, status: 'Overdue' },
  { id: 'INV-2024-002', customer: 'Bayou Heavy Haul', date: '2024-01-18', due: '2024-02-17', amount: 2100.00, status: 'Paid' },
  { id: 'INV-2024-003', customer: 'Gulf Coast Cranes', date: '2024-01-20', due: '2024-02-19', amount: 850.00, status: 'Draft' },
];

const InvoiceList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button className="bg-industrial-600 hover:bg-industrial-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">$12,500.50</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Due within 30 days</p>
            <p className="text-2xl font-bold text-gray-900">$6,600.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Drafts</p>
            <p className="text-2xl font-bold text-gray-500">$850.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Paid (MTD)</p>
            <p className="text-2xl font-bold text-green-600">$2,100.00</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search invoices by # or customer..." 
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
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date Issued</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{inv.id}</td>
                <td className="px-6 py-4">{inv.customer}</td>
                <td className="px-6 py-4">{inv.date}</td>
                <td className="px-6 py-4 text-gray-500">{inv.due}</td>
                <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                  ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
                      inv.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                   <button className="text-industrial-600 hover:text-industrial-800 font-medium text-xs flex items-center justify-center gap-1 mx-auto">
                     View <ArrowUpRight size={14} />
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

export default InvoiceList;