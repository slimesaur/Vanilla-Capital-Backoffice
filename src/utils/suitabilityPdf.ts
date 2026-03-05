import { jsPDF } from 'jspdf'
import type { SuitabilityFormData, SuitabilityResponse } from '../types/suitability'

const MARGIN = 20
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const SECTION_GAP = 10

function parseSelectedOptions(val: string): string[] {
  if (val.startsWith('[')) {
    try {
      const arr = JSON.parse(val) as unknown
      return Array.isArray(arr) ? arr.map(String) : [val]
    } catch {
      return [val]
    }
  }
  return val ? [val] : []
}

export function generateSuitabilityResponsePdf(
  response: SuitabilityResponse,
  form: SuitabilityFormData,
  labels: {
    formTitle: string
    formSubtitle: string
    submittedAt: string
    questionPrefix: string
    labelMap: Record<string, string>
    entityTypeIndividual: string
    entityTypeLegalEntity: string
  }
): void {
  const doc = new jsPDF()
  let y = MARGIN

  const addSection = (label: string, value: string) => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const labelLines = doc.splitTextToSize(label, CONTENT_WIDTH)
    doc.text(labelLines, MARGIN, y)
    y += labelLines.length * 4 + 2

    doc.setFont('helvetica', 'normal')
    const valueLines = doc.splitTextToSize(value || '-', CONTENT_WIDTH - 10)
    doc.text(valueLines, MARGIN + 5, y)
    y += valueLines.length * 4 + SECTION_GAP
  }

  const checkNewPage = (neededSpace = 30) => {
    if (y > 270 - neededSpace) {
      doc.addPage()
      y = MARGIN
    }
  }

  // Title - matching form page
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(labels.formTitle, MARGIN, y)
  y += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const subtitleLines = doc.splitTextToSize(labels.formSubtitle, CONTENT_WIDTH)
  doc.text(subtitleLines, MARGIN, y)
  y += subtitleLines.length * 5 + 15

  // Submitted at
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(`${labels.submittedAt}: ${new Date(response.submittedAt).toLocaleString()}`, MARGIN, y)
  y += 12

  const outputKeys = new Set<string>()

  // Identification fields (entityType, name/cpf or legalName/cnpj)
  const entityType = response.answers.entityType
  const displayEntityType =
    entityType === 'legal_entity' ? labels.entityTypeLegalEntity : labels.entityTypeIndividual
  addSection(labels.labelMap.entityType ?? 'Entity Type', displayEntityType)
  outputKeys.add('entityType')

  if (entityType === 'legal_entity') {
    addSection(labels.labelMap.legalName ?? 'Corporate Name', response.answers.legalName ?? '')
    addSection(labels.labelMap.cnpj ?? 'CNPJ', response.answers.cnpj ?? '')
    outputKeys.add('legalName').add('cnpj')
  } else {
    addSection(labels.labelMap.name ?? 'Name', response.answers.name ?? '')
    addSection(labels.labelMap.cpf ?? 'CPF', response.answers.cpf ?? '')
    outputKeys.add('name').add('cpf')
    if (response.answers.email) {
      addSection(labels.labelMap.email ?? 'Email', response.answers.email)
      outputKeys.add('email')
    }
  }

  // Questions in order
  form.questions.forEach((q, idx) => {
    outputKeys.add(q.id)
    checkNewPage(25)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`${labels.questionPrefix} ${String(idx + 1).padStart(2, '0')}`, MARGIN, y)
    y += 6

    const questionTitle = q.title || q.id.slice(0, 8)
    doc.setFont('helvetica', 'normal')
    const titleLines = doc.splitTextToSize(questionTitle, CONTENT_WIDTH)
    doc.text(titleLines, MARGIN, y)
    y += titleLines.length * 4 + 4

    const rawAnswer = response.answers[q.id] ?? ''
    const displayed = parseSelectedOptions(rawAnswer).join(', ') || '-'
    const answerLines = doc.splitTextToSize(displayed, CONTENT_WIDTH - 10)
    doc.text(answerLines, MARGIN + 5, y)
    y += answerLines.length * 4 + SECTION_GAP
  })

  // Any remaining answers (e.g. from legacy form versions)
  for (const [key, val] of Object.entries(response.answers)) {
    if (outputKeys.has(key)) continue
    checkNewPage(20)
    const label = labels.labelMap[key] ?? key
    const displayed = parseSelectedOptions(val ?? '').join(', ') || '-'
    addSection(label, displayed)
  }

  // Generate filename: Suitability-Form-YYYY-MM-DD-HHmm.pdf
  const date = new Date(response.submittedAt)
  const dateStr = date.toISOString().slice(0, 10)
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '')
  const filename = `Suitability-Form-${dateStr}-${timeStr}.pdf`

  doc.save(filename)
}
