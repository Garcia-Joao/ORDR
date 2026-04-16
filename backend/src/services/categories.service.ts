import { prisma } from '../lib/prisma'

type CreateCategoryInput = {
  companyId: string
  name: string
  emoji?: string | null
}

type UpdateCategoryInput = {
  name?: string
  emoji?: string | null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function normalizeCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    emoji: category.emoji ?? '📦',
    slug: category.slug ?? null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export async function getCategoriesByCompany(companyId: string) {
  const categories = await prisma.category.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
  })

  return categories.map(normalizeCategory)
}

export async function getCategoryById(categoryId: string, companyId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      companyId,
    },
  })

  if (!category) {
    return null
  }

  return normalizeCategory(category)
}

export async function createCategory(data: CreateCategoryInput) {
  if (!data.name?.trim()) {
    throw new Error('CATEGORY_NAME_REQUIRED')
  }

  const category = await prisma.category.create({
    data: {
      companyId: data.companyId,
      name: data.name.trim(),
      slug: slugify(data.name),
      ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
    },
  })

  return normalizeCategory(category)
}

export async function updateCategory(
  categoryId: string,
  companyId: string,
  data: UpdateCategoryInput
) {
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      companyId,
    },
  })

  if (!existingCategory) {
    throw new Error('CATEGORY_NOT_FOUND')
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('CATEGORY_NAME_REQUIRED')
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name === undefined ? existingCategory.name : data.name.trim(),
      slug: data.name === undefined ? existingCategory.slug : slugify(data.name),
      ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
    },
  })

  return normalizeCategory(category)
}

export async function deleteCategory(categoryId: string, companyId: string) {
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      companyId,
    },
  })

  if (!existingCategory) {
    throw new Error('CATEGORY_NOT_FOUND')
  }

  const linkedProducts = await prisma.product.count({
    where: {
      categoryId,
      companyId,
      active: true,
    },
  })

  if (linkedProducts > 0) {
    throw new Error('CATEGORY_HAS_PRODUCTS')
  }

  await prisma.category.delete({
    where: { id: categoryId },
  })

  return { ok: true }
}