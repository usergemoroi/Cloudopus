export interface Game {
  id: string
  slug: string
  name: string
  description: string
  shortDescription?: string | null
  genre: string[]
  rating: number
  reviewCount: number
  imageUrl: string
  backgroundImage?: string | null
  screenshots: string[]
  isFeatured: boolean
  isActive: boolean
  donatePackages?: DonatePackage[]
  reviews?: Review[]
}

export interface DonatePackage {
  id: string
  gameId: string
  name: string
  description: string
  priceRUB: number
  priceUSD: number
  priceEUR: number
  currency: string
  features: string[]
  isPopular: boolean
  isActive: boolean
  sortOrder: number
  game?: Game
}

export interface CartItem {
  id: string
  userId: string
  donatePackageId: string
  quantity: number
  donatePackage: DonatePackage & { game: Game }
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  currency: string
  paymentMethod?: string | null
  paymentIntentId?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  orderItems: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  donatePackageId: string
  quantity: number
  price: number
  currency: string
  donatePackage: DonatePackage & { game: Game }
}

export interface Review {
  id: string
  userId: string
  gameId: string
  rating: number
  comment: string
  isVisible: boolean
  createdAt: Date | string
  updatedAt: Date | string
  user: {
    name: string | null
    email: string
  }
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export interface FilterParams {
  search?: string
  genre?: string
  sort?: 'rating' | 'name' | 'newest'
}
