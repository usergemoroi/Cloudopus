import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        donatePackage: {
          include: {
            game: true,
          },
        },
      },
    })

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageId } = await request.json()

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_donatePackageId: {
          userId: session.user.id,
          donatePackageId: packageId,
        },
      },
    })

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      })
      return NextResponse.json({ item: updated })
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        donatePackageId: packageId,
        quantity: 1,
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await request.json()

    await prisma.cartItem.delete({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          id: itemId,
          userId: session.user.id,
        },
      })
    } else {
      await prisma.cartItem.update({
        where: {
          id: itemId,
          userId: session.user.id,
        },
        data: { quantity },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
