'use client'

import { useUserContext } from '@/app/block/context/UserContext'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function AuthButton() {
  const { keyInstance, setKeyInstance, authLoading } = useUserContext()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Your wallet connection logic here
      // Example: const key = await connectWallet()
      // setKeyInstance(key)
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setKeyInstance(null)
  }

  if (authLoading) {
    return (
      <div className="px-4 py-2 rounded-lg bg-white/10 text-white/70">
        Loading...
      </div>
    )
  }

  if (keyInstance) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDisconnect}
        className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-bold hover:bg-red-500/30 transition"
      >
        Disconnect
      </motion.button>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-bold hover:bg-green-500/30 transition disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </motion.button>
  )
}
