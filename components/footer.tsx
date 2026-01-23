import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              GameDonate
            </h3>
            <p className="text-sm text-muted-foreground">
              Лучший магазин донатов для ваших любимых онлайн-игр. Быстро, безопасно, надежно.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Каталог</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/games" className="text-muted-foreground hover:text-foreground">
                  Все игры
                </Link>
              </li>
              <li>
                <Link href="/games?genre=MMORPG" className="text-muted-foreground hover:text-foreground">
                  MMORPG
                </Link>
              </li>
              <li>
                <Link href="/games?genre=FPS" className="text-muted-foreground hover:text-foreground">
                  FPS
                </Link>
              </li>
              <li>
                <Link href="/games?genre=MOBA" className="text-muted-foreground hover:text-foreground">
                  MOBA
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground">
                  Поддержка
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Правовая информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Условия использования
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GameDonate. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
