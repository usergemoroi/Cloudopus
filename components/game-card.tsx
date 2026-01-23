import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Game } from '@/types'

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={game.imageUrl || '/placeholder-game.jpg'}
            alt={game.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {game.isFeatured && (
            <Badge className="absolute top-2 right-2">Популярная</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{game.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {game.shortDescription || game.description}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {game.genre.slice(0, 3).map((g) => (
              <Badge key={g} variant="outline" className="text-xs">
                {g}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{game.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({game.reviewCount} отзывов)
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
