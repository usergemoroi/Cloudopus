import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'RUB'): string {
  const currencySymbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  }

  const symbol = currencySymbols[currency] || currency

  if (currency === 'RUB') {
    return `${price.toFixed(0)} ${symbol}`
  }

  return `${symbol}${price.toFixed(2)}`
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Ожидает оплаты',
    PROCESSING: 'Обрабатывается',
    COMPLETED: 'Завершен',
    CANCELLED: 'Отменен',
    REFUNDED: 'Возвращен',
  }
  return labels[status] || status
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    PROCESSING: 'text-blue-600 bg-blue-50',
    COMPLETED: 'text-green-600 bg-green-50',
    CANCELLED: 'text-gray-600 bg-gray-50',
    REFUNDED: 'text-red-600 bg-red-50',
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}
