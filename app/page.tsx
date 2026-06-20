'use client'

import { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Contacts from '@/components/Contacts'
import SendMessages from '@/components/SendMessages'

type Page = 'dashboard' | 'contacts' | 'send' | 'settings'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar page={currentPage} />
        <div className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'contacts' && <Contacts />}
          {currentPage === 'send' && <SendMessages />}
          {/* Outras páginas serão adicionadas aqui */}
        </div>
      </div>
    </div>
  )
}