'use client'

import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

interface CopyButtonProps {
  content: string
  size?: 'sm' | 'md' | 'lg'
}

export function CopyButton({ content, size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-1 rounded hover:bg-white/10 transition-colors"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <CheckIcon className={`${sizeClasses[size]} text-green-400`} />
      ) : (
        <ClipboardDocumentIcon className={`${sizeClasses[size]} text-white/70 hover:text-white`} />
      )}
    </button>
  )
}