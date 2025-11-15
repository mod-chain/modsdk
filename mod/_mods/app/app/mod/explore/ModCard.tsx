'use client'

import { ModuleType } from '@/app/types'
import { text2color, shorten, time2str } from '@/app/utils'
import { CopyButton } from '@/app/block/CopyButton'
import { Hash, Clock } from 'lucide-react'
import { KeyIcon } from '@heroicons/react/24/outline'
import { CubeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ModCardProps {
  mod: ModuleType
  card_enabled?: boolean
}

export default function ModCard({ mod, card_enabled = true}: ModCardProps) {

  const modColor = text2color(mod.name || mod.key)
  const userColor = text2color(mod.key)
  const updatedTimeStr = mod.updated ? time2str(mod.updated) : time2str(Date.now())
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 }
  }
  
  const rgb = hexToRgb(modColor)
  const userRgb = hexToRgb(userColor)
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
  const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`

  const collateral = mod.collateral ?? 0

  return (
    <Link href={`/mod/${mod.name}/${mod.key}`}>
      <div className="group relative border-2 rounded-xl px-4 py-3 hover:shadow-xl transition-all duration-300 backdrop-blur-sm overflow-hidden hover:scale-[1.01] bg-black cursor-pointer" style={{ borderColor: borderColor, boxShadow: `0 0 12px ${glowColor}` }}>
        <div className="absolute -inset-1 bg-gradient-to-r opacity-5 group-hover:opacity-10 blur-lg transition-all duration-500 rounded-xl" style={{ background: `linear-gradient(45deg, ${modColor}, transparent, ${modColor})` }} />
        
        <div className="relative z-10 flex items-center gap-3 justify-between">
          {/* Left side: Module Name and Description */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
              <CubeIcon className="h-6 w-6 flex-shrink-0" style={{ color: modColor }} />
              <code className="text-lg font-mono font-bold truncate" style={{ color: modColor, fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace" }} title={mod.name}>
                {mod.name}
              </code>
            </div>
            
            {mod.desc && (
              <p className="hidden lg:block text-sm text-white/60 truncate flex-1 min-w-0" style={{ fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace" }}>{mod.desc}</p>
            )}
          </div>

          {/* Right side: All metadata fields */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!card_enabled && mod.cid && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border flex-shrink-0" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`, borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` }}>
                <Hash size={16} strokeWidth={2.5} style={{ color: modColor }} />
                <code className="text-sm font-mono font-bold" style={{ color: modColor, fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace" }} title={mod.cid}>
                  {shorten(mod.cid, 4, 4)}
                </code>
                <CopyButton text={mod.cid} size="sm" />
              </div>
            )}

            {/* Collateral with gold bar symbol */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`, borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}>
              <span className="text-lg" title="Collateral">🪙</span>
              <code className="text-sm font-mono font-bold" style={{ color: modColor, fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace" }} title={`Collateral: ${collateral}`}>
                {collateral}
              </code>
              <CopyButton text={String(collateral)} size="sm" />
            </div>

            {/* Updated */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`, borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}>
              <Clock size={16} strokeWidth={2.5} style={{ color: modColor }} />
              <code className="text-sm font-mono font-bold" style={{ color: modColor, fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace" }} title={updatedTimeStr}>
                {updatedTimeStr}
              </code>
              <CopyButton text={updatedTimeStr} size="sm" />
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border flex-shrink-0" style={{ backgroundColor: `rgba(${userRgb.r}, ${userRgb.g}, ${userRgb.b}, 0.1)`, borderColor: `rgba(${userRgb.r}, ${userRgb.g}, ${userRgb.b}, 0.4)` }}>
              <Link href={`/user/${mod.key}`} onClick={(e) => e.stopPropagation()} className="hover:scale-110 transition-transform">
                <KeyIcon className="w-5 h-5" style={{ color: userColor }} />
              </Link>
              <Link href={`/user/${mod.key}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                <code className="text-sm font-mono font-bold" style={{ color: userColor, fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace" }} title={mod.key}>
                  {shorten(mod.key, 4, 4)}
                </code>
              </Link>
              <CopyButton text={mod.key} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
