import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: params.slug },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const packages = await prisma.donatePackage.findMany({
      where: { gameId: game.id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ game, packages })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
