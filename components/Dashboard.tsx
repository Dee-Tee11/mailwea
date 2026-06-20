'use client'

import { useEffect, useState } from 'react'

interface Contact {
  id: number
  name: string
  email: string
  phone: string
  type: 'cliente' | 'colega' | 'outro'
  list: string
  company: string
  tags: string[]
  notes: string
}

interface Campaign {
  id: number
  name: string
  type: 'email' | 'sms'
  status: 'draft' | 'sent' | 'failed'
  sent: number
}

interface AppState {
  contacts: Contact[]
  campaigns: Campaign[]
  lists: any[]
  settings: any
  nextId: number
}

export default function Dashboard() {
  const [data, setData] = useState<AppState | null>(null)

  const loadData = () => {
    const stored = localStorage.getItem('mailflow_v4')
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load data:', e)
        setData({ contacts: [], campaigns: [], lists: [], settings: { resendKey: '', defaultFrom: '', twilioSid: '', twilioToken: '', twilioFrom: '' }, nextId: 1 })
      }
    } else {
      setData({ contacts: [], campaigns: [], lists: [], settings: { resendKey: '', defaultFrom: '', twilioSid: '', twilioToken: '', twilioFrom: '' }, nextId: 1 })
    }
  }

  useEffect(() => {
    loadData()
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Custom event for same-tab changes
    window.addEventListener('storageUpdate', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storageUpdate', handleStorageChange)
    }

  if (!data) {
    return <div className="text-center py-10">Carregando...</div>
  }

  const totalSent = data.campaigns.reduce((sum, c) => sum + c.sent, 0)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total contactos"
          value={data.contacts.length}
          icon="👥"
          color="bg-purple-100 dark:bg-purple-900"
        />
        <StatCard
          label="Emails enviados"
          value={totalSent}
          icon="✉️"
          color="bg-orange-100 dark:bg-orange-900"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: string
}) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </div>
    </div>
  )
}
