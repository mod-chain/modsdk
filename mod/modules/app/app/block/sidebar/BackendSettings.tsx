'use client'
import { useState, useEffect } from 'react'
import { CogIcon } from '@heroicons/react/24/outline'

export function BackendSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [endpoint, setEndpoint] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('backend_endpoint')
    if (saved) {
      setEndpoint(saved)
    }
  }, [])

  const handleSave = () => {
    if (endpoint.trim()) {
      const formattedEndpoint = endpoint.includes('://') ? endpoint : `http://${endpoint}`
      localStorage.setItem('backend_endpoint', formattedEndpoint)
      process.env.NEXT_PUBLIC_API_URL = formattedEndpoint
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        window.location.reload()
      }, 1000)
    }
  }

  const handleReset = () => {
    localStorage.removeItem('backend_endpoint')
    setEndpoint('')
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all"
        title="Backend Settings"
      >
        <CogIcon className="h-5 w-5" />
        <span className="text-xs">Backend</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-black border border-white/10 rounded-lg shadow-xl p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Backend Endpoint</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-400">IP:PORT</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="localhost:8000"
                className="w-full bg-black/40 border border-white/10 text-white text-sm placeholder:text-white/30 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              />
              <p className="text-xs text-gray-500">No need to include http://</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 text-sm bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-md transition-all font-medium"
              >
                {isSaved ? '✓ Saved!' : 'Save'}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-md transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
