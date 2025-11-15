'use client'

import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface FieldTooltipProps {
  label: string
  description: string
  children: React.ReactNode
}

export function FieldTooltip({ label, description, children }: FieldTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-2 mb-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <label className="text-sm font-bold text-white/80">{label}</label>
        <InformationCircleIcon className="w-4 h-4 text-white/40 hover:text-white/80 transition-colors cursor-help" />
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-1 p-3 bg-black/95 border-2 border-white/20 rounded-lg shadow-xl backdrop-blur-md max-w-xs">
          <p className="text-sm text-white/90">{description}</p>
        </div>
      )}
      
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
    </div>
  )
}

export default FieldTooltip