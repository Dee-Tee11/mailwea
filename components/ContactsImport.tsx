'use client'

import { useState } from 'react'
import { Contact, loadState, saveState } from '@/lib/storage'

interface ImportPreview {
  valid: Contact[]
  errors: { row: number; message: string }[]
}

export default function ContactsImport({
  onImportComplete,
}: {
  onImportComplete: () => void
}) {
  const [showModal, setShowModal] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importing, setImporting] = useState(false)

  const parseCSV = (content: string): ImportPreview => {
    const lines = content.split('\n').filter(line => line.trim())
    const valid: Contact[] = []
    const errors: { row: number; message: string }[] = []

    if (lines.length < 2) {
      errors.push({ row: 0, message: 'Ficheiro vazio ou sem cabeçalho' })
      return { valid, errors }
    }

    // Parse do cabeçalho (esperamos: name, email, phone, type, company, list, tags, notes)
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    const nameIdx = header.indexOf('name')
    const emailIdx = header.indexOf('email')
    const phoneIdx = header.indexOf('phone')
    const typeIdx = header.indexOf('type')
    const companyIdx = header.indexOf('company')
    const listIdx = header.indexOf('list')
    const tagsIdx = header.indexOf('tags')
    const notesIdx = header.indexOf('notes')

    if (nameIdx === -1 || emailIdx === -1) {
      errors.push({
        row: 0,
        message: 'Cabeçalho deve conter "name" e "email"',
      })
      return { valid, errors }
    }

    const state = loadState()
    let nextId = state.nextId

    // Parse das linhas
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(v => v.trim())

        const name = row[nameIdx]?.trim()
        const email = row[emailIdx]?.trim()

        if (!name || !email) {
          errors.push({
            row: i + 1,
            message: 'Nome e email são obrigatórios',
          })
          continue
        }

        if (!email.includes('@')) {
          errors.push({
            row: i + 1,
            message: `Email inválido: ${email}`,
          })
          continue
        }

        const contact: Contact = {
          id: nextId++,
          name,
          email,
          phone: row[phoneIdx] || '',
          type: (row[typeIdx] as 'cliente' | 'colega' | 'outro') || 'cliente',
          company: row[companyIdx] || '',
          list: row[listIdx] || 'Newsletter',
          tags: row[tagsIdx]
            ? row[tagsIdx].split(';').map(t => t.trim())
            : [],
          notes: row[notesIdx] || '',
        }

        valid.push(contact)
      } catch (e) {
        errors.push({
          row: i + 1,
          message: `Erro ao processar linha: ${(e as Error).message}`,
        })
      }
    }

    return { valid, errors }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    try {
      const content = await selectedFile.text()
      const result = parseCSV(content)
      setPreview(result)
    } catch (error) {
      alert(`Erro ao ler o ficheiro: ${(error as Error).message}`)
      setFile(null)
    }
  }

  const handleImport = () => {
    if (!preview || preview.valid.length === 0) {
      alert('Sem contactos válidos para importar')
      return
    }

    setImporting(true)

    try {
      const state = loadState()

      // Adiciona contactos e atualiza o nextId
      for (const contact of preview.valid) {
        state.contacts.push(contact)
      }
      state.nextId = Math.max(...preview.valid.map(c => c.id)) + 1

      saveState(state)

      alert(`✅ ${preview.valid.length} contacto(s) importado(s) com sucesso!`)
      setShowModal(false)
      setFile(null)
      setPreview(null)
      onImportComplete()
    } catch (error) {
      alert(`Erro ao importar: ${(error as Error).message}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        📥 Importar (CSV)
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Importar Contactos (CSV)
            </h3>

            {!preview ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seleciona um ficheiro CSV
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Formato esperado: CSV com colunas
                      <br />
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        name, email, phone, type, company, list, tags, notes
                      </code>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Dicas:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>
                        <strong>name</strong> e <strong>email</strong> são obrigatórios
                      </li>
                      <li>
                        <strong>type</strong> pode ser: cliente, colega, outro
                      </li>
                      <li>
                        <strong>tags</strong> devem estar separadas por ponto e vírgula (;)
                      </li>
                      <li>Espaços em branco são removidos automaticamente</li>
                    </ul>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                    ✅ Válidos: {preview.valid.length}
                  </h4>
                  {preview.valid.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3 max-h-40 overflow-y-auto text-sm">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-green-200 dark:border-green-700">
                            <th className="text-left py-1 px-2">Nome</th>
                            <th className="text-left py-1 px-2">Email</th>
                            <th className="text-left py-1 px-2">Tipo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.valid.map((contact) => (
                            <tr
                              key={contact.id}
                              className="border-b border-green-100 dark:border-green-800"
                            >
                              <td className="py-1 px-2 text-green-900 dark:text-green-100">
                                {contact.name}
                              </td>
                              <td className="py-1 px-2 text-green-900 dark:text-green-100">
                                {contact.email}
                              </td>
                              <td className="py-1 px-2 text-green-900 dark:text-green-100">
                                {contact.type}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {preview.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                      ❌ Erros: {preview.errors.length}
                    </h4>
                    <div className="bg-red-50 dark:bg-red-900 rounded-lg p-3 max-h-32 overflow-y-auto text-sm">
                      {preview.errors.map((err, i) => (
                        <div key={i} className="text-red-700 dark:text-red-200 mb-1">
                          Linha {err.row}: {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setPreview(null)
                      setFile(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || preview.valid.length === 0}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    {importing ? 'Importando...' : `Importar ${preview.valid.length}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
