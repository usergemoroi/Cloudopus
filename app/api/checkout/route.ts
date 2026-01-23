import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
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

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.donatePackage.priceRUB * item.quantity,
      0
    )

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        status: 'PENDING',
        totalAmount,
        currency: 'RUB',
        customerEmail: session.user.email!,
        customerName: session.user.name || 'Guest',
        orderItems: {
          create: cartItems.map((item) => ({
            donatePackageId: item.donatePackageId,
            quantity: item.quantity,
            price: item.donatePackage.priceRUB,
            currency: 'RUB',
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            donatePackage: {
              include: {
                game: true,
              },
            },
          },
        },
      },
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'rub',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    })

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
