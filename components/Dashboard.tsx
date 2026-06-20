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
}

export default function Dashboard() {
  const [data, setData] = useState<AppState | null>(null)

  useEffect(() => {
    // Load data from localStorage
    const stored = localStorage.getItem('mailflow_data')
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load data:', e)
        setData({ contacts: [], campaigns: [] })
      }
    } else {
      setData({ contacts: [], campaigns: [] })
    }
  }, [])

  if (!data) {
    return <div className="text-center py-10">Carregando...</div>
  }

  const clientes = data.contacts.filter((c) => c.type === 'cliente')
  const colegas = data.contacts.filter((c) => c.type === 'colega')
  const totalSent = data.campaigns.reduce((sum, c) => sum + c.sent, 0)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total contactos"
          value={data.contacts.length}
          icon="👥"
          color="bg-purple-100 dark:bg-purple-900"
        />
        <StatCard
          label="Clientes"
          value={clientes.length}
          icon="🏪"
          color="bg-blue-100 dark:bg-blue-900"
        />
        <StatCard
          label="Equipa / Colegas"
          value={colegas.length}
          icon="💼"
          color="bg-green-100 dark:bg-green-900"
        />
        <StatCard
          label="Emails enviados"
          value={totalSent}
          icon="✉️"
          color="bg-orange-100 dark:bg-orange-900"
        />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Campanhas recentes
        </h3>
        {data.campaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Sem campanhas ainda
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Nome
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Tipo
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Estado
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Enviados
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.slice(-5).reverse().map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-gray-200 dark:border-gray-800"
                  >
                    <td className="py-3 px-3">{campaign.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {campaign.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          campaign.status === 'sent'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                            : campaign.status === 'failed'
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                        }`}
                      >
                        {campaign.status === 'sent'
                          ? 'Enviado'
                          : campaign.status === 'failed'
                            ? 'Erro'
                            : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      {campaign.sent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
