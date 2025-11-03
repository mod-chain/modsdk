'use client'

import { UserType } from '@/app/types'
import { CopyButton } from '@/app/block/CopyButton'
import Link from 'next/link'
import { User, Hash, Package, Wallet } from 'lucide-react'
import {shorten} from "@/app/utils";

const USER_COLORS = [
  { from: 'from-purple-500/30', to: 'to-pink-500/30', text: 'text-purple-400', hover: 'hover:shadow-purple-500/30', border: 'border-purple-500/40', glow: 'shadow-purple-500/20' },
  { from: 'from-blue-500/30', to: 'to-cyan-500/30', text: 'text-blue-400', hover: 'hover:shadow-blue-500/30', border: 'border-blue-500/40', glow: 'shadow-blue-500/20' },
  { from: 'from-green-500/30', to: 'to-emerald-500/30', text: 'text-green-400', hover: 'hover:shadow-green-500/30', border: 'border-green-500/40', glow: 'shadow-green-500/20' },
  { from: 'from-orange-500/30', to: 'to-red-500/30', text: 'text-orange-400', hover: 'hover:shadow-orange-500/30', border: 'border-orange-500/40', glow: 'shadow-orange-500/20' },
  { from: 'from-yellow-500/30', to: 'to-amber-500/30', text: 'text-yellow-400', hover: 'hover:shadow-yellow-500/30', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20' },
  { from: 'from-indigo-500/30', to: 'to-violet-500/30', text: 'text-indigo-400', hover: 'hover:shadow-indigo-500/30', border: 'border-indigo-500/40', glow: 'shadow-indigo-500/20' },
]

interface UserCardProps {
  user: UserType
}

export function UserCard({ user }: UserCardProps) {
  const colorIndex = user.key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % USER_COLORS.length
  const colors = USER_COLORS[colorIndex]
  const modCount = user.mods?.length || 0

  return (
    <div className={`group relative bg-gradient-to-br ${colors.from} ${colors.to} border-2 ${colors.border} rounded-2xl p-6 ${colors.hover} hover:border-white/60 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm transform hover:scale-105 ${colors.glow} shadow-xl`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10 space-y-5">
        <Link href={`/user/${user.key}`} className="block">
          <div className="flex items-center gap-4 group/link">
            <div className={`flex-shrink-0 p-3 bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl border-2 border-white/20 shadow-lg ${colors.glow}`}>
              <User className={`${colors.text}`} size={32} strokeWidth={2.5} />
            </div>
            <h3 className={`text-4xl font-bold text-white group-hover/link:${colors.text} transition-colors truncate drop-shadow-lg`}>
              {shorten(user.key)}
            </h3>
          </div>
        </Link>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-black/40 border-2 border-white/20 px-4 py-3 rounded-xl shadow-lg">
            <Package className={`${colors.text}`} size={24} strokeWidth={2.5} />
            <span className="text-white/60 text-xl font-bold">MODULES:</span>
            <span className={`text-2xl ${colors.text} font-bold ml-auto`}>{modCount}</span>
          </div>

          {user.address && (
            <div className="flex items-center gap-3 bg-black/40 border-2 border-white/20 px-4 py-3 rounded-xl shadow-lg">
              <Hash className={`${colors.text}`} size={24} strokeWidth={2.5} />
              <code className={`text-xl ${colors.text} font-mono truncate flex-1`} title={user.address}>
                {user.address.slice(0, 6)}...{user.address.slice(-6)}
              </code>
              <CopyButton text={user.address} size="sm" />
            </div>
          )}

          {user.balance !== undefined && (
            <div className="flex items-center gap-3 bg-black/40 border-2 border-white/20 px-4 py-3 rounded-xl shadow-lg">
              <Wallet className={`${colors.text}`} size={24} strokeWidth={2.5} />
              <span className="text-white/60 text-xl font-bold">BALANCE:</span>
              <span className={`text-2xl ${colors.text} font-bold ml-auto`}>{user.balance.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <CopyButton text={user.key} size="md" />
        </div>
      </div>
    </div>
  )
}
