import { EntityOption, EntityType } from '../types/entity'

export interface EntityListResult {
  items: EntityOption[]
  total: number
}

export interface EntityFieldConfig {
  key: string
  label: string
  type: 'text' | 'email' | 'number'
  required?: boolean
}

export interface EntityConfig {
  type: EntityType
  singular: string
  plural: string
  endpoint: string
  createRoles: string[]
  selectLabel: string
  searchPlaceholder: string
  fields: EntityFieldConfig[]
  toOption: (item: any) => EntityOption
  toCreatePayload: (form: Record<string, string>) => Record<string, any>
  validateCreate: (form: Record<string, string>) => string[]
}

const required = (label: string, value?: string) => (!String(value || '').trim() ? `${label} is required` : null)

export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  customer: {
    type: 'customer',
    singular: 'Customer',
    plural: 'Customers',
    endpoint: '/customers',
    createRoles: ['Admin', 'Sales'],
    selectLabel: 'Customer',
    searchPlaceholder: 'Search customers by name/email',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
    ],
    toOption: (item: any) => ({
      id: item._id || item.id,
      name: item.name || '',
      subtitle: [item.email, item.phone].filter(Boolean).join(' | '),
      raw: item,
    }),
    toCreatePayload: (form) => ({
      name: String(form.name || '').trim(),
      email: String(form.email || '').trim(),
      phone: String(form.phone || '').trim(),
      address: String(form.address || '').trim(),
    }),
    validateCreate: (form) => {
      const errors = [
        required('Name', form.name),
        required('Email', form.email),
      ].filter(Boolean) as string[]

      const email = String(form.email || '').trim()
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Enter a valid email address')
      }
      return errors
    },
  },
  supplier: {
    type: 'supplier',
    singular: 'Supplier',
    plural: 'Suppliers',
    endpoint: '/suppliers',
    createRoles: ['Admin', 'Purchase'],
    selectLabel: 'Supplier',
    searchPlaceholder: 'Search suppliers by name/email/phone',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
    ],
    toOption: (item: any) => ({
      id: item._id || item.id,
      name: item.name || '',
      subtitle: [item.email, item.phone].filter(Boolean).join(' | '),
      raw: item,
    }),
    toCreatePayload: (form) => ({
      name: String(form.name || '').trim(),
      email: String(form.email || '').trim(),
      phone: String(form.phone || '').trim(),
      address: String(form.address || '').trim(),
    }),
    validateCreate: (form) => {
      const errors = [required('Name', form.name)].filter(Boolean) as string[]
      const email = String(form.email || '').trim()
      const phone = String(form.phone || '').trim()
      if (!email && !phone) {
        errors.push('Email or Phone is required')
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Enter a valid email address')
      }
      return errors
    },
  },
  product: {
    type: 'product',
    singular: 'Product',
    plural: 'Products',
    endpoint: '/products',
    createRoles: ['Admin', 'Inventory'],
    selectLabel: 'Product',
    searchPlaceholder: 'Search products by name/SKU',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'sku', label: 'SKU', type: 'text', required: true },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
    ],
    toOption: (item: any) => ({
      id: item._id || item.id,
      name: item.name || '',
      subtitle: [item.sku, item.price != null ? `Price ${item.price}` : ''].filter(Boolean).join(' | '),
      raw: item,
    }),
    toCreatePayload: (form) => ({
      name: String(form.name || '').trim(),
      sku: String(form.sku || '').trim(),
      price: Number(form.price || 0),
      stockQuantity: Number(form.stockQuantity || 0),
    }),
    validateCreate: (form) => {
      const errors = [
        required('Name', form.name),
        required('SKU', form.sku),
        required('Price', form.price),
      ].filter(Boolean) as string[]

      const price = Number(form.price)
      if (!Number.isFinite(price) || price < 0) {
        errors.push('Price must be a valid non-negative number')
      }
      const stock = Number(form.stockQuantity || 0)
      if (!Number.isFinite(stock) || stock < 0) {
        errors.push('Stock Quantity must be a valid non-negative number')
      }
      return errors
    },
  },
}
