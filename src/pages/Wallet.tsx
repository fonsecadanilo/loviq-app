import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Card, CardContent } from '../components/ui/Card';
import { DollarSign, TrendingDown, Settings, ArrowUpRight, ChevronDown, X, Search, ArrowDownRight, RotateCcw } from 'lucide-react';
import { DateRangePicker } from '../components/ui/DateRangePicker';

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

export const Wallet: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
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
        // Type filter
        if (transactionTypeFilter !== 'All' && transaction.type !== transactionTypeFilter.toLowerCase()) {
            return false;
        }

        // Date range filter
        if (dateFrom && dateTo) {
            // Simple string comparison for mock data (YYYY-MM-DD)
            // In real app, convert to Date objects
            // transaction.date is "DD Mon, YYYY", so we'd need parsing
            // For now, just showing UI behavior
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

    const stats = [
        {
            title: 'Pending Balance',
            value: '$3,450.20',
            icon: DollarSign,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
        },
        {
            title: 'Available for Withdrawal',
            value: '$12,840.50',
            icon: TrendingDown,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ];

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

    const getStatusBadge = (status: string) => {
        const statusStyles = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] lg:pl-[280px]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="px-4 py-8 sm:px-6 lg:px-10">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your earnings and withdrawals</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                            <Settings className="w-4 h-4" />
                            <span>Wallet Settings</span>
                        </button>
                        <button className="inline-flex items-center gap-2 bg-[#7D2AE8] text-white px-4 py-2 rounded-lg hover:bg-[#6d24ca] transition-colors font-medium text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Withdraw</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {stats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <Card key={index} className="border-[#E2E8F0]">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    {/* Date Range Filter */}
                    <DateRangePicker
                        placeholder="Select date range"
                        onRangeChange={(range) => {
                            if (range.from && range.to) {
                                setDateFrom(range.from.toISOString().split('T')[0]);
                                setDateTo(range.to.toISOString().split('T')[0]);
                            } else {
                                setDateFrom('');
                                setDateTo('');
                            }
                        }}
                    />

                    {/* Transaction Type Filter */}
                    <div className="relative" ref={typeDropdownRef}>
                        <button
                            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                            className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors min-w-[140px]"
                        >
                            <p className="text-sm font-normal text-gray-600">
                                Type {transactionTypeFilter !== 'All' && `(1)`}
                            </p>
                            {transactionTypeFilter !== 'All' ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTransactionTypeFilter('All');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                        </button>

                        {typeDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="p-2">
                                    {['All', 'Sale', 'Withdrawal', 'Refund'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setTransactionTypeFilter(type);
                                                setTypeDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-between"
                                        >
                                            <span>{type}</span>
                                            {transactionTypeFilter === type && (
                                                <div className="w-1.5 h-1.5 bg-[#7D2AE8] rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.description}
                                                </div>
                                                {transaction.orderId && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {transaction.orderId}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getTransactionIcon(transaction.type)}
                                                <span className="text-sm text-gray-700 capitalize">
                                                    {transaction.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-semibold ${transaction.type === 'sale' ? 'text-green-600' :
                                                transaction.type === 'withdrawal' ? 'text-blue-600' :
                                                    'text-orange-600'
                                                }`}>
                                                {transaction.type === 'withdrawal' && '-'}
                                                {transaction.type === 'refund' && '-'}
                                                {transaction.amount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(transaction.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">{transaction.date}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-medium">{filteredTransactions.length}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === page
                                        ? 'bg-[#7D2AE8] text-white border-[#7D2AE8]'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
