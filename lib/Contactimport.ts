import * as XLSX from 'xlsx'
import { Contact } from './storage'

export interface ImportError {
  row: number
  message: string
}

export interface ImportResult {
  valid: Contact[]
  errors: ImportError[]
  detectedColumns: { field: string; header: string }[]
  unmappedHeaders: string[]
}

// ---------------------------------------------------------------------------
// Mapeamento de cabeçalhos (PT/EN, com e sem acentos) -> campos do Contact
// ---------------------------------------------------------------------------

type Field = 'name' | 'email' | 'phone' | 'company' | 'list' | 'tags' | 'notesExtra'

// Normaliza um cabeçalho: remove acentos, baixa para minúsculas, troca
// espaços/underscores por nada, remove pontuação. "Tipo de cliente " -> "tipodecliente"
function normalizeHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// Cada campo conhecido aponta para uma lista de aliases normalizados.
const FIELD_ALIASES: Record<Field, string[]> = {
  name: ['name', 'nome', 'fullname', 'nomecompleto', 'firstname', 'primeironome', 'contacto', 'contact'],
  email: ['email', 'emailaddress', 'mail', 'correio', 'correioeletronico', 'e-mail'.replace(/[^a-z]/g, '')],
  phone: ['phone', 'telefone', 'telemovel', 'telemovel', 'mobile', 'movel', 'celular', 'contacto1', 'numero', 'tel'],
  company: ['company', 'empresa', 'organizacao', 'organization', 'firma'],
  list: ['list', 'lista', 'segmento', 'grupo', 'group'],
  tags: ['tags', 'etiquetas', 'tipodecliente', 'tipo', 'categoria', 'category'],
  notesExtra: [], // tudo o que não mapeia para nenhum campo acima vai para aqui
}

// Colunas que sabemos ser "info extra" interessante para juntar a notes,
// mesmo que não caibam num campo estruturado.
const KNOWN_EXTRA_NOTE_HEADERS_HINT = [
  'data', 'resultado', 'observ', 'seguimento', 'links', 'link',
]

function detectFieldForHeader(header: string): Field | null {
  const norm = normalizeHeader(header)
  for (const field of Object.keys(FIELD_ALIASES) as Field[]) {
    if (FIELD_ALIASES[field].some((alias) => normalizeHeader(alias) === norm)) {
      return field
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Leitura de ficheiros: devolve sempre uma matriz de linhas (array de arrays),
// a primeira sendo o cabeçalho — independente de ser .csv ou .xlsx
// ---------------------------------------------------------------------------

export async function fileToRows(file: File): Promise<string[][]> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'csv') {
    const text = await file.text()
    const workbook = XLSX.read(text, { type: 'string', raw: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' })
  }

  // xlsx / xls
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  // Usa a primeira folha com dados (algumas folhas extra ficam vazias, ex: Folha2/Folha3)
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' })
    const nonEmpty = rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
    if (nonEmpty.length > 1) {
      return rows
    }
  }
  // fallback: primeira folha mesmo que pareça vazia
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1, raw: false, defval: '' })
}

// ---------------------------------------------------------------------------
// Heurística para classificar o "tipo" de contacto a partir de texto livre
// (ex: "Tipo de cliente" -> "Parceiro de negócios", "Cliente comprador", etc.)
// ---------------------------------------------------------------------------

function inferTypeFromText(raw: string): 'cliente' | 'colega' | 'outro' {
  const norm = normalizeHeader(raw)
  if (!norm) return 'cliente'
  if (norm.includes('parceir') || norm.includes('colega') || norm.includes('equipa') || norm.includes('freelancer')) {
    return 'colega'
  }
  if (norm.includes('cliente') || norm.includes('comprador') || norm.includes('vendedor') || norm.includes('investidor') || norm.includes('arrendatari')) {
    return 'cliente'
  }
  return 'outro'
}

// ---------------------------------------------------------------------------
// Parsing principal: recebe linhas (cabeçalho + dados) e devolve contactos
//
// forcedType: quando definido, ignora a inferência a partir da coluna de
// tipo/tags e aplica este tipo a TODOS os contactos importados (útil quando
// o import vem de um botão específico, ex: "Adicionar Equipa").
// ---------------------------------------------------------------------------

export function parseRows(
  rows: string[][],
  startId: number,
  forcedType?: 'cliente' | 'colega' | 'outro'
): ImportResult {
  const errors: ImportError[] = []
  const valid: Contact[] = []

  if (rows.length < 1) {
    return { valid, errors: [{ row: 0, message: 'Ficheiro vazio' }], detectedColumns: [], unmappedHeaders: [] }
  }

  const rawHeaders = rows[0].map((h) => String(h ?? '').trim())

  // Detecta a coluna correspondente a cada campo conhecido (primeira correspondência)
  const fieldToColIndex: Partial<Record<Field, number>> = {}
  const detectedColumns: { field: string; header: string }[] = []
  const usedColIndexes = new Set<number>()

  rawHeaders.forEach((header, idx) => {
    if (!header) return
    const field = detectFieldForHeader(header)
    if (field && field !== 'notesExtra' && fieldToColIndex[field] === undefined) {
      fieldToColIndex[field] = idx
      usedColIndexes.add(idx)
      detectedColumns.push({ field, header })
    }
  })

  // "First Name" do formato Gmail-like é a única coluna de nome quando não há "name"
  // (já tratado pelos aliases acima)

  // Colunas não mapeadas (vão para notes, juntas)
  const unmappedHeaders: string[] = []
  rawHeaders.forEach((header, idx) => {
    if (!header) return
    if (!usedColIndexes.has(idx)) {
      unmappedHeaders.push(header)
    }
  })

  if (fieldToColIndex.email === undefined && fieldToColIndex.name === undefined) {
    errors.push({
      row: 0,
      message: 'Não foi possível identificar colunas de nome ou email no cabeçalho.',
    })
    return { valid, errors, detectedColumns, unmappedHeaders }
  }

  let nextId = startId
  const dataRows = rows.slice(1)

  dataRows.forEach((row, i) => {
    const rowNum = i + 2 // +1 para 1-index, +1 porque a linha 1 é o cabeçalho

    // Linha completamente vazia: ignora silenciosamente (não conta como erro)
    if (row.every((cell) => String(cell ?? '').trim() === '')) return

    const get = (field: Field): string => {
      const idx = fieldToColIndex[field]
      if (idx === undefined) return ''
      return String(row[idx] ?? '').replace(/[\r\n]+/g, ' ').trim()
    }

    let name = get('name')
    const email = get('email')

    // Corrige nomes partidos por vírgulas em exports mal formados (ex: Google
    // Contacts), onde "Nuvem Hábil, Lda" aparece em duas colunas sem cabeçalho
    // próprio, logo depois da coluna do nome. Junta de volta com vírgula.
    if (fieldToColIndex.name !== undefined) {
      const nameIdx = fieldToColIndex.name
      let nextIdx = nameIdx + 1
      const extras: string[] = []
      while (
        nextIdx < rawHeaders.length &&
        !rawHeaders[nextIdx] && // coluna sem cabeçalho
        !usedColIndexes.has(nextIdx)
      ) {
        const val = String(row[nextIdx] ?? '').trim()
        if (val) extras.push(val)
        nextIdx++
        // Para na primeira coluna sem cabeçalho e sem valor (fim do "spillover")
        if (!val) break
      }
      if (extras.length > 0) {
        name = [name, ...extras].filter(Boolean).join(', ')
      }
    }

    if (!name && !email) {
      errors.push({ row: rowNum, message: 'Linha sem nome nem email — ignorada' })
      return
    }

    if (email && !email.includes('@')) {
      errors.push({ row: rowNum, message: `Email inválido: ${email}` })
      return
    }

    // Tipo: se forcedType estiver definido (import a partir de um botão
    // específico, ex: "Adicionar Equipa"), usa-o sempre. Caso contrário,
    // usa a coluna "tags"/"tipo de cliente" para inferir cliente/colega/outro.
    const typeRaw = get('tags')
    const type = forcedType ?? (typeRaw ? inferTypeFromText(typeRaw) : 'cliente')

    // Junta colunas não mapeadas (datas, resultados, observações, links, etc.)
    // ao campo notes, no formato "Cabeçalho: valor"
    const extraParts: string[] = []
    rawHeaders.forEach((header, idx) => {
      if (!header) return
      if (usedColIndexes.has(idx)) return
      const value = String(row[idx] ?? '').replace(/[\r\n]+/g, ' ').trim()
      if (value) extraParts.push(`${header}: ${value}`)
    })
    // Se a coluna de tipo tinha texto livre que não é um dos 3 valores exatos,
    // preserva o valor original nas notas também (mesmo com forcedType).
    if (typeRaw) {
      extraParts.unshift(`Tipo de cliente: ${typeRaw}`)
    }

    const contact: Contact = {
      id: nextId++,
      name: name || email.split('@')[0],
      email,
      phone: get('phone'),
      type,
      company: get('company'),
      list: get('list') || 'Newsletter',
      tags: [],
      notes: extraParts.join(' | '),
    }

    valid.push(contact)
  })

  return { valid, errors, detectedColumns, unmappedHeaders }
}

export async function importContactsFile(
  file: File,
  startId: number,
  forcedType?: 'cliente' | 'colega' | 'outro'
): Promise<ImportResult> {
  const rows = await fileToRows(file)
  return parseRows(rows, startId, forcedType)
}