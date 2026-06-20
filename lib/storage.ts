export interface Contact {
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

export interface List {
  id: number
  name: string
  desc: string
}

export interface Campaign {
  id: number
  name: string
  subject?: string
  smsBody?: string
  audience: string
  audienceLabel: string
  type: 'email' | 'sms'
  status: 'draft' | 'sent' | 'failed'
  sent: number
  date: string
}

export interface Settings {
  resendKey: string
  defaultFrom: string
  twilioSid: string
  twilioToken: string
  twilioFrom: string
}

export interface AppState {
  contacts: Contact[]
  lists: List[]
  campaigns: Campaign[]
  settings: Settings
  nextId: number
}

const STORAGE_KEY = 'mailflow_v4'

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load state:', e)
      return getInitialState()
    }
  }
  return getInitialState()
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function getInitialState(): AppState {
  return {
    contacts: [],
    lists: [
      { id: 1, name: 'Newsletter', desc: 'Subscritos da newsletter' },
      { id: 2, name: 'Equipa', desc: 'Equipa interna' },
      { id: 3, name: 'Parceiros', desc: 'Parceiros de negócio' },
    ],
    campaigns: [],
    settings: {
      resendKey: '',
      defaultFrom: '',
      twilioSid: '',
      twilioToken: '',
      twilioFrom: '',
    },
    nextId: 10000,
  }
}

export function getTypeLabel(type: string): string {
  return {
    cliente: 'Cliente',
    colega: 'Colega',
    outro: 'Outro',
  }[type] || type
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
