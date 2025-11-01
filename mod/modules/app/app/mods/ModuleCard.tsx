'use client'

import Link from 'next/link'
import { ModuleType } from '@/app/types'
import { CubeIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline'
import { CopyButton } from '@/app/block/CopyButton'

const shorten = (str: string): string => {
  if (!str || str.length <= 12) return str
  return `${str.slice(0, 8)}...${str.slice(-4)}`
}

const time2str = (time: number): string => {
  const d = new Date(time * 1000)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
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

export default function ModuleCard({ mod }: { mod: ModuleType }) {
  const moduleColor = text2color(mod.name)

  return (
    <Link
      href={`/${mod.key}/${mod.name}`}
      className="block group"
    >
      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl"
        style={{
          backgroundColor: `${moduleColor}08`,
          borderColor: `${moduleColor}30`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="flex-shrink-0 p-3 rounded-xl border-2"
                style={{
                  backgroundColor: `${moduleColor}15`,
                  borderColor: `${moduleColor}40`,
                }}
              >
                <CubeIcon className="h-6 w-6" style={{ color: moduleColor }} />
              </div>
              <h3
                className="text-2xl font-bold truncate"
                style={{ color: moduleColor }}
              >
                {mod.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{
                backgroundColor: `${moduleColor}10`,
                borderColor: `${moduleColor}30`,
                color: moduleColor,
              }}
            >
              <KeyIcon className="h-4 w-4" />
              <span className="font-mono">{shorten(mod.key)}</span>
              <CopyButton size="sm" content={mod.key} />
            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{
                backgroundColor: `${moduleColor}10`,
                borderColor: `${moduleColor}30`,
                color: moduleColor,
              }}
            >
              <ClockIcon className="h-4 w-4" />
              <span>{time2str(mod.created)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
