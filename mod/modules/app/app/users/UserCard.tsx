'use client'

import { UserType } from '@/app/types'
import { User, Package, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

interface UserCardProps {
  user: UserType
}

const text2color = (text: string): string => {
  if (!text) return '#00ff00'
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash)
  const golden_ratio = 0.618033988749895
  const hue = (hash * golden_ratio * 360) % 360
  const saturation = 65 + (Math.abs(hash >> 8) % 35)
  const lightness = 50 + (Math.abs(hash >> 16) % 20)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const shorten = (str: string): string => {
  if (!str || str.length <= 12) return str
  return `${str.slice(0, 8)}...${str.slice(-4)}`
}

export function UserCard({ user }: UserCardProps) {
  const userColor = text2color(user.key)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [user.mods])

  return (
    <div
      className="group relative rounded-2xl border bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
      style={{ borderColor: `${userColor}30` }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center border-2"
            style={{ backgroundColor: `${userColor}15`, borderColor: `${userColor}40` }}
          >
            <User className="w-7 h-7" style={{ color: userColor }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white/90 mb-1">User</h3>
            <p className="text-sm font-mono text-white/60">{shorten(user.key)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ backgroundColor: `${userColor}10`, borderColor: `${userColor}30` }}>
          <Package className="w-4 h-4" style={{ color: userColor }} />
          <span className="text-sm font-semibold" style={{ color: userColor }}>
            {user.mods?.length || 0} {user.mods?.length === 1 ? 'Module' : 'Modules'}
          </span>
        </div>
      </div>

      {user.mods && user.mods.length > 0 && (
        <div className="relative">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Modules</div>
          <div className="relative group/scroll">
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />
            )}
            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {user.mods.map((mod) => {
                const modColor = text2color(mod.name)
                return (
                  <Link
                    key={mod.key}
                    href={`/${user.key}/${mod.name}`}
                    className="flex-shrink-0 group/mod px-4 py-2.5 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: `${modColor}08`,
                      borderColor: `${modColor}25`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: modColor }}>
                        {mod.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/mod:opacity-100 transition-opacity" style={{ color: modColor }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
