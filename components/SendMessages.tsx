'use client'

import { useEffect, useState } from 'react'
import { Contact, Campaign, loadState, saveState, getTypeLabel } from '@/lib/storage'

type AudienceFilter = 'all' | 'cliente' | 'colega' | 'outro'

export default function SendMessages() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email')
  const [audience, setAudience] = useState<AudienceFilter>('all')

  const [campaignName, setCampaignName] = useState('')
  const [subject, setSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [smsBody, setSmsBody] = useState('')

  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [log, setLog] = useState<{ name: string; ok: boolean; error?: string }[]>([])
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const state = loadState()
    setContacts(state.contacts)
  }, [])

  const audienceLabel = (a: AudienceFilter) =>
    a === 'all' ? 'Todos os contactos' : getTypeLabel(a)

  const recipients = contacts.filter((c) => {
    if (audience !== 'all' && c.type !== audience) return false
    if (messageType === 'email' && !c.email) return false
    if (messageType === 'sms' && !c.phone) return false
    return true
  })

  const resetForm = () => {
    setCampaignName('')
    setSubject('')
    setEmailBody('')
    setSmsBody('')
    setLog([])
    setFinished(false)
    setProgress({ done: 0, total: 0 })
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      alert('Não há destinatários válidos para este filtro.')
      return
    }
    if (messageType === 'email' && (!subject || !emailBody)) {
      alert('Preenche o assunto e o conteúdo do email.')
      return
    }
    if (messageType === 'sms' && !smsBody) {
      alert('Escreve o conteúdo da SMS.')
      return
    }

    setSending(true)
    setFinished(false)
    setLog([])
    setProgress({ done: 0, total: recipients.length })

    const results: { name: string; ok: boolean; error?: string }[] = []
    let sentCount = 0

    for (const contact of recipients) {
      try {
        if (messageType === 'email') {
          const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: contact.email,
              subject,
              html: emailBody.replace(/\n/g, '<br/>'),
            }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || `Erro HTTP ${res.status}`)
          }
        } else {
          const res = await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: contact.phone,
              body: smsBody,
            }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || `Erro HTTP ${res.status}`)
          }
        }
        sentCount++
        results.push({ name: contact.name, ok: true })
      } catch (error) {
        results.push({ name: contact.name, ok: false, error: (error as Error).message })
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }

    // Guarda a campanha no histórico
    const state = loadState()
    const campaign: Campaign = {
      id: state.nextId,
      name:
        campaignName ||
        `${messageType === 'email' ? 'Email' : 'SMS'} - ${new Date().toLocaleString('pt-PT')}`,
      subject: messageType === 'email' ? subject : undefined,
      smsBody: messageType === 'sms' ? smsBody : undefined,
      audience,
      audienceLabel: audienceLabel(audience),
      type: messageType,
      status: sentCount > 0 ? 'sent' : 'failed',
      sent: sentCount,
      date: new Date().toISOString(),
    }
    state.campaigns.push(campaign)
    state.nextId += 1
    saveState(state)

    setLog(results)
    setSending(false)
    setFinished(true)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enviar Mensagens</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Cria e envia campanhas de email ou SMS para os teus contactos
        </p>
      </div>

      {/* Tipo de mensagem */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de mensagem
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setMessageType('email')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              messageType === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            ✉️ Email
          </button>
          <button
            onClick={() => setMessageType('sms')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              messageType === 'sms'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            💬 SMS
          </button>
        </div>
      </div>

      {/* Audiência */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Audiência
        </label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as AudienceFilter)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os contactos</option>
          <option value="cliente">Clientes</option>
          <option value="colega">Colegas</option>
          <option value="outro">Outros</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {recipients.length} destinatário(s) com {messageType === 'email' ? 'email' : 'telefone'} válido
        </p>
      </div>

      {/* Nome da campanha */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome da campanha (opcional)
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="Ex: Newsletter de Junho"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Conteúdo */}
      {messageType === 'email' ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assunto *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Assunto do email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conteúdo *
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escreve a mensagem aqui..."
            />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Conteúdo da SMS *
          </label>
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            rows={4}
            maxLength={480}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escreve a mensagem SMS aqui..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {smsBody.length}/480 caracteres
          </p>
        </div>
      )}

      {/* Botão de envio + progresso */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSend}
          disabled={sending || recipients.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {sending
            ? `A enviar... (${progress.done}/${progress.total})`
            : `Enviar para ${recipients.length} contacto(s)`}
        </button>
        {finished && (
          <button
            onClick={resetForm}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Nova campanha
          </button>
        )}
      </div>

      {/* Resultado */}
      {log.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Resultado: {log.filter((l) => l.ok).length} enviado(s), {log.filter((l) => !l.ok).length} falhado(s)
          </h3>
          <div className="max-h-48 overflow-y-auto text-sm space-y-1">
            {log.map((entry, i) => (
              <div
                key={i}
                className={entry.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}
              >
                {entry.ok ? '✅' : '❌'} {entry.name}
                {entry.error && <span className="text-gray-500"> — {entry.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}