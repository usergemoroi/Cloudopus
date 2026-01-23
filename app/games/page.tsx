import { Suspense } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GameCard } from '@/components/game-card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

interface SearchParams {
  search?: string
  genre?: string
  sort?: string
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { search, genre, sort = 'rating' } = searchParams

  const games = await prisma.game.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(genre && {
        genre: {
          has: genre,
        },
      }),
    },
    orderBy:
      sort === 'name'
        ? { name: 'asc' }
        : sort === 'newest'
        ? { createdAt: 'desc' }
        : { rating: 'desc' },
  })

  const allGenres = Array.from(
    new Set(games.flatMap((game) => game.genre))
  ).sort()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Каталог игр</h1>
        <p className="text-muted-foreground">
          Найдено игр: {games.length}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск игр..."
            className="pl-10"
            defaultValue={search}
            name="search"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3">Жанры:</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!genre ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            Все
          </Badge>
          {allGenres.map((g) => (
            <Badge
              key={g}
              variant={genre === g ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              {g}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Игры не найдены. Попробуйте изменить параметры поиска.
          </p>
        </div>
      )}
    </div>
  )
}
