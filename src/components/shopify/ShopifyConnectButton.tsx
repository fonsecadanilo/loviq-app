import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Loader2, AlertCircle, RefreshCw, Unplug, Store, ExternalLink } from 'lucide-react';
import ShopifyService, { type ConnectionStatus } from '../../services/shopify';

interface ShopifyConnectButtonProps {
    onStatusChange?: (status: ConnectionStatus | null) => void;
}

export const ShopifyConnectButton: React.FC<ShopifyConnectButtonProps> = ({ 
    onStatusChange
}) => {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ 
        connected: false, 
        store: null, 
        productsCount: 0, 
        lastSync: null 
    });
    const [shopDomain, setShopDomain] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [hasChecked, setHasChecked] = useState(false);

    // Use ref to track if we've already notified parent
    const lastNotifiedRef = useRef<string>('');
    const mountedRef = useRef(true);

    // TODO: Em produção, obter do contexto de autenticação
    const brandId = 1;

    // Check connection status only once on mount with timeout
    useEffect(() => {
        mountedRef.current = true;
        
        const checkStatus = async () => {
            setLoading(true);
            
            // Create an AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            try {
                const status = await ShopifyService.getConnectionStatus(brandId);
                clearTimeout(timeoutId);
                
                if (mountedRef.current) {
                    setConnectionStatus(status);
                }
            } catch (err) {
                clearTimeout(timeoutId);
                // On error, keep default (not connected)
                console.error('Error checking Shopify status:', err);
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                    setHasChecked(true);
                }
            }
        };

        checkStatus();

        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Notify parent of status changes
    useEffect(() => {
        if (!hasChecked || !onStatusChange) return;
        
        const statusKey = `${connectionStatus.connected}-${connectionStatus.store?.id || 'null'}`;
        
        if (lastNotifiedRef.current !== statusKey) {
            lastNotifiedRef.current = statusKey;
            onStatusChange(connectionStatus);
        }
    }, [connectionStatus, hasChecked, onStatusChange]);

    const handleConnect = async () => {
        if (!shopDomain.trim()) {
            setError('Please enter your store domain');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await ShopifyService.connectStore(brandId, shopDomain);
            
            if (result.success) {
                const status = await ShopifyService.getConnectionStatus(brandId);
                setConnectionStatus(status);
                setShopDomain('');
            } else {
                setError(result.error || 'Failed to connect');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!connectionStatus?.store) return;

        setSyncing(true);
        try {
            const result = await ShopifyService.syncProducts(connectionStatus.store.id);
            
            if (result.success) {
                const status = await ShopifyService.getConnectionStatus(brandId);
                setConnectionStatus(status);
            }
        } catch (err) {
            console.error('Sync error');
        } finally {
            setSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!connectionStatus?.store) return;
        
        if (!confirm('Are you sure you want to disconnect this store?')) {
            return;
        }

        setLoading(true);
        try {
            const result = await ShopifyService.disconnectStore(connectionStatus.store.id);
            
            if (result.success) {
                setConnectionStatus({ connected: false, store: null, productsCount: 0, lastSync: null });
            }
        } catch (err) {
            console.error('Disconnect error');
        } finally {
            setLoading(false);
        }
    };

    // Loading state (only show during initial check, not after)
    if (loading && !hasChecked) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Checking...</span>
            </div>
        );
    }

    // Connected State
    if (connectionStatus.connected && connectionStatus.store) {
        return (
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-medium text-slate-700 truncate max-w-[120px]">{connectionStatus.store.name}</span>
                    <span className="text-slate-400">•</span>
                    <span>{connectionStatus.productsCount} products</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing || loading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#95BF47] rounded-lg hover:bg-[#7da93d] transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {syncing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Sync
                    </button>
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-slate-200 hover:border-red-100"
                        title="Disconnect store"
                    >
                        <Unplug className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Disconnected Form State (default)
    return (
        <div className="flex gap-2 w-full">
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-4 w-4 text-slate-400 group-focus-within:text-[#95BF47] transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => {
                        setShopDomain(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleConnect();
                        }
                    }}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#95BF47]/20 focus:border-[#95BF47] outline-none bg-slate-50 focus:bg-white transition-all"
                    disabled={loading}
                />
            </div>
            <button
                onClick={handleConnect}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#95BF47] rounded-xl hover:bg-[#7da93d] transition-colors disabled:opacity-70 shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    'Connect'
                )}
            </button>
        </div>
    );
};

export default ShopifyConnectButton;
