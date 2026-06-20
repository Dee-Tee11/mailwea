'use client'

interface TopbarProps {
  page: string
}

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  contacts: 'Todos os Contactos',
  clientes: 'Clientes',
  colegas: 'Equipa / Colegas',
  lists: 'Listas',
  send: 'Enviar',
  test: 'Teste Rápido',
  campaigns: 'Campanhas',
  'new-campaign': 'Nova Campanha',
  settings: 'Configurações',
}

export default function Topbar({ page }: TopbarProps) {
  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {titles[page] || page}
      </span>
      <div className="flex gap-2"></div>
    </div>
  )
}