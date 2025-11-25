import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, AlertCircle, RefreshCw, Unplug } from 'lucide-react';
import ShopifyService, { type ConnectionStatus } from '../../services/shopify';

export const ShopifyConnectButton: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [shopDomain, setShopDomain] = useState('');
    const [error, setError] = useState<string | null>(null);

    // TODO: Em produção, obter do contexto de autenticação
    // Por enquanto, usando um ID fixo para demonstração
    const brandId = 1;

    useEffect(() => {
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        setLoading(true);
        try {
            const status = await ShopifyService.getConnectionStatus(brandId);
            setConnectionStatus(status);
        } catch (err) {
            console.error('Erro ao verificar status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!shopDomain.trim()) {
            setError('Por favor, insira o domínio da sua loja');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await ShopifyService.connectStore(brandId, shopDomain);
            
            if (result.success) {
                // Recarrega o status após conectar
                await checkConnectionStatus();
                setShopDomain('');
            } else {
                setError(result.error || 'Falha ao conectar');
            }
        } catch (err) {
            setError('Erro ao iniciar conexão');
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
                // Recarrega o status após sincronizar
                await checkConnectionStatus();
                alert(`Sincronização concluída! ${result.synced} produtos sincronizados.`);
            } else {
                alert(result.error || 'Erro ao sincronizar');
            }
        } catch (err) {
            alert('Erro ao sincronizar produtos');
        } finally {
            setSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!connectionStatus?.store) return;
        
        if (!confirm('Tem certeza que deseja desconectar esta loja? Todos os produtos sincronizados serão removidos.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await ShopifyService.disconnectStore(connectionStatus.store.id);
            
            if (result.success) {
                setConnectionStatus({ connected: false, store: null, productsCount: 0, lastSync: null });
            } else {
                alert(result.error || 'Erro ao desconectar');
            }
        } catch (err) {
            alert('Erro ao desconectar loja');
        } finally {
            setLoading(false);
        }
    };

    // Estado de carregamento inicial
    if (loading && !connectionStatus) {
        return (
            <div className="flex items-center justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
        );
    }

    // Loja conectada
    if (connectionStatus?.connected && connectionStatus.store) {
        const lastSyncFormatted = connectionStatus.lastSync 
            ? new Date(connectionStatus.lastSync).toLocaleString('pt-BR')
            : 'Nunca';

        return (
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {connectionStatus.store.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {connectionStatus.productsCount} produtos • Última sync: {lastSyncFormatted}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing || loading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#95BF47] rounded-lg hover:bg-[#7da93d] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        title="Sincronizar produtos"
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
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Desconectar loja"
                    >
                        <Unplug className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Formulário de conexão
    return (
        <div className="w-full">
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="sua-loja.myshopify.com"
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
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95BF47] focus:border-transparent outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-[#95BF47] rounded-lg hover:bg-[#7da93d] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Conectar'
                    )}
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

export default ShopifyConnectButton;
