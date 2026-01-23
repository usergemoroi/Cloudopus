"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        throw new Error('Checkout failed')
      }

      const data = await res.json()

      toast({
        title: 'Заказ создан',
        description: `Номер заказа: ${data.orderNumber}`,
      })

      router.push(`/profile/orders`)
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Способ оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Для оплаты используется безопасная платежная система Stripe.
              В демо-режиме заказы создаются автоматически.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Тестовый режим:</strong> Нажмите "Оплатить заказ" для
                создания тестового заказа. Реальная оплата не производится.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Создание заказа...' : 'Оплатить заказ'}
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-center text-muted-foreground mt-6">
        Нажимая кнопку, вы соглашаетесь с{' '}
        <a href="/terms" className="text-primary hover:underline">
          условиями использования
        </a>{' '}
        и{' '}
        <a href="/privacy" className="text-primary hover:underline">
          политикой конфиденциальности
        </a>
      </p>
    </div>
  )
}
