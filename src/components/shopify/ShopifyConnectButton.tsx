import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { ShopifyService, ShopifyIntegration } from '../../services/shopify';

export const ShopifyConnectButton: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [integration, setIntegration] = useState<ShopifyIntegration | null>(null);
    const [shopDomain, setShopDomain] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Mock User ID for demo purposes - in real app get from auth context
    const userId = 'mock-user-id';

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const data = await ShopifyService.getIntegrationStatus(userId);
            setIntegration(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleConnect = async () => {
        if (!shopDomain) {
            setError('Please enter your shop domain');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Clean domain input
            const domain = shopDomain.replace('https://', '').replace('http://', '').replace('/', '');
            await ShopifyService.connectStore(domain);
        } catch (err) {
            setError('Failed to initiate connection');
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            await ShopifyService.syncProducts(userId);
            alert('Sync started successfully!');
        } catch (err) {
            alert('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    if (integration) {
        return (
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Connected to {integration.shop_domain}</p>
                        <p className="text-xs text-gray-500">Last synced: Just now</p>
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={loading}
                    className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Products'}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="your-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95BF47] focus:border-transparent outline-none"
                />
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                </button>
            </div>
            {error && (
                <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
