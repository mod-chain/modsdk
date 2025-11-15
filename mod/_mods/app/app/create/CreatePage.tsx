'use client'
import { useEffect, useState } from 'react'
import { Package, Upload, Github, Database, Send, Loader2, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react'
import {useUserContext} from '@/app/block/context/UserContext'
import { Key } from '@/app/block/key'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import ModCard from '@/app/mod/explore/ModCard'
import { ModuleType } from '@/app/types'


export const CreateMod = ( ) => {
  const { client, localKey } = useUserContext()
  const [isSubwalletEnabled, setIsSubwalletEnabled] = useState(false)
  const [modUrl, setModUrl] = useState('')
  const [modName, setModName] = useState('')
  const [collateral, setCollateral] = useState(0.0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [signatureInfo, setSignatureInfo] = useState<{signature: string, timestamp: number, address: string} | null>(null)
  const [isLocalWallet, setIsLocalWallet] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [regInfo, setRegInfo] = useState<string>('')
  const [createdMod, setCreatedMod] = useState<ModuleType | null>(null)

  useEffect(() => {
    const walletMode = localStorage.getItem('wallet_mode')
    const address = localStorage.getItem('wallet_address')
    const password = localStorage.getItem('wallet_password')
    
    setIsSubwalletEnabled(walletMode === 'subwallet')
    setIsLocalWallet(walletMode === 'local')
    setWalletAddress(address || '')
    
  }, [client])


  const handleUrlChange = (e) => {
    const value = e.target.value || '';
    setModUrl(value);

  if (!client) {
        throw new Error('Client not initialized')
      }

    const namePart = value.split('/')[value.split('/').length - 1];
    setModName(namePart);

  };

  const handleNameChange = (e) => {
    setModName(e.target.value || '');
  };

  const generateRegInfo = async () => {
    if (!modUrl.trim()) {
      setError('Please enter a valid URL or IPFS hash')
      return
    }

    setIsPreviewLoading(true)
    setError(null)

    try {
      if (!client) {
        throw new Error('Client not initialized')
      }
      let signature: string
      let signerAddress: string
      let mod_preview: any
      if (isSubwalletEnabled && walletAddress) {

        mod_preview = await client.call('mod_preview', {'url': modUrl.trim(), 'key':walletAddress , 'collateral': collateral})
        let messageToSign = JSON.stringify(mod_preview)

        const extensions = await web3Enable('MOD')
        if (extensions.length === 0) {
          throw new Error('SubWallet not found. Please install it.')
        }
        
        const injector = await web3FromAddress(walletAddress)
        const signRaw = injector?.signer?.signRaw
        if (signRaw) {
          const { signature: sig } = await signRaw({
            address: walletAddress,
            data: u8aToHex(stringToU8a(messageToSign)),
            type: 'bytes'
          })
          signature = sig
          signerAddress = walletAddress
        } else {
          throw new Error('SubWallet signing not available')
        }
      } else if (isLocalWallet) {
        if (!localKey) {
          throw new Error('Local key not found. Please sign in with Local Key.')
        }
        mod_preview = await client.call('mod_preview', {'url': modUrl.trim(), 'key':localKey.address , 'collateral': collateral})
        let messageToSign = JSON.stringify(mod_preview)
        signature = localKey.sign(messageToSign)
        signerAddress = localKey.address
        console.log('Signed with local key:', { signature, signerAddress })
      } else {
        throw new Error('No signing method available. Please connect SubWallet or sign in with Local Key first.')
      }
      const previewData = {
        ...mod_preview,
        signature: signature,
      }
        
      setRegInfo(JSON.stringify(previewData, null, 2))
      setError(null)
    } catch (err: any) {
      console.error('Preview generation error:', err)
      setError(err.message || 'Failed to generate preview')
      setRegInfo('')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleCreateModule = async () => {
    if (!modUrl.trim()) {
      setError('Please enter a valid URL or IPFS hash')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setSignatureInfo(null)
    setCreatedMod(null)


    try {
      const timestamp = Date.now()
      const messageToSign = `${modUrl.trim()}:${timestamp}`
      let signature: string
      let signerAddress: string
      let wallet_mode = localStorage.getItem('wallet_mode') || 'local'
      if (wallet_mode === 'subwallet' && walletAddress) {
        const extensions = await web3Enable('MOD')
        if (extensions.length === 0) {
          throw new Error('SubWallet not found. Please install it.')
        }
        
        const injector = await web3FromAddress(walletAddress)
        const signRaw = injector?.signer?.signRaw
        
        if (signRaw) {
          const { signature: sig } = await signRaw({
            address: walletAddress,
            data: u8aToHex(stringToU8a(messageToSign)),
            type: 'bytes'
          })
          signature = sig
          signerAddress = walletAddress
        } else {
          throw new Error('SubWallet signing not available')
        }
      } else if (wallet_mode === 'local' && localKey) {
        signature = localKey.sign(messageToSign)
        signerAddress = localKey.address
        console.log('Signed with local key:', { signature, signerAddress })
      } else {
        throw new Error('No signing method available. Please connect SubWallet or sign in with Local Key first.')
      }

      const params = {
        url: modUrl.trim(),
        name: modName.trim() || undefined,
        collateral: collateral,
        signature: signature,
        timestamp: timestamp,
        key: signerAddress
      }
      const regInfoObj = regInfo ? JSON.parse(regInfo) : null 
      if (!client) {
        throw new Error('Client not initialized')
      }
      const response = await client.call('reg', {mod: regInfoObj} )
      
      setSignatureInfo({
        signature: signature,
        timestamp: timestamp,
        address: signerAddress
      })
      
      const newMod: ModuleType = {
        name: modName.trim() || response?.name || 'New Module',
        key: signerAddress,
        desc: response?.desc || '',
        cid: response?.cid || '',
        created: timestamp,
        updated: timestamp,
        balance: 0
      }
      
      setCreatedMod(newMod)
      setSuccess(`Module created successfully! Response: ${JSON.stringify(response)}`)
      setModUrl('')
      setModName('')
      setCollateral(0.0)
      setRegInfo('')
    } catch (err: any) {
      console.error('Module creation error:', err)
      setError(err.message || 'Failed to create module')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            CREATE MODULE
          </h1>
          <p className="text-gray-400 text-lg font-mono">
            Deploy your module to the network
          </p>
        </div>


        {/* MAIN FORM */}
        <div className="rounded-xl bg-black border-2 border-cyan-500/40 p-8 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
          <div className="space-y-6">
            {/* URL INPUT */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wider">
                <Github size={18} />
                <span>Repository URL or IPFS Hash</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={modUrl}
                  onChange={handleUrlChange}
                  placeholder="https://github.com/username/repo or ipfs://Qm..."
                  className="w-full bg-black/90 border-2 border-cyan-500/40 rounded-lg px-4 py-4 pl-12 text-cyan-300 font-mono text-base placeholder-cyan-600/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/70">
                  {modUrl.includes('github') ? <Github size={22} /> : <Database size={22} />}
                </div>
              </div>
            </div>

            {/* NAME INPUT */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wider">
                <Package size={18} />
                <span>Module Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={modName}
                  onChange={handleNameChange}
                  placeholder="my-awesome-module"
                  className="w-full bg-black/90 border-2 border-cyan-500/40 rounded-lg px-4 py-4 pl-12 text-cyan-300 font-mono text-base placeholder-cyan-600/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/70">
                  <Package size={22} />
                </div>
              </div>
            </div>

            {/* COLLATERAL INPUT */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wider">
                <Database size={18} />
                <span>Collateral Amount</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={collateral}
                  onChange={(e) => setCollateral(parseFloat(e.target.value) || 0.0)}
                  placeholder="0.00"
                  className="w-full bg-black/90 border-2 border-cyan-500/40 rounded-lg px-4 py-4 pl-12 text-cyan-300 font-mono text-base placeholder-cyan-600/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/70">
                  <Database size={22} />
                </div>
              </div>
            </div>

            {/* PREVIEW BUTTON */}
            <button
              onClick={generateRegInfo}
              disabled={!modUrl.trim() || (!isSubwalletEnabled && !isLocalWallet) || isPreviewLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-2 border-cyan-400/50 text-white font-bold rounded-lg uppercase text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]"
            >
              {isPreviewLoading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>GENERATING PREVIEW...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={22} />
                  <span>PREVIEW MODULE JSON</span>
                </>
              )}
            </button>

            {/* PREVIEW JSON */}
            {regInfo && (
              <div className="rounded-lg bg-black/80 border-2 border-blue-500/40 p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-sm uppercase mb-4 tracking-wider">
                  <CheckCircle size={20} />
                  <span>JSON PREVIEW</span>
                </div>
                <pre className="text-blue-300 font-mono text-xs overflow-x-auto bg-black/90 p-5 rounded-lg border-2 border-blue-500/30 max-h-80 overflow-y-auto">
                  {regInfo}
                </pre>
              </div>
            )}

            {/* CREATE BUTTON */}
            <button
              onClick={handleCreateModule}
              disabled={!modUrl.trim() || isLoading || (!isSubwalletEnabled && !isLocalWallet)}
              className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 border-2 border-purple-400/50 text-white font-bold rounded-lg uppercase text-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.6)]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>DEPLOYING MODULE...</span>
                </>
              ) : (
                <>
                  <Upload size={24} />
                  <span>DEPLOY MODULE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CREATED MODULE CARD */}
        {createdMod && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 text-green-400 font-bold text-xl uppercase tracking-wide">
              <CheckCircle size={26} />
              <span>MODULE SUCCESSFULLY DEPLOYED</span>
            </div>
            <ModCard mod={createdMod} card_enabled={true} />
          </div>
        )}

        {/* SIGNATURE INFO */}
        {signatureInfo && (
          <div className="rounded-lg bg-black/80 border-2 border-cyan-500/40 p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase mb-5 tracking-wider">
              <CheckCircle size={20} />
              <span>SIGNATURE VERIFICATION</span>
            </div>
            <div className="space-y-4 text-cyan-300 font-mono text-sm">
              <div className="bg-black/90 p-4 rounded-lg border-2 border-cyan-500/30">
                <span className="text-cyan-400/80 block mb-2 font-bold uppercase text-xs">ADDRESS:</span>
                <p className="break-all text-cyan-300">{signatureInfo.address}</p>
              </div>
              <div className="bg-black/90 p-4 rounded-lg border-2 border-cyan-500/30">
                <span className="text-cyan-400/80 block mb-2 font-bold uppercase text-xs">TIMESTAMP:</span>
                <p className="text-cyan-300">{new Date(signatureInfo.timestamp).toISOString()}</p>
              </div>
              <div className="bg-black/90 p-4 rounded-lg border-2 border-cyan-500/30">
                <span className="text-cyan-400/80 block mb-2 font-bold uppercase text-xs">SIGNATURE:</span>
                <p className="break-all text-cyan-300 text-xs">{signatureInfo.signature}</p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-lg bg-black/80 border-2 border-red-500/50 p-6 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm uppercase mb-3 tracking-wider">
              <AlertCircle size={20} />
              <span>ERROR</span>
            </div>
            <p className="text-red-300 font-mono text-sm bg-black/90 p-4 rounded-lg border-2 border-red-500/30">{error}</p>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="rounded-lg bg-black/80 border-2 border-green-500/50 p-6 shadow-[0_0_25px_rgba(34,197,94,0.2)]">
            <div className="flex items-center gap-2 text-green-300 font-bold text-sm uppercase mb-3 tracking-wider">
              <CheckCircle size={20} />
              <span>SUCCESS</span>
            </div>
            <p className="text-green-300 font-mono text-sm bg-black/90 p-4 rounded-lg border-2 border-green-500/30">{success}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateMod