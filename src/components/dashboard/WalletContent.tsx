import React, { useState, useRef, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Search,
  ChevronDown,
  Calendar
} from 'lucide-react';

/**
 * WalletContent
 * 
 * The main wallet content without header.
 * Used inside DashboardLayout with sliding tab animation.
 */

interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'refund';
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  orderId?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'sale',
    amount: '$450.00',
    status: 'completed',
    date: '23 Nov, 2025',
    description: 'Sale from Live Shopping Night',
    orderId: '#ORD-7829'
  },
  {
    id: 'TXN-002',
    type: 'withdrawal',
    amount: '$1,200.00',
    status: 'completed',
    date: '22 Nov, 2025',
    description: 'Withdrawal to Bank Account ****1234'
  },
  {
    id: 'TXN-003',
    type: 'sale',
    amount: '$320.50',
    status: 'pending',
    date: '22 Nov, 2025',
    description: 'Sale from Fall Collection Launch',
    orderId: '#ORD-7830'
  },
  {
    id: 'TXN-004',
    type: 'refund',
    amount: '$89.90',
    status: 'completed',
    date: '21 Nov, 2025',
    description: 'Refund for Order #ORD-7825',
    orderId: '#ORD-7825'
  },
  {
    id: 'TXN-005',
    type: 'sale',
    amount: '$670.00',
    status: 'completed',
    date: '20 Nov, 2025',
    description: 'Sale from Black Friday Campaign',
    orderId: '#ORD-7826'
  },
  {
    id: 'TXN-006',
    type: 'withdrawal',
    amount: '$800.00',
    status: 'failed',
    date: '19 Nov, 2025',
    description: 'Withdrawal to Bank Account ****1234'
  },
  {
    id: 'TXN-007',
    type: 'sale',
    amount: '$210.00',
    status: 'completed',
    date: '18 Nov, 2025',
    description: 'Sale from Organic Campaign',
    orderId: '#ORD-7827'
  },
];

export const WalletContent: React.FC = () => {
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('All');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    if (transactionTypeFilter !== 'All' && transaction.type !== transactionTypeFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 pt-6 pr-8 pb-8 pl-8">
      {/* SECTION 1: Metrics Grid (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 gap-x-4 gap-y-4">
        {/* Pending Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pending Balance
            </p>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              $3,450.20
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-slate-400">Releases in 24-48h</span>
            </div>
          </div>
        </div>

        {/* Available for Withdrawal */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Available for Withdrawal
            </p>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              $12,840.50
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Withdraw funds <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Transactions List */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row border-slate-50 border-b p-6 items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="border border-slate-200 text-sm bg-white rounded-lg pt-2 pr-4 pb-2 pl-9 focus:ring-2 focus:ring-purple-100 outline-none w-full md:w-48"
              />
            </div>

            {/* Date Range - Placeholder visual */}
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              <span>Select dates</span>
            </button>

            {/* Type Filter */}
            <div className="relative" ref={typeDropdownRef}>
              <button 
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors min-w-[100px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" /> 
                  <span>{transactionTypeFilter === 'All' ? 'Type' : transactionTypeFilter}</span>
                </div>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {typeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-50 py-1">
                  {['All', 'Sale', 'Withdrawal', 'Refund'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTransactionTypeFilter(type);
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-between ${transactionTypeFilter === type ? 'text-purple-600 bg-purple-50' : 'text-slate-600'}`}
                    >
                      {type}
                      {transactionTypeFilter === type && <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm ml-auto md:ml-0">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider pt-3 pr-6 pb-3 pl-6">Transaction</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="pt-4 pr-6 pb-4 pl-6">
                    <div>
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{txn.description}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{txn.orderId || txn.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${
                        txn.type === 'sale' ? 'bg-green-50' : 
                        txn.type === 'withdrawal' ? 'bg-blue-50' : 'bg-orange-50'
                      }`}>
                        {getTransactionIcon(txn.type)}
                      </div>
                      <span className="text-xs font-medium text-slate-600 capitalize">{txn.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      txn.type === 'sale' ? 'text-green-600' : 
                      txn.type === 'withdrawal' ? 'text-slate-900' : 'text-slate-900'
                    }`}>
                      {txn.type === 'withdrawal' ? '-' : '+'}{txn.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                      txn.status === 'completed' ? 'bg-green-50 text-green-700' : 
                      txn.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                      'bg-red-50 text-red-700'
                    }`}>
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">
                    {txn.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-medium">{filteredTransactions.length}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletContent;

