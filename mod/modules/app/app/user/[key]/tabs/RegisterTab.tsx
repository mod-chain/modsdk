'use client'
import { useState } from 'react'
import { Send, Zap, CheckCircle, AlertCircle, Rocket } from 'lucide-react'
import { Key } from '@/app/block/key'
import Client from '@/app/block/client'

interface RegisterTabProps {
  keyInstance: Key
}

export const RegisterTab = ({ keyInstance }: RegisterTabProps) => {
  const [moduleName, setModuleName] = useState('api')
  const [take, setTake] = useState(0)
  const [network, setNetwork] = useState('test')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const networks = [
    { id: 'test', label: 'Testnet', url: 'dev.api.modchain.ai' },
  ]

  const registerModule = async () => {
    if (!moduleName || !keyInstance) return
    
    setIsLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      const selectedNetwork = networks.find(n => n.id === network)
      if (!selectedNetwork) throw new Error('Invalid network')

      const client = new Client(selectedNetwork.url, keyInstance)
      
      const result = await client.call('reg', {
        name: moduleName,
        take: take
      })

      setResponse(result)
    } catch (err: any) {
      setError(err.message || 'Failed to register module')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
        <div className="flex items-center gap-2 text-green-500/70 text-sm font-mono uppercase mb-3">
          <Rocket size={16} />
          <span>Register Module</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-green-500/70 font-mono uppercase">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full mt-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm focus:outline-none focus:border-green-500"
            >
              {networks.map((net) => (
                <option key={net.id} value={net.id}>
                  {net.label} ({net.url})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-green-500/70 font-mono uppercase">Module Name</label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="e.g., api, model, service"
              className="w-full mt-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm placeholder-green-600/50 focus:outline-none focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="text-xs text-green-500/70 font-mono uppercase">Take (%)</label>
            <input
              type="number"
              value={take}
              onChange={(e) => setTake(Number(e.target.value))}
              min="0"
              max="100"
              placeholder="0"
              className="w-full mt-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm placeholder-green-600/50 focus:outline-none focus:border-green-500"
            />
          </div>
          
          <button
            onClick={registerModule}
            disabled={!moduleName || isLoading}
            className="w-full py-2 border border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all rounded font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Zap size={16} className="animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Register Module</span>
              </>
            )}
          </button>
        </div>
      </div>

      {(response || error) && (
        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
          <div className="flex items-center gap-2 text-green-500/70 text-sm font-mono uppercase">
            {error ? <AlertCircle size={16} className="text-red-500" /> : <CheckCircle size={16} />}
            <span>{error ? 'Error' : 'Response'}</span>
          </div>
          {error ? (
            <div className="text-red-400 font-mono text-sm">{error}</div>
          ) : (
            <pre className="text-green-400 font-mono text-xs overflow-x-auto bg-black/50 p-3 rounded border border-green-500/20">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

export default RegisterTab