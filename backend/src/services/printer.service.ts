const { printRawThermalTexts } = require('../../printer.js')

type OrderForPrint = {
  id: string
  comanda: number
  comandaName?: string | null
  createdAt: Date | string
  items: Array<{
    quantity: number
    notes?: string | null
    product: {
      name: string
    }
    variations: Array<{
      group: {
        name: string
      }
      options: Array<{
        option: {
          name: string
        }
      }>
    }>
  }>
}

function formatCreatedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('pt-BR')
}

function buildTicketText(
  item: OrderForPrint['items'][number],
  order: OrderForPrint
): string {
  const lines: string[] = []

  lines.push('*** ORDR ***')
  lines.push(`COMANDA: ${order.comanda}`)

  if (order.comandaName?.trim()) {
    lines.push(`NOME: ${order.comandaName.trim()}`)
  }

  lines.push(`PEDIDO: ${order.id}`)
  lines.push('--------------------------')
  lines.push(item.product.name)

  for (const variation of item.variations ?? []) {
    for (const opt of variation.options ?? []) {
      lines.push(`${variation.group.name}: ${opt.option.name}`)
    }
  }

  if (item.notes?.trim()) {
    lines.push(`OBS: ${item.notes.trim()}`)
  }

  lines.push('--------------------------')
  lines.push(formatCreatedAt(order.createdAt))
  lines.push('')
  lines.push('')
  lines.push('')

  return lines.join('\n')
}

export async function printOrderTickets(order: OrderForPrint) {
  const texts: string[] = []

  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      texts.push(buildTicketText(item, order))
    }
  }

  await printRawThermalTexts(texts)
}