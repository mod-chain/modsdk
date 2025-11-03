'use client'

import { useState } from 'react'
import { useUserContext } from '@/app/block/context/UserContext'
import { UserIcon, ArrowRightOnRectangleIcon, KeyIcon, CurrencyDollarIcon, CubeIcon } from '@heroicons/react/24/outline'
import { CopyButton } from '@/app/block/CopyButton'
import 'react-responsive-modal/styles.css'
import {text2color, shorten} from "@/app/utils";
import Link from 'next/link'

export function UserHeader() {
  const { keyInstance, setKeyInstance, user, authLoading, signIn, signOut } = useUserContext()
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignOut = () => {
    signOut()
    setShowPasswordInput(true)
  }

  const handleSignIn = async () => {
    if (!password.trim()) return
    setIsSigningIn(true)
    try {
      await signIn(password)
      setShowPasswordInput(false)
      setPassword('')
    } catch (error) {
      console.error('Failed to sign in:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-white/10 bg-white/5 backdrop-blur-xl" style={{height: '60px'}}>
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-xl text-white/70 font-bold">Loading...</span>
      </div>
    )
  }

  if (!keyInstance) {
    return (
      <div className="flex items-center gap-3">
        {showPasswordInput ? (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              placeholder="Enter password"
              className="px-5 py-3 text-xl bg-black/60 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 w-64 backdrop-blur-xl transition-all font-bold"
              style={{height: '60px'}}
              autoFocus
            />
            <button
              onClick={handleSignIn}
              disabled={!password.trim() || isSigningIn}
              className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none hover:scale-110 active:scale-95"
              style={{height: '60px', width: '60px'}}
              title="Sign In"
            >
              {isSigningIn ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRightOnRectangleIcon className="w-7 h-7" />
              )}
            </button>
            <button
              onClick={() => {
                setShowPasswordInput(false)
                setPassword('')
              }}
              className="px-5 py-3 text-xl text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all font-bold"
              style={{height: '60px'}}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPasswordInput(true)}
            className="group p-4 rounded-xl border-2 border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 transition-all text-emerald-400 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:scale-110 active:scale-95"
            style={{height: '60px', width: '60px'}}
            title="Sign In"
          >
            <KeyIcon className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>
    )
  }

  const userAddress = keyInstance.address
  const userColor = text2color(userAddress)
  const balance = user?.balance || 0
  const modsCount = user?.mods?.length || 0
  const truncatedAddress = userAddress.length > 12 ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : userAddress

  return (
    <div className="relative">
      <Link href={`/user/${userAddress}`}>
        <div
          className="flex items-center gap-4 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-2xl hover:scale-105 active:scale-95 backdrop-blur-xl"
          style={{
            borderColor: `${userColor}50`,
            backgroundColor: `${userColor}15`,
            boxShadow: `0 8px 32px ${userColor}30`,
            height: '60px'
          }}
        >
          <UserIcon className="w-7 h-7" style={{ color: userColor }} />
          <span className="font-mono font-bold text-xl" style={{ color: userColor }}>
            {truncatedAddress}
          </span>
          <CopyButton content={userAddress} size="sm" />
          
          <div className="flex items-center gap-3 ml-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10">
              <CurrencyDollarIcon className="w-5 h-5" style={{ color: userColor }} />
              <span className="font-bold text-lg" style={{ color: userColor }}>{balance}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10">
              <CubeIcon className="w-5 h-5" style={{ color: userColor }} />
              <span className="font-bold text-lg" style={{ color: userColor }}>{modsCount}</span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              handleSignOut()
            }}
            className="ml-1 p-3 rounded-lg hover:bg-white/10 transition-all group"
            title="Sign Out"
            style={{ color: userColor }}
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </Link>
    </div>
  )
}