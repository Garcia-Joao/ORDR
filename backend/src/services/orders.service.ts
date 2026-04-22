import { OrderStatus, Prisma } from '@prisma/client'
import PDFDocument from 'pdfkit'
import { prisma } from '../lib/prisma'
import { printOrderTickets } from './printer.service'

type CreateOrderVariationOptionInput = {
  optionId: string
  priceModifier: Prisma.Decimal | number | string
}

type CreateOrderVariationSelectionInput = {
  groupId: string
  options: CreateOrderVariationOptionInput[]
}

type CreateOrderItemInput = {
  productId: string
  quantity: number
  unitPrice: Prisma.Decimal | number | string
  totalPrice: Prisma.Decimal | number | string
  notes?: string | null
  variations?: CreateOrderVariationSelectionInput[]
}

type CreateOrderInput = {
  id: string
  companyId: string
  comanda: number
  comandaName?: string | null
  createdAt?: Date
  paidAt?: Date | null
  status: OrderStatus
  total: Prisma.Decimal | number | string
  orderItems: CreateOrderItemInput[]
}

export async function createOrder(data: CreateOrderInput) {
  if (!data.companyId?.trim()) {
    throw new Error('ORDER_COMPANY_ID_REQUIRED')
  }

  if (data.comanda == null) {
    throw new Error('ORDER_COMANDA_REQUIRED')
  }

  if (!Array.isArray(data.orderItems) || data.orderItems.length === 0) {
    throw new Error('ORDER_ITEMS_REQUIRED')
  }

const order = await prisma.order.create({
  data: {
    id: data.id,
    companyId: data.companyId,
    comanda: data.comanda,
    comandaName: data.comandaName?.trim() || null,
    createdAt: data.createdAt,
    paidAt: data.paidAt ?? null,
    status: data.status,
    total: new Prisma.Decimal(data.total),
    items: {
      create: data.orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        totalPrice: new Prisma.Decimal(item.totalPrice),
        notes: item.notes ?? null,
        variations: item.variations?.length
          ? {
              create: item.variations.map((variation) => ({
                groupId: variation.groupId,
                options: variation.options?.length
                  ? {
                      create: variation.options.map((option) => ({
                        optionId: option.optionId,
                        priceModifier: new Prisma.Decimal(option.priceModifier),
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      })),
    },
  },
  include: {
    company: true,
    items: {
      include: {
        product: {
          include: {
            variationGroups: {
              orderBy: {
                sortOrder: 'asc',
              },
              include: {
                options: {
                  where: {
                    active: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        },
        variations: {
          include: {
            group: true,
            options: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    },
  },
})

  try {
await printOrderTickets({
  id: order.id,
  comanda: order.comanda,
  comandaName: data.comandaName?.trim() || null,
  createdAt: order.createdAt,
  items: order.items.map((item) => ({
    quantity: item.quantity,
    notes: item.notes,
    product: {
      name: item.product.name,
    },
    variations: item.variations.map((variation) => ({
      group: {
        name: variation.group.name,
      },
      options: variation.options.map((opt) => ({
        option: {
          name: opt.option.name,
        },
      })),
    })),
  })),
})
  } catch (error) {
    console.error('Print error:', error)
  }

  return {
    ...order,
    total: Number(order.total),
  }
}

export async function getOrdersByCompany(companyId: string, includeCancelled = true) {
  const orders = await prisma.order.findMany({
    where: {
      companyId,
      ...(includeCancelled ? {} : { status: 'paid' }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              variationGroups: {
                orderBy: {
                  sortOrder: 'asc',
                },
                include: {
                  options: {
                    where: {
                      active: true,
                    },
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              },
            },
          },
          variations: {
            include: {
              group: true,
              options: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return orders.map((order) => ({
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      product: {
        ...item.product,
        price: Number(item.product.price),
        variationGroups: (item.product.variationGroups ?? []).map((group) => ({
          ...group,
          options: (group.options ?? []).map((option) => ({
            ...option,
            priceModifier: Number(option.priceModifier),
          })),
        })),
      },
      quantity: item.quantity,
      variationSelections: item.variations.map((variation) => ({
        groupId: variation.groupId,
        selectedOptionIds: variation.options.map((option) => option.optionId),
      })),
    })),
  }))
}

export async function cancelOrder(orderId: string, companyId: string) {
  const existingOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
      companyId,
    },
  })

  if (!existingOrder) {
    throw new Error('ORDER_NOT_FOUND')
  }

  const order = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: 'cancelled',
    },
  })

  return {
    ...order,
    total: Number(order.total),
  }
}

export async function generateOrdersReportPdf(companyId: string): Promise<Buffer> {
  const orders = await prisma.order.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
      items: {
        include: {
          product: true,
          variations: {
            include: {
              group: true,
              options: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
  })

  const chunks: Buffer[] = []

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const companyName = orders[0]?.company?.name || 'Empresa'
    const generatedAt = new Date().toLocaleString('pt-BR')

    doc.fontSize(20).text('Relatório de Pedidos')
    doc.moveDown(0.3)
    doc.fontSize(11).fillColor('#666666').text(`Empresa: ${companyName}`)
    doc.text(`Gerado em: ${generatedAt}`)
    doc.text(`Total de pedidos: ${orders.length}`)
    doc.fillColor('#000000')
    doc.moveDown()

    if (orders.length === 0) {
      doc.fontSize(12).text('Nenhum pedido encontrado.')
      doc.end()
      return
    }

    for (const order of orders) {
      if (doc.y > 700) {
        doc.addPage()
      }

      doc.fontSize(13).text(`Pedido #${order.id}`, { underline: true })
      doc.fontSize(10)
      doc.text(`Comanda: ${order.comanda}`)
      doc.text(`Status: ${order.status}`)
      doc.text(`Criado em: ${new Date(order.createdAt).toLocaleString('pt-BR')}`)
      doc.text(`Total: R$ ${Number(order.total).toFixed(2)}`)
      if (order.paidAt) {
        doc.text(`Pago em: ${new Date(order.paidAt).toLocaleString('pt-BR')}`)
      }

      doc.moveDown(0.4)

      for (const item of order.items) {
        doc.fontSize(10).text(
          `• ${item.quantity}x ${item.product.name} | Unitário: R$ ${Number(item.unitPrice).toFixed(2)} | Total: R$ ${Number(item.totalPrice).toFixed(2)}`
        )

        if (item.notes) {
          doc.fontSize(9).fillColor('#666666').text(`  Obs: ${item.notes}`)
          doc.fillColor('#000000')
        }

        for (const variation of item.variations) {
          for (const option of variation.options) {
            doc
              .fontSize(9)
              .fillColor('#666666')
              .text(
                `  - ${variation.group.name}: ${option.option.name} (${Number(option.priceModifier) >= 0 ? '+' : ''}R$ ${Number(option.priceModifier).toFixed(2)})`
              )
            doc.fillColor('#000000')
          }
        }

        doc.moveDown(0.2)
      }

      doc.moveDown()
      doc.strokeColor('#cccccc')
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown()
    }

    doc.end()
  })
}

export async function getOrdersReportSummary(
  companyId: string,
  fromDate?: string,
  toDate?: string
) {
  let createdAtFilter: Prisma.DateTimeFilter | undefined

  const hasFrom = !!fromDate
  const hasTo = !!toDate

  if (hasFrom || hasTo) {
    createdAtFilter = {}

    if (fromDate) {
      const [year, month, day] = fromDate.split('-').map(Number)
      createdAtFilter.gte = new Date(year, month - 1, day, 0, 0, 0, 0)
    }

    if (toDate) {
      const [year, month, day] = toDate.split('-').map(Number)
      createdAtFilter.lte = new Date(year, month - 1, day, 23, 59, 59, 999)
    }
  }

  const orders = await prisma.order.findMany({
    where: {
      companyId,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  const totalOrders = orders.length
  const grossRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
  const totalItemsSold = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  )

  const averageTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0

  const statusCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  const salesByDayMap = new Map<string, { date: string; orders: number; revenue: number }>()

  for (const order of orders) {
    const date = new Date(order.createdAt).toLocaleDateString('pt-BR')
    const current = salesByDayMap.get(date) ?? { date, orders: 0, revenue: 0 }
    current.orders += 1
    current.revenue += Number(order.total)
    salesByDayMap.set(date, current)
  }

  const productMap = new Map<
    string,
    {
      productId: string
      name: string
      quantity: number
      revenue: number
    }
  >()

  for (const order of orders) {
    for (const item of order.items) {
      const current = productMap.get(item.productId) ?? {
        productId: item.productId,
        name: item.product.name,
        quantity: 0,
        revenue: 0,
      }

      current.quantity += item.quantity
      current.revenue += Number(item.totalPrice)
      productMap.set(item.productId, current)
    }
  }

  const topProductsByQuantity = [...productMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  const topProductsByRevenue = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const recentOrders = orders.slice(0, 10).map((order) => ({
    id: order.id,
    comanda: order.comanda,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }))

  const salesByDay = [...salesByDayMap.values()].sort((a, b) => {
    const [da, ma, ya] = a.date.split('/')
    const [db, mb, yb] = b.date.split('/')
    return new Date(`${ya}-${ma}-${da}`).getTime() - new Date(`${yb}-${mb}-${db}`).getTime()
  })

  return {
    summary: {
      totalOrders,
      grossRevenue,
      averageTicket,
      totalItemsSold,
      statusCounts,
    },
    charts: {
      salesByDay,
      topProductsByQuantity,
      topProductsByRevenue,
    },
    recentOrders,
  }
}