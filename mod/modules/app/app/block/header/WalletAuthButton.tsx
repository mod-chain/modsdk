'use client'
import { useState, useEffect } from 'react'
import { useUserContext } from '@/app/block/context/UserContext'
import { Key } from '@/app/block/key'
import { Client } from '@/app/block/client/client'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { KeyIcon, WalletIcon } from '@heroicons/react/24/outline'

type AuthMode = 'local' | 'subwallet'

export default function WalletAuthButton() {
  const { user, signIn, signOut, authLoading } = useUserContext()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('local')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')

  useEffect(() => {
    const checkWallet = async () => {
      const extensions = await web3Enable('MOD')
      if (extensions.length > 0) {
        const allAccounts = await web3Accounts()
        setAccounts(allAccounts)
      }
    }
    checkWallet()
  }, [])

  const handleLocalSignIn = async () => {
    if (!password) {
      setError('Password is required')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await signIn(password)
      setShowAuthModal(false)
      setPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSubwalletSignIn = async () => {
    if (!selectedAccount) {
      setError('Please select an account')
      return
    }

    setLoading(true)
    setError('')

    try {
      await cryptoWaitReady()
      
      const account = accounts.find(acc => acc.address === selectedAccount)
      if (!account) throw new Error('Account not found')

      const extensions = await web3Enable('MOD')
      if (extensions.length === 0) throw new Error('No extension found')

      const injector = await web3FromAddress(selectedAccount)
      
      const derivationPath = `//mod//client`
      const derivedSeed = `${selectedAccount}${derivationPath}`
      
      const localKey = new Key(derivedSeed, 'sr25519')
      
      const userData = {
        address: selectedAccount,
        crypto_type: account.type || 'sr25519',
        walletMode: 'subwallet',
        derivedAddress: localKey.address
      }
      
      await signIn(derivedSeed)
      
      localStorage.setItem('wallet_mode', 'subwallet')
      localStorage.setItem('wallet_address', selectedAccount)
      localStorage.setItem('wallet_type', account.type || 'sr25519')
      
      setShowAuthModal(false)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    localStorage.removeItem('wallet_mode')
    localStorage.removeItem('wallet_address')
    localStorage.removeItem('wallet_type')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === 'local') {
      handleLocalSignIn()
    } else {
      handleSubwalletSignIn()
    }
  }

  if (authLoading) {
    return (
      <div className="px-6 py-4 bg-gray-800/50 border-2 border-white/30 text-white rounded-xl backdrop-blur-md" style={{height: '60px'}}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="font-bold text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-2 border-green-400 text-white rounded-2xl font-black text-xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
        style={{height: '60px', boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'}}
      >
        <div className="flex items-center gap-3">
          <KeyIcon className="w-7 h-7" />
          <span>SIGN IN</span>
        </div>
      </button>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-green-500 rounded-3xl p-8 max-w-lg w-full shadow-2xl" style={{boxShadow: '0 0 60px rgba(34, 197, 94, 0.5)'}}>
            <h2 className="text-4xl font-black text-green-400 mb-6 uppercase tracking-wider text-center" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.8)'}}>AUTHENTICATE</h2>
            
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setAuthMode('local')}
                className={`flex-1 px-6 py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all border-2 ${
                  authMode === 'local'
                    ? 'bg-green-500 text-black border-green-400 shadow-xl scale-105'
                    : 'bg-gray-800/50 text-green-400 border-green-500/50 hover:bg-gray-700/50 hover:scale-105'
                }`}
                style={authMode === 'local' ? {boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)'} : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <KeyIcon className="w-6 h-6" />
                  <span>LOCAL KEY</span>
                </div>
              </button>
              <button
                onClick={() => setAuthMode('subwallet')}
                className={`flex-1 px-6 py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all border-2 ${
                  authMode === 'subwallet'
                    ? 'bg-green-500 text-black border-green-400 shadow-xl scale-105'
                    : 'bg-gray-800/50 text-green-400 border-green-500/50 hover:bg-gray-700/50 hover:scale-105'
                } ${accounts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={accounts.length === 0}
                style={authMode === 'subwallet' ? {boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)'} : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <WalletIcon className="w-6 h-6" />
                  <span>SUBWALLET</span>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {authMode === 'local' ? (
                <div>
                  <label className="block text-green-400 mb-3 font-black text-lg uppercase tracking-wider">PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-black/80 border-2 border-green-500 text-green-400 rounded-xl font-mono text-lg focus:outline-none focus:border-green-300 focus:shadow-lg transition-all"
                    style={{boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'}}
                    placeholder="Enter your password"
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-green-400 mb-3 font-black text-lg uppercase tracking-wider">SELECT WALLET</label>
                  {accounts.length === 0 ? (
                    <div className="p-5 bg-yellow-900/30 border-2 border-yellow-500 rounded-xl">
                      <p className="text-yellow-400 font-bold text-base">⚠️ No wallet extension detected. Please install SubWallet or Polkadot.js extension.</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-80 overflow-y-auto bg-black/80 border-2 border-green-500 rounded-xl scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-900" style={{boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'}}>
                        {accounts.map((account) => (
                          <button
                            key={account.address}
                            type="button"
                            onClick={() => setSelectedAccount(account.address)}
                            className={`w-full text-left px-5 py-4 font-mono text-base transition-all border-b border-green-500/20 last:border-b-0 hover:bg-green-500/10 ${
                              selectedAccount === account.address
                                ? 'bg-green-500/20 text-green-300 font-bold'
                                : 'text-green-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-lg truncate">{account.meta.name}</div>
                                <div className="text-sm text-green-500/70 mt-1 truncate">
                                  {account.address.slice(0, 12)}...{account.address.slice(-12)}
                                </div>
                              </div>
                              {selectedAccount === account.address && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                                  <span className="text-black font-black text-lg">✓</span>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 mt-3 font-mono leading-relaxed bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        💡 A derived key will be created for client operations. You won't need to sign every request.
                      </p>
                    </>
                  )}
                </div>
              )}

              {error && (
                <div className="text-red-400 font-bold text-base border-2 border-red-500 bg-red-900/30 p-4 rounded-xl" style={{boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'}}>
                  ❌ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || (authMode === 'subwallet' && accounts.length === 0)}
                  className="flex-1 px-6 py-4 bg-green-500 text-black hover:bg-green-400 rounded-xl font-black text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'}}
                >
                  {loading ? '⏳ LOADING...' : '🚀 SIGN IN'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false)
                    setPassword('')
                    setError('')
                  }}
                  className="px-6 py-4 bg-gray-800/50 text-green-400 border-2 border-green-500/50 hover:bg-gray-700/50 rounded-xl font-black text-xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
