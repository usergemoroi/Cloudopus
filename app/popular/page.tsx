import { GameCard } from '@/components/game-card'
import { prisma } from '@/lib/prisma'

export default async function PopularPage() {
  const games = await prisma.game.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    orderBy: {
      rating: 'desc',
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Популярные игры</h1>
        <p className="text-muted-foreground">
          Самые популярные игры с наивысшими рейтингами
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
