import React, { useEffect, useRef, useState } from 'react'
import { CheckCircle, Loader2, AlertCircle, RefreshCw, Unplug, Store, KeyRound, LockKeyhole } from 'lucide-react'
import { WooCommerceService, type ConnectionStatus } from '../../services/woocommerce'

interface WooCommerceConnectButtonProps {
  onStatusChange?: (status: ConnectionStatus | null) => void
}

export const WooCommerceConnectButton: React.FC<WooCommerceConnectButtonProps> = ({ onStatusChange }) => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false, store: null, productsCount: 0, lastSync: null })
  const [siteUrl, setSiteUrl] = useState('')
  const [consumerKey, setConsumerKey] = useState('')
  const [consumerSecret, setConsumerSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const lastNotifiedRef = useRef<string>('')
  const mountedRef = useRef(true)
  const brandId = 1
  const [testing, setTesting] = useState(false)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  useEffect(() => {
    mountedRef.current = true
    const checkStatus = async () => {
      setLoading(true)
      try {
        const status = await WooCommerceService.getConnectionStatus(brandId)
        if (mountedRef.current) setConnectionStatus(status)
      } catch {
        void 0
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setHasChecked(true)
        }
      }
    }
    checkStatus()
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!hasChecked || !onStatusChange) return
    const statusKey = `${connectionStatus.connected}-${connectionStatus.store?.id || 'null'}`
    if (lastNotifiedRef.current !== statusKey) {
      lastNotifiedRef.current = statusKey
      onStatusChange(connectionStatus)
    }
  }, [connectionStatus, hasChecked, onStatusChange])

  const handleConnect = async () => {
    const url = siteUrl.trim()
    const ck = consumerKey.trim()
    const cs = consumerSecret.trim()
    if (!url || !ck || !cs) {
      setError('Informe URL, Consumer Key e Consumer Secret')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await WooCommerceService.connectStore(brandId, url, ck, cs)
      if (result.success) {
        const status = await WooCommerceService.getConnectionStatus(brandId)
        setConnectionStatus(status)
        setSiteUrl('')
        setConsumerKey('')
        setConsumerSecret('')
      } else {
        const em = result.error || 'Falha ao conectar'
        setError(em)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    if (!connectionStatus?.store) return
    setSyncing(true)
    try {
      const result = await WooCommerceService.syncProducts(connectionStatus.store.id)
      if (result.success) {
        const status = await WooCommerceService.getConnectionStatus(brandId)
        setConnectionStatus(status)
      }
    } catch {
      void 0
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!connectionStatus?.store) return
    if (!confirm('Deseja desconectar esta loja?')) return
    setLoading(true)
    try {
      const result = await WooCommerceService.disconnectStore(connectionStatus.store.id)
      if (result.success) setConnectionStatus({ connected: false, store: null, productsCount: 0, lastSync: null })
    } catch {
      void 0
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestMessage(null)
    try {
      const res = await WooCommerceService.listRemoteProducts({ brand_id: brandId, limit: 1 })
      if (res.success) {
        setTestMessage('Conexão OK')
      } else {
        setTestMessage(res.error || 'Falha ao testar conexão')
      }
    } catch (e) {
      setTestMessage(e instanceof Error ? e.message : 'Falha ao testar conexão')
    } finally {
      setTesting(false)
    }
  }

  if (loading && !hasChecked) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">Checking...</span>
      </div>
    )
  }

  if (connectionStatus.connected && connectionStatus.store) {
    return (
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span className="font-medium text-slate-700 truncate max-w-[120px]">{connectionStatus.store.name}</span>
          <span className="text-slate-400">•</span>
          <span>{connectionStatus.productsCount} products</span>
          {testMessage && (
            <span className={`ml-2 ${testMessage === 'Conexão OK' ? 'text-green-600' : 'text-red-600'}`}>{testMessage}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing || loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#96588A] rounded-lg hover:bg-[#824c79] transition-colors disabled:opacity-70 shadow-sm">
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync
          </button>
          <button onClick={handleTestConnection} disabled={testing || loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-70 shadow-sm border border-slate-200">
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Testar conexão
          </button>
          <button onClick={handleDisconnect} disabled={loading} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-slate-200 hover:border-red-100" title="Disconnect store">
            <Unplug className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Store className="h-4 w-4 text-slate-400 group-focus-within:text-[#96588A] transition-colors" />
          </div>
          <input type="text" placeholder="https://example.com" value={siteUrl} onChange={(e) => { setSiteUrl(e.target.value); setError(null) }} className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-[#96588A]/20 focus:border-[#96588A] outline-none bg-slate-50 focus:bg-white transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'}`} disabled={loading} />
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <KeyRound className="h-4 w-4 text-slate-400 group-focus-within:text-[#96588A] transition-colors" />
          </div>
          <input type="text" placeholder="Consumer Key" value={consumerKey} onChange={(e) => { setConsumerKey(e.target.value); setError(null) }} className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-[#96588A]/20 focus:border-[#96588A] outline-none bg-slate-50 focus:bg-white transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'}`} disabled={loading} />
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockKeyhole className="h-4 w-4 text-slate-400 group-focus-within:text-[#96588A] transition-colors" />
          </div>
          <input type="password" placeholder="Consumer Secret" value={consumerSecret} onChange={(e) => { setConsumerSecret(e.target.value); setError(null) }} className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-[#96588A]/20 focus:border-[#96588A] outline-none bg-slate-50 focus:bg-white transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'}`} disabled={loading} />
        </div>
        <button onClick={handleConnect} disabled={loading || !siteUrl.trim() || !consumerKey.trim() || !consumerSecret.trim()} className="md:col-span-3 px-4 py-2 text-sm font-medium text-white bg-[#96588A] rounded-xl hover:bg-[#824c79] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 whitespace-nowrap">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default WooCommerceConnectButton
