'use client'

import { useState } from 'react'
import { Contact, loadState, saveState, getTypeLabel } from '@/lib/storage'
import { importContactsFile, ImportResult } from '@/lib/Contactimport'

export default function ContactsImport({
  onImportComplete,
  forcedType,
  buttonLabel,
  modalTitle,
  className,
}: {
  onImportComplete: () => void
  forcedType?: 'cliente' | 'colega' | 'outro'
  buttonLabel?: string
  modalTitle?: string
  className?: string
}) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError(null)
    setLoading(true)
    setResult(null)

    try {
      const state = loadState()
      const parsed = await importContactsFile(file, state.nextId, forcedType)
      setResult(parsed)
    } catch (error) {
      setFileError(`Erro ao ler o ficheiro: ${(error as Error).message}`)
    } finally {
      setLoading(false)
      // Permite escolher o mesmo ficheiro outra vez se necessário
      e.target.value = ''
    }
  }

  const handleImport = () => {
    if (!result || result.valid.length === 0) {
      alert('Sem contactos válidos para importar')
      return
    }

    setImporting(true)

    try {
      const state = loadState()
      for (const contact of result.valid) {
        state.contacts.push(contact)
      }
      state.nextId = Math.max(...result.valid.map((c) => c.id)) + 1
      saveState(state)

      alert(`✅ ${result.valid.length} contacto(s) importado(s) com sucesso!`)
      closeAndReset()
      onImportComplete()
    } catch (error) {
      alert(`Erro ao importar: ${(error as Error).message}`)
    } finally {
      setImporting(false)
    }
  }

  const closeAndReset = () => {
    setShowModal(false)
    setResult(null)
    setFileError(null)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={
          className ||
          'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
        }
      >
        {buttonLabel || '📥 Importar (CSV/Excel)'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[32rem] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {modalTitle || 'Importar Contactos'}
            </h3>

            {!result ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seleciona um ficheiro CSV ou Excel (.xlsx)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      disabled={loading}
                      className="w-full"
                    />
                    {loading && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        A processar ficheiro...
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Aceita .csv, .xlsx e .xls. As colunas são detetadas
                      automaticamente — nome, email, telefone, empresa, etc.,
                      em português ou inglês.
                    </p>
                  </div>
                </div>

                {fileError && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 text-sm text-red-700 dark:text-red-200">
                    {fileError}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Como funciona:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Apenas <strong>nome</strong> ou <strong>email</strong> são obrigatórios (pelo menos um)</li>
                      <li>Colunas reconhecidas: Nome/Name, Email, Telefone/Telemóvel/Phone, Empresa/Company, Lista/List, Tipo/Tags</li>
                      <li>Colunas não reconhecidas (datas, observações, links, etc.) são guardadas nas notas do contacto</li>
                      {forcedType ? (
                        <li>
                          Todos os contactos importados aqui serão marcados como{' '}
                          <strong>{getTypeLabel(forcedType)}</strong>
                        </li>
                      ) : (
                        <li>Se houver coluna de tipo (ex: &apos;Tipo de cliente&apos;), tentamos classificar automaticamente como Cliente, Colega ou Outro</li>
                      )}
                    </ul>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeAndReset}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {result.detectedColumns.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                      Colunas detetadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.detectedColumns.map((c) => (
                        <span
                          key={c.field}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                        >
                          {c.header} → {c.field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.unmappedHeaders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                      Guardadas nas notas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.unmappedHeaders.map((h) => (
                        <span
                          key={h}
                          className="text-xs bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                    ✅ Válidos: {result.valid.length}
                  </h4>
                  {result.valid.length > 0 && (
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
                          {result.valid.slice(0, 50).map((contact) => (
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
                                {getTypeLabel(contact.type)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {result.valid.length > 50 && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                          ...e mais {result.valid.length - 50} contacto(s)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                      ❌ Erros: {result.errors.length}
                    </h4>
                    <div className="bg-red-50 dark:bg-red-900 rounded-lg p-3 max-h-32 overflow-y-auto text-sm">
                      {result.errors.map((err, i) => (
                        <div key={i} className="text-red-700 dark:text-red-200 mb-1">
                          Linha {err.row}: {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || result.valid.length === 0}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    {importing ? 'Importando...' : `Importar ${result.valid.length}`}
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