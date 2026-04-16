import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

type VariationOptionInput = {
  id?: string
  name: string
  priceModifier?: number
  sortOrder?: number
  active?: boolean
}

type VariationGroupInput = {
  id?: string
  name: string
  selectionType: 'single' | 'multiple'
  required?: boolean
  sortOrder?: number
  options?: VariationOptionInput[]
}

type CreateProductInput = {
  companyId: string
  categoryId?: string | null
  name: string
  description?: string | null
  emoji?: string | null
  price: number
  active?: boolean
  variationGroups?: VariationGroupInput[]
}

type UpdateProductInput = {
  categoryId?: string | null
  name?: string
  description?: string | null
  emoji?: string | null
  price?: number
  active?: boolean
  variationGroups?: VariationGroupInput[]
}

function normalizeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    variationGroups: (product.variationGroups ?? []).map((group: any) => ({
      ...group,
      options: (group.options ?? []).map((option: any) => ({
        ...option,
        priceModifier: Number(option.priceModifier),
      })),
    })),
  }
}

async function ensureCategoryBelongsToCompany(categoryId: string, companyId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      companyId,
    },
  })

  if (!category) {
    throw new Error('CATEGORY_NOT_FOUND')
  }

  return category
}

export async function getProductsByCompany(companyId: string, includeInactive = false) {
  const products = await prisma.product.findMany({
    where: {
      companyId,
      ...(includeInactive ? {} : { active: true }),
    },
    include: {
      category: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map(normalizeProduct)
}

export async function getProductById(productId: string, companyId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      companyId,
    },
    include: {
      category: true,
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
  })

  if (!product) {
    return null
  }

  return normalizeProduct(product)
}

export async function createProduct(data: CreateProductInput) {
  if (data.categoryId) {
    await ensureCategoryBelongsToCompany(data.categoryId, data.companyId)
  }

  const product = await prisma.product.create({
    data: {
      companyId: data.companyId,
      categoryId: data.categoryId ?? null,
      name: data.name,
      description: data.description ?? null,
      emoji: data.emoji ?? null,
      price: new Prisma.Decimal(data.price),
      active: data.active ?? true,
      variationGroups: {
        create: (data.variationGroups ?? []).map((group, groupIndex) => ({
          name: group.name,
          selectionType: group.selectionType,
          required: group.required ?? false,
          sortOrder: group.sortOrder ?? groupIndex,
          options: {
            create: (group.options ?? []).map((option, optionIndex) => ({
              name: option.name,
              priceModifier: new Prisma.Decimal(option.priceModifier ?? 0),
              sortOrder: option.sortOrder ?? optionIndex,
              active: option.active ?? true,
            })),
          },
        })),
      },
    },
    include: {
      category: true,
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
  })

  return normalizeProduct(product)
}

export async function updateProduct(
  productId: string,
  companyId: string,
  data: UpdateProductInput
) {
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      companyId,
    },
  })

  if (!existingProduct) {
    throw new Error('PRODUCT_NOT_FOUND')
  }

  if (data.categoryId) {
    await ensureCategoryBelongsToCompany(data.categoryId, companyId)
  }

  if (data.variationGroups) {
    await prisma.productVariationGroup.deleteMany({
      where: {
        productId,
      },
    })
  }

  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      categoryId:
        data.categoryId === undefined ? existingProduct.categoryId : data.categoryId,
      name: data.name ?? existingProduct.name,
      description:
        data.description === undefined ? existingProduct.description : data.description,
      emoji: data.emoji === undefined ? existingProduct.emoji : data.emoji,
      price:
        data.price === undefined
          ? existingProduct.price
          : new Prisma.Decimal(data.price),
      active: data.active ?? existingProduct.active,
      ...(data.variationGroups
        ? {
            variationGroups: {
              create: data.variationGroups.map((group, groupIndex) => ({
                name: group.name,
                selectionType: group.selectionType,
                required: group.required ?? false,
                sortOrder: group.sortOrder ?? groupIndex,
                options: {
                  create: (group.options ?? []).map((option, optionIndex) => ({
                    name: option.name,
                    priceModifier: new Prisma.Decimal(option.priceModifier ?? 0),
                    sortOrder: option.sortOrder ?? optionIndex,
                    active: option.active ?? true,
                  })),
                },
              })),
            },
          }
        : {}),
    },
    include: {
      category: true,
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
  })

  return normalizeProduct(product)
}

export async function deleteProduct(productId: string, companyId: string) {
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      companyId,
    },
  })

  if (!existingProduct) {
    throw new Error('PRODUCT_NOT_FOUND')
  }

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      active: false,
    },
  })

  return { ok: true }
}