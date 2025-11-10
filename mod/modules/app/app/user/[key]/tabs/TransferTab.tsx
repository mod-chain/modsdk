import React, { useEffect, useState } from 'react'
import {
  Send,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  RefreshCcw,
  Server,
} from 'lucide-react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

export const TransferTab: React.FC = () => {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [network, setNetwork] = useState('test')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [api, setApi] = useState<ApiPromise | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [metadataInfo, setMetadataInfo] = useState<any>(null)
  const [connecting, setConnecting] = useState(false)

  const networks = [
    { id: 'test', label: 'Modchain Devnet', url: 'wss://dev.api.modchain.ai' },
  ]

  useEffect(() => {
    const address = localStorage.getItem('wallet_address')
    const mode = localStorage.getItem('wallet_mode')
    if (mode === 'subwallet' && address) {
      setWalletAddress(address)
    }
  }, [])

  const initApi = async () => {
    setConnecting(true)
    setError(null)
    setApi(null)
    setMetadataInfo(null)

    try {
      const selectedNetwork = networks.find((n) => n.id === network)
      if (!selectedNetwork) throw new Error('Network not found')

      const provider = new WsProvider(selectedNetwork.url)
      const apiInstance = await ApiPromise.create({
        provider,
        noInitWarn: true,
      })

      await apiInstance.isReady

      const chain = (await apiInstance.rpc.system.chain()).toString()
      const version = apiInstance.runtimeVersion

      const meta = {
        chain,
        specVersion: version.specVersion.toNumber(),
        txVersion: version.transactionVersion.toNumber(),
        implVersion: version.implVersion.toNumber(),
        genesisHash: apiInstance.genesisHash.toHex(),
      }

      console.log('✅ Connected to chain:', meta)
      setMetadataInfo(meta)
      setApi(apiInstance)

      if (walletAddress) {
        const accountInfo = await apiInstance.query.system.account(walletAddress)
        const freeBalance = accountInfo.data.free.toBigInt()
        setBalance((Number(freeBalance) / 1e12).toFixed(4))
      }
    } catch (err: any) {
      console.error('❌ API connection failed:', err)
      setError(`Connection error: ${String(err.message || err)}`)
    } finally {
      setConnecting(false)
    }
  }

  useEffect(() => {
    initApi()
    return () => {
      if (api) api.disconnect().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, walletAddress])

  const executeTransfer = async () => {
    if (!toAddress || !amount) return setError('Please fill in all fields')
    if (!api?.isReady) return setError('API not ready')
    if (!walletAddress) return setError('No wallet connected')

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const recipientAddress = api.registry.createType(
        'AccountId32',
        toAddress
      ).toString()

      const amountFloat = parseFloat(amount)
      if (isNaN(amountFloat) || amountFloat <= 0)
        throw new Error('Invalid amount')

      const transferAmount = BigInt(Math.floor(amountFloat * 1e12))

      const senderInfo = await api.query.system.account(walletAddress)
      const senderBalance = senderInfo.data.free.toBigInt()
      const feeBuffer = BigInt(100_000_000)
      if (senderBalance < transferAmount + feeBuffer)
        throw new Error('Insufficient balance')

      const extensions = await web3Enable('MOD')
      if (extensions.length === 0)
        throw new Error('SubWallet not found. Please install it.')
      const injector = await web3FromAddress(walletAddress)
      if (!injector?.signer)
        throw new Error('No signer available from SubWallet')

      const tx = api.tx.balances.transferKeepAlive(
        recipientAddress,
        transferAmount
      )

      const result = await new Promise<any>(async (resolve, reject) => {
        let unsub: (() => void) | undefined
        const timeout = setTimeout(() => {
          if (unsub) unsub()
          reject(new Error('Transaction timeout'))
        }, 120_000)

        unsub = await tx.signAndSend(
          walletAddress,
          { signer: injector.signer },
          ({ status, dispatchError, txHash }) => {
            console.log('📊 Status:', status.type)

            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule)
                const { section, name, docs } = decoded
                reject(
                  new Error(`Error: ${section}.${name}: ${docs.join(' ')}`)
                )
              } else {
                reject(new Error(dispatchError.toString()))
              }
            }

            if (status.isInBlock) console.log('✅ In block:', status.asInBlock.toHex())
            if (status.isFinalized) {
              clearTimeout(timeout)
              console.log('🎉 Finalized:', status.asFinalized.toHex())
              resolve({
                success: true,
                blockHash: status.asFinalized.toHex(),
                txHash: txHash.toHex(),
              })
              unsub?.()
            }
          }
        )
      })

      setResponse({
        ...result,
        amount: parseFloat(amount),
        to: toAddress,
        from: walletAddress,
        timestamp: new Date().toISOString(),
      })

      const updatedInfo = await api.query.system.account(walletAddress)
      setBalance((Number(updatedInfo.data.free.toBigInt()) / 1e12).toFixed(4))
      setToAddress('')
      setAmount('')
    } catch (err: any) {
      console.error('❌ Transfer failed:', err)
      let msg = err?.message || String(err)

      if (msg.includes('unreachable') || msg.includes('metadata'))
        msg =
          '⚠️ Metadata/Runtime mismatch detected.\nPlease open SubWallet → Manage Networks → Update Metadata, then refresh this page.'
      else if (msg.includes('1010')) msg = 'Insufficient balance for fees.'
      else if (msg.toLowerCase().includes('cancel'))
        msg = 'Transaction cancelled by user.'

      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Wallet Status */}
      <div
        className={`p-3 rounded-lg border ${
          walletAddress
            ? 'bg-gradient-to-br from-purple-500/10 border-purple-500/30'
            : 'bg-gradient-to-br from-red-500/10 border-red-500/30'
        }`}
      >
        {walletAddress ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <CheckCircle size={16} />
                <span>SUBWALLET CONNECTED</span>
              </div>
              <div className="text-purple-300 text-sm font-mono">
                {balance} MOD
              </div>
            </div>
            <div className="text-purple-500/70 text-xs font-mono mt-1">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
            <AlertCircle size={16} />
            <span>NO WALLET CONNECTED</span>
          </div>
        )}
      </div>

      {/* Metadata Info */}
      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 border border-blue-500/30">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
            <Server size={16} />
            <span>NETWORK METADATA</span>
          </div>
          <button
            onClick={initApi}
            disabled={connecting}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-200 font-mono"
          >
            <RefreshCcw size={14} className={connecting ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        {metadataInfo ? (
          <div className="text-blue-300 text-xs font-mono space-y-1">
            <div>Chain: {metadataInfo.chain}</div>
            <div>Spec Version: {metadataInfo.specVersion}</div>
            <div>Tx Version: {metadataInfo.txVersion}</div>
            <div>Impl Version: {metadataInfo.implVersion}</div>
          </div>
        ) : (
          <div className="text-blue-500/70 text-xs font-mono italic">
            {connecting ? 'Connecting to node...' : 'Not connected'}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 border border-yellow-500/30">
        <div className="text-yellow-400 text-xs font-mono">
          ⚠️ If you get metadata/version errors:
          <ol className="mt-2 ml-4 list-decimal space-y-1">
            <li>Open SubWallet extension</li>
            <li>Go to Settings → Manage networks</li>
            <li>Find "Modchain Devnet" → Update metadata</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-500/5 border border-green-500/20">
        <div className="flex items-center gap-2 text-green-500/70 text-sm font-mono uppercase mb-3">
          <ArrowRightLeft size={16} />
          <span>Transfer Tokens</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-green-500/70 font-mono uppercase">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              disabled={isLoading}
              className="w-full mt-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm focus:outline-none focus:border-green-500 disabled:opacity-50"
            >
              {networks.map((net) => (
                <option key={net.id} value={net.id}>
                  {net.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-green-500/70 font-mono uppercase">
              To Address
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              disabled={isLoading}
              placeholder="5GrwvaEF5zXb26..."
              className="w-full mt-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm placeholder-green-600/50 focus:outline-none focus:border-green-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs text-green-500/70 font-mono uppercase">
              Amount (MOD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              min="0"
              step="0.000000001"
              placeholder="0.0"
              className="w-full mt-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm placeholder-green-600/50 focus:outline-none focus:border-green-500 disabled:opacity-50"
            />
            <p className="text-xs text-green-500/50 mt-1 font-mono">
              Available: {balance} MOD
            </p>
          </div>

          <button
            onClick={executeTransfer}
            disabled={!toAddress || !amount || isLoading || !api?.isReady || !walletAddress}
            className="w-full py-2 border border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all rounded font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Zap size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Transfer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response */}
      {(response || error) && (
        <div
          className={`space-y-3 p-4 rounded-lg border ${
            error
              ? 'from-red-500/5 border-red-500/20'
              : 'from-green-500/5 border-green-500/20'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-mono uppercase">
            {error ? (
              <>
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-red-500">Error</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-green-500">Success</span>
              </>
            )}
          </div>

          {error ? (
            <div className="text-red-400 font-mono text-sm bg-black/50 p-3 rounded border border-red-500/20 whitespace-pre-wrap">
              {error}
            </div>
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

export default TransferTab
