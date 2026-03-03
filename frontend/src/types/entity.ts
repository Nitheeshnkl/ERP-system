export type EntityType = 'customer' | 'supplier' | 'product'

export interface EntityOption {
  id: string
  name: string
  subtitle?: string
  raw?: any
}
