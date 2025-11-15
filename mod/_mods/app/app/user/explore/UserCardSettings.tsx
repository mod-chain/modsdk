'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

type SortKey = 'recent' | 'name' | 'balance' | 'modules'

interface UserCardSettingsProps {
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  columns: number
  onColumnsChange: (columns: number) => void
}

export function UserCardSettings({ sort, onSortChange, columns, onColumnsChange }: UserCardSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'recent', label: 'Recent' },
    { key: 'name', label: 'Name' },
    { key: 'balance', label: 'Balance' },
    { key: 'modules', label: 'Modules' }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border border-purple-500/40 rounded-lg backdrop-blur-xl hover:from-purple-500/30 hover:via-pink-500/30 hover:to-blue-500/30 transition-all shadow-lg shadow-purple-500/20"
      >
        <SlidersHorizontal className="w-5 h-5 text-purple-300" />
        {isExpanded && <span className="text-sm font-bold text-purple-300 uppercase">Filters</span>}
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 z-50 flex items-center gap-3 px-4 py-3 bg-black/95 border border-purple-500/40 rounded-lg backdrop-blur-xl shadow-2xl shadow-purple-500/30 min-w-max">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="appearance-none bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg px-3 py-1.5 pr-8 text-sm font-bold uppercase cursor-pointer hover:bg-purple-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key} className="bg-black">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={columns}
              onChange={(e) => onColumnsChange(parseInt(e.target.value))}
              className="appearance-none bg-green-500/20 text-green-300 border border-green-500/40 rounded-lg px-3 py-1.5 pr-8 text-sm font-bold uppercase cursor-pointer hover:bg-green-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-green-400/50"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num} className="bg-black">
                  {num} Col{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}