import React from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Store, CreditCard, ChevronRight, Plus } from 'lucide-react';
import { ShopifyConnectButton } from '../components/shopify/ShopifyConnectButton';

export const StoreIntegration: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] lg:pl-[280px]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="px-4 py-8 sm:px-6 lg:px-10 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your connected stores and payment services.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {/* Shopify Integration */}
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#95BF47]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Store className="w-5 h-5 text-[#95BF47]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Shopify</h3>
                                    <p className="text-xs text-gray-500">Sync products and orders</p>
                                </div>
                            </div>
                            <div className="w-1/2 flex justify-end">
                                <ShopifyConnectButton />
                            </div>
                        </div>

                        {/* Stripe Integration */}
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-5 h-5 text-[#635BFF]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Stripe</h3>
                                    <p className="text-xs text-gray-500">Payment processing</p>
                                </div>
                            </div>
                            <button className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                Connect
                            </button>
                        </div>
                    </div>
                </div>

                {/* Available Soon Section */}
                <div className="mt-8">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Coming Soon</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['WooCommerce', 'Vtex', 'Nuvemshop'].map((platform) => (
                            <div key={platform} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                        <Store className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span className="text-sm text-gray-600">{platform}</span>
                                </div>
                                <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
