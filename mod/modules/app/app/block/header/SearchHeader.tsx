'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSearchContext } from '@/app/block/context/SearchContext'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export function SearchHeader() {
  const { handleSearch } = useSearchContext()
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    handleSearch(trimmed)
    router.push('/mod/explore')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value === '') {
      handleSearch('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      handleSearch(trimmed)
      router.push('/mod/explore')
    }
    if (e.key === 'Escape') {
      setIsExpanded(false)
      setInputValue('')
      handleSearch('')
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (isExpanded) {
      setInputValue('')
      handleSearch('')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center">
      {!isExpanded ? (
        <button
          type="button"
          onClick={toggleExpand}
          className="p-3 rounded-lg border-2 border-white/40 bg-white/15 hover:bg-white/20 hover:border-white/50 transition-all hover:scale-110 active:scale-95"
          style={{height: '56px', width: '56px'}}
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-white" />
        </button>
      ) : (
        <div className="relative animate-in fade-in slide-in-from-left-2 duration-300">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search mods..."
            autoFocus
            className="bg-white/15 border-3 border-white/40 text-white px-6 py-4 pl-14 pr-14 rounded-xl text-xl font-bold hover:bg-white/20 hover:border-white/50 focus:outline-none focus:ring-3 focus:ring-white/60 focus:border-white/60 transition-all shadow-xl shadow-black/30"
            style={{height: '56px', width: '320px'}}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/80" />
          <button
            type="button"
            onClick={toggleExpand}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-all hover:scale-110 active:scale-95"
          >
            <XMarkIcon className="w-6 h-6 text-white/80" />
          </button>
        </div>
      )}
    </form>
  )
}