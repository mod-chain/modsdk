'use client'
import Link from 'next/link'
import { useSidebarContext } from '@/app/block/context/SidebarContext'

export function LogoHeader() {
  const { toggleSidebar } = useSidebarContext()

  return (
    <button
      onClick={toggleSidebar}
      className="text-2xl font-bold text-white hover:text-green-400 transition-colors cursor-pointer"
    >
      dhub
    </button>
  )
}