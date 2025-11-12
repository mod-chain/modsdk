'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KeyIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { BackendSettings } from './BackendSettings'

const navigation = [
  { name: 'Keys', href: '/mod/explore', icon: KeyIcon },
  { name: 'Users', href: '/user/explore', icon: UsersIcon },
]

interface SidebarProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

export function Sidebar({ isExpanded, onToggleExpand }: SidebarProps) {
  const pathname = usePathname()

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full border-r border-white/10 bg-black z-40"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition-colors">
                  dhub
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronLeftIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon
                  className={`h-6 w-6 shrink-0 ${
                    isActive ? 'text-green-400' : 'text-gray-400 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-green-500/10 rounded-md -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BackendSettings />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <BackendSettings />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
