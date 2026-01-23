import Link from 'next/link'
import { ArrowRight, Shield, Zap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameCard } from '@/components/game-card'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const featuredGames = await prisma.game.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    take: 6,
    orderBy: {
      rating: 'desc',
    },
  })

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Лучшие донаты для ваших любимых игр
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Быстрая доставка, безопасные платежи и круглосуточная поддержка.
              Выберите свою игру и получите донаты мгновенно!
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/games">
                <Button size="lg" className="gap-2">
                  Смотреть каталог
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/popular">
                <Button size="lg" variant="outline">
                  Популярное
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Мгновенная доставка</h3>
              <p className="mt-2 text-muted-foreground">
                Получите свои донаты сразу после оплаты
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Безопасно</h3>
              <p className="mt-2 text-muted-foreground">
                Защищенные платежи через Stripe
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Гарантия качества</h3>
              <p className="mt-2 text-muted-foreground">
                Поддержка 24/7 и возврат средств
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Популярные игры</h2>
              <p className="mt-2 text-muted-foreground">
                Выберите игру и начните играть с преимуществом
              </p>
            </div>
            <Link href="/games">
              <Button variant="outline">
                Все игры
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
