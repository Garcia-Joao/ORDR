import { Request, Response } from 'express'
import * as productsService from '../services/products.service'

type AuthRequest = Request & {
  user?: {
    id: string
    username: string
    role: string
    companyId: string
  }
}

export async function getProducts(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user?.companyId

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const includeInactive = req.query.includeInactive === 'true'

    const products = await productsService.getProductsByCompany(companyId, includeInactive)
    return res.json(products)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch products' })
  }
}

export async function getProductById(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user?.companyId
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const product = await productsService.getProductById(id, companyId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.json(product)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch product' })
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user?.companyId

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const product = await productsService.createProduct({
      companyId,
      ...req.body,
    })

    return res.status(201).json(product)
  } catch (error: any) {
    console.error('createProduct error:', error)

    if (error?.message === 'CATEGORY_NOT_FOUND') {
      return res.status(400).json({ error: 'Category not found' })
    }

    if (error?.message === 'CATEGORY_REQUIRED') {
      return res.status(400).json({ error: 'Category is required' })
    }

    if (error?.code === 'P2002') {
      return res.status(400).json({
        error: 'A product with this name already exists in this company',
      })
    }

    return res.status(500).json({
      error: error?.message || 'Failed to create product',
    })
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user?.companyId
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const product = await productsService.updateProduct(id, companyId, req.body)
    return res.json(product)
  } catch (error: any) {
    console.error(error)

    if (error?.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (error?.message === 'CATEGORY_NOT_FOUND') {
      return res.status(400).json({ error: 'Category not found' })
    }

    return res.status(500).json({ error: 'Failed to update product' })
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user?.companyId
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await productsService.deleteProduct(id, companyId)
    return res.json({ ok: true })
  } catch (error: any) {
    console.error('deleteProduct error:', error)

    if (error?.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(500).json({
      error: error?.message || 'Failed to delete product',
    })
  }
}