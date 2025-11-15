'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Sidebar } from '@/app/block/sidebar/Sidebar'
import { Header } from '@/app/block/header/Header'
import { Footer } from '@/app/block/footer/Footer'
import { UserProvider } from '@/app/block/context/UserContext'
import { SearchProvider } from '@/app/block/context/SearchContext'
import { SidebarProvider } from '@/app/block/context/SidebarContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <SearchProvider>
            <SidebarProvider>
              <div className="flex h-screen bg-black">
                <Sidebar />
                <div className="flex-1 flex flex-col" style={{ marginLeft: '80px' }}>
                  <Header />
                  <main className="flex-1 overflow-auto">
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>
            </SidebarProvider>
          </SearchProvider>
        </UserProvider>
      </body>
    </html>
  )
}
