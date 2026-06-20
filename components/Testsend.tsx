'use client'

import { useState } from 'react'

export default function TestSend() {
  const [type, setType] = useState<'email' | 'sms'>('email')
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('Teste MailFlow')
  const [body, setBody] = useState('Esta é uma mensagem de teste enviada pelo MailFlow.')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleSend = async () => {
    if (!to) {
      alert(type === 'email' ? 'Indica um email de destino' : 'Indica um número de telefone')
      return
    }

    setSending(true)
    setResult(null)

    try {
      if (type === 'email') {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            subject,
            html: body.replace(/\n/g, '<br/>'),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Erro HTTP ${res.status}`)
        setResult({ ok: true, message: `Email enviado com sucesso para ${to}` })
      } else {
        const res = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, body }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Erro HTTP ${res.status}`)
        setResult({ ok: true, message: `SMS enviado com sucesso para ${to} (sid: ${data.sid})` })
      }
    } catch (error) {
      setResult({ ok: false, message: (error as Error).message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teste Rápido</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Envia um email ou SMS de teste para verificar se as chaves estão a funcionar
        </p>
      </div>

      {/* Tipo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de teste
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setType('email')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            ✉️ Email
          </button>
          <button
            onClick={() => setType('sms')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'sms'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            💬 SMS
          </button>
        </div>
      </div>

      {/* Destino */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {type === 'email' ? 'Email de destino *' : 'Telefone de destino *'}
        </label>
        <input
          type={type === 'email' ? 'email' : 'tel'}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={type === 'email' ? 'teste@exemplo.com' : '+351912345678'}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Conteúdo */}
      {type === 'email' ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assunto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mensagem
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mensagem
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={480}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{body.length}/480 caracteres</p>
        </div>
      )}

      {/* Botão */}
      <button
        onClick={handleSend}
        disabled={sending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        {sending ? 'A enviar...' : `Enviar ${type === 'email' ? 'Email' : 'SMS'} de Teste`}
      </button>

      {/* Resultado */}
      {result && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            result.ok
              ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200'
          }`}
        >
          {result.ok ? '✅ ' : '❌ '}
          {result.message}
        </div>
      )}
    </div>
  )
}