"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DonatePackageCard } from '@/components/donate-package-card'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import type { Game, DonatePackage } from '@/types'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [game, setGame] = useState<Game | null>(null)
  const [packages, setPackages] = useState<DonatePackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setGame(data.game)
          setPackages(data.packages)
        }
      } catch (error) {
        console.error('Error fetching game:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [params.slug])

  const handleAddToCart = async (packageId: string) => {
    if (!session) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в систему для добавления товаров в корзину',
        variant: 'destructive',
      })
      router.push('/auth/signin')
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      if (res.ok) {
        toast({
          title: 'Добавлено в корзину',
          description: 'Товар успешно добавлен в вашу корзину',
        })
      } else {
        throw new Error('Failed to add to cart')
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="container py-8">
        <div className="text-center">Игра не найдена</div>
      </div>
    )
  }

  return (
    <div>
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${game.backgroundImage || game.imageUrl})`,
        }}
      >
        <div className="container h-full flex flex-col justify-end pb-8">
          <Button
            variant="ghost"
            className="self-start mb-4 text-white hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {game.name}
          </h1>
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{game.rating.toFixed(1)}</span>
              <span className="text-white/80">({game.reviewCount} отзывов)</span>
            </div>
            <div className="flex gap-2">
              {game.genre.map((g) => (
                <Badge key={g} variant="secondary">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Описание</h2>
              <p className="text-muted-foreground leading-relaxed">
                {game.description}
              </p>
            </section>

            {game.screenshots && game.screenshots.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Скриншоты</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {game.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="relative aspect-video overflow-hidden rounded-lg"
                    >
                      <Image
                        src={screenshot}
                        alt={`${game.name} screenshot ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Пакеты донатов</h2>
            <div className="space-y-4">
              {packages
                .filter((pkg) => pkg.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((pkg) => (
                  <DonatePackageCard
                    key={pkg.id}
                    package={pkg}
                    onAddToCart={handleAddToCart}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
