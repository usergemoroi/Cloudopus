"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, ShoppingBag, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Профиль</CardTitle>
                <CardDescription>
                  Управление вашим профилем
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="font-medium">{session?.user?.name || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Роль</p>
                <p className="font-medium">
                  {session?.user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Заказы</CardTitle>
                <CardDescription>
                  История ваших покупок
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Просмотрите историю своих заказов и их статусы
            </p>
            <Link href="/profile/orders">
              <Button className="w-full">Перейти к заказам</Button>
            </Link>
          </CardContent>
        </Card>

        {session?.user?.role === 'ADMIN' && (
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Администрирование</CardTitle>
                  <CardDescription>
                    Управление магазином
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Доступ к панели администратора для управления играми, донатами и заказами
              </p>
              <Link href="/admin">
                <Button className="w-full">Открыть панель администратора</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
