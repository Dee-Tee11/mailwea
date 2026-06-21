'use client'

import { useEffect, useState } from 'react'
import { Contact, loadState, saveState, getTypeLabel } from '@/lib/storage'
import ContactsImport from './ContactsImport'

type ContactType = 'cliente' | 'colega' | 'outro'
type Tab = 'all' | 'cliente' | 'colega'

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ContactType>('cliente')

  const [filterByEmail, setFilterByEmail] = useState(false)
  const [filterByPhone, setFilterByPhone] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    list: 'Newsletter',
    tags: '',
    notes: '',
  })

  // Seleção em bulk
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = () => {
    const state = loadState()
    setContacts(state.contacts)
  }

  const openAddModal = (type: ContactType) => {
    setModalType(type)
    setShowModal(true)
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Nome e email são obrigatórios')
      return
    }

    const state = loadState()
    const newContact: Contact = {
      id: state.nextId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: modalType,
      company: formData.company,
      list: formData.list,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      notes: formData.notes,
    }

    state.contacts.push(newContact)
    state.nextId += 1
    saveState(state)

    loadContacts()
    setShowModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      list: 'Newsletter',
      tags: '',
      notes: '',
    })
  }

  const handleDeleteContact = (id: number) => {
    if (confirm('Tem a certeza que quer eliminar este contacto?')) {
      const state = loadState()
      state.contacts = state.contacts.filter(c => c.id !== id)
      saveState(state)
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      loadContacts()
    }
  }

  // ---------------------------------------------------------------------
  // Seleção em bulk
  // ---------------------------------------------------------------------

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredContacts.map(c => c.id)
    const allVisibleSelected = visibleIds.every(id => selectedIds.has(id)) && visibleIds.length > 0

    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        // Desmarca apenas os visíveis
        visibleIds.forEach(id => next.delete(id))
      } else {
        // Marca todos os visíveis
        visibleIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return

    const confirmMsg =
      selectedIds.size === 1
        ? 'Tem a certeza que quer eliminar 1 contacto?'
        : `Tem a certeza que quer eliminar ${selectedIds.size} contactos?`

    if (!confirm(confirmMsg)) return

    const state = loadState()
    state.contacts = state.contacts.filter(c => !selectedIds.has(c.id))
    saveState(state)

    clearSelection()
    loadContacts()
  }

  // Filtra por aba (Todos / Clientes / Equipa) e depois pelos checkboxes de email/telefone
  const filteredContacts = contacts.filter((c) => {
    if (activeTab !== 'all' && c.type !== activeTab) return false
    if (filterByEmail && !c.email) return false
    if (filterByPhone && !c.phone) return false
    return true
  })

  const countFor = (tab: Tab) =>
    contacts.filter((c) => {
      if (tab !== 'all' && c.type !== tab) return false
      if (filterByEmail && !c.email) return false
      if (filterByPhone && !c.phone) return false
      return true
    }).length

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'cliente', label: 'Clientes' },
    { id: 'colega', label: 'Equipa' },
  ]

  const visibleIds = filteredContacts.map(c => c.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id))
  const someVisibleSelected = visibleIds.some(id => selectedIds.has(id))

  // Limpa a seleção sempre que a aba ou os filtros mudam, para evitar
  // confusão sobre o que está selecionado mas escondido
  useEffect(() => {
    setSelectedIds(new Set())
  }, [activeTab, filterByEmail, filterByPhone])

  return (
    <div className="space-y-6">
      {/* Header com botões */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contactos</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Gerir contactos ({filteredContacts.length})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openAddModal('cliente')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            ➕ Adicionar Cliente
          </button>
          <ContactsImport
            onImportComplete={loadContacts}
            forcedType="cliente"
            buttonLabel="📥 Importar Clientes"
            modalTitle="Importar Clientes"
            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          />
          <button
            onClick={() => openAddModal('colega')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            ➕ Adicionar Equipa
          </button>
          <ContactsImport
            onImportComplete={loadContacts}
            forcedType="colega"
            buttonLabel="📥 Importar Equipa"
            modalTitle="Importar Equipa"
            className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          />
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label} ({countFor(tab.id)})
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterByEmail}
              onChange={(e) => setFilterByEmail(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              ✉️ Apenas com Email
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterByPhone}
              onChange={(e) => setFilterByPhone(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              📱 Apenas com Telefone
            </span>
          </label>
        </div>
      </div>

      {/* Barra de ações em bulk (aparece só quando há seleção) */}
      {someVisibleSelected && (
        <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {selectedIds.size} contacto(s) selecionado(s)
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="text-sm text-blue-700 dark:text-blue-300 hover:underline"
            >
              Limpar seleção
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              🗑️ Eliminar selecionados ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {/* Lista de contactos */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Sem contactos nesta vista</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => openAddModal('cliente')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Adicionar um cliente
              </button>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <button
                onClick={() => openAddModal('colega')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Adicionar à equipa
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Nome</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Telefone</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Empresa</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedIds.has(contact.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                        aria-label={`Selecionar ${contact.name}`}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{contact.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contact.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contact.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                        {getTypeLabel(contact.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contact.company || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para adicionar contacto (cliente ou equipa, conforme modalType) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {modalType === 'cliente' ? 'Adicionar Cliente' : 'Adicionar Membro da Equipa'}
            </h3>

            <form onSubmit={handleAddContact} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="João Silva"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="joao@exemplo.com"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+351 912 345 678"
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Inc."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="importante, vip, seguir"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                    modalType === 'cliente'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}