"use client"

import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import type { DonatePackage } from '@/types'

interface DonatePackageCardProps {
  package: DonatePackage
  onAddToCart: (packageId: string) => void
}

export function DonatePackageCard({ package: pkg, onAddToCart }: DonatePackageCardProps) {
  return (
    <Card className={`relative ${pkg.isPopular ? 'border-primary shadow-lg' : ''}`}>
      {pkg.isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
          Популярный
        </Badge>
      )}
      <CardHeader>
        <CardTitle>{pkg.name}</CardTitle>
        <CardDescription>{pkg.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">
            {formatPrice(pkg.priceRUB, 'RUB')}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPrice(pkg.priceUSD, 'USD')} / {formatPrice(pkg.priceEUR, 'EUR')}
          </div>
        </div>
        <ul className="space-y-2">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={() => onAddToCart(pkg.id)}
        >
          Добавить в корзину
        </Button>
      </CardFooter>
    </Card>
  )
}
