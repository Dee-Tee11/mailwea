'use client'

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: any) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'contacts', label: 'Contactos', icon: '👥' },
  { id: 'send', label: 'Enviar', icon: '📤' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
]

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  return (
    <nav className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Brand */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-sm font-bold">
            📧
          </div>
          <div>
            <div className="font-semibold text-sm">MailFlow</div>
            <div className="text-xs text-gray-500">Email Marketing MVP</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                currentPage === item.id
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs">
        <div className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Estado das chaves</div>
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <div>🔴 Email</div>
          <div>🔴 SMS</div>
        </div>
        <div className="text-xs text-gray-500 mt-2">Dados guardados no browser</div>
      </div>
    </nav>
  )
}