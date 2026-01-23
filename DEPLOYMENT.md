# 🚀 Руководство по развертыванию

## Vercel (рекомендуется для Next.js)

### Предварительные требования
1. Аккаунт GitHub
2. Аккаунт Vercel
3. База данных PostgreSQL (Vercel Postgres, Supabase, или другой провайдер)

### Шаги развертывания

#### 1. Подготовка репозитория
```bash
# Инициализируйте git (если еще не сделано)
git init
git add .
git commit -m "Initial commit"

# Загрузите на GitHub
git remote add origin https://github.com/yourusername/game-donate-store.git
git branch -M main
git push -u origin main
```

#### 2. Настройка базы данных

**Вариант A: Vercel Postgres**
1. Перейдите в Vercel Dashboard → Storage → Create Database
2. Выберите Postgres
3. Скопируйте `POSTGRES_URL` для использования в переменных окружения

**Вариант B: Supabase**
1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите connection string в Settings → Database
3. Формат: `postgresql://postgres:[password]@[host]:5432/postgres`

**Вариант C: Railway**
1. Создайте проект на [railway.app](https://railway.app)
2. Добавьте PostgreSQL плагин
3. Скопируйте DATABASE_URL

#### 3. Развертывание на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте ваш GitHub репозиторий
4. Настройте переменные окружения:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAWG_API_KEY=your-rawg-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_CURRENCY=RUB
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

5. Нажмите "Deploy"

#### 4. Настройка базы данных

После первого деплоя:

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в Vercel
vercel login

# Подключитесь к проекту
vercel link

# Примените схему БД
vercel env pull .env.local
npm run db:push

# Заполните данными (опционально, можно через Vercel CLI)
npm run db:seed
```

Или через Vercel CLI:
```bash
vercel env pull
npx prisma db push
npx prisma db seed
```

#### 5. Настройка Stripe Webhooks

1. Перейдите в [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Добавьте endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Выберите события:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Скопируйте webhook secret и добавьте в Vercel env vars

---

## Railway

### Шаги развертывания

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Добавьте PostgreSQL плагин
5. Настройте переменные окружения (аналогично Vercel)
6. Railway автоматически соберет и задеплоит проект

### Настройка БД на Railway

```bash
# Установите Railway CLI
npm i -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Выполните миграции
railway run npm run db:push
railway run npm run db:seed
```

---

## Render

### Шаги развертывания

1. Создайте аккаунт на [render.com](https://render.com)
2. Создайте PostgreSQL базу:
   - Dashboard → New → PostgreSQL
   - Скопируйте Internal Database URL
3. Создайте Web Service:
   - Dashboard → New → Web Service
   - Подключите GitHub репозиторий
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Добавьте переменные окружения
5. Deploy

---

## Heroku

### Предварительные требования
```bash
# Установите Heroku CLI
brew install heroku/brew/heroku  # macOS
# или
curl https://cli-assets.heroku.com/install.sh | sh  # Linux
```

### Шаги развертывания

```bash
# Войдите в Heroku
heroku login

# Создайте приложение
heroku create your-app-name

# Добавьте PostgreSQL
heroku addons:create heroku-postgresql:mini

# Настройте Node.js buildpack
heroku buildpacks:set heroku/nodejs

# Установите переменные окружения
heroku config:set NEXTAUTH_SECRET="your-secret"
heroku config:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
heroku config:set STRIPE_SECRET_KEY="sk_..."
heroku config:set RAWG_API_KEY="your-key"
heroku config:set NEXTAUTH_URL="https://your-app-name.herokuapp.com"
heroku config:set NEXT_PUBLIC_APP_URL="https://your-app-name.herokuapp.com"

# Deploy
git push heroku main

# Запустите миграции
heroku run npm run db:push
heroku run npm run db:seed

# Откройте приложение
heroku open
```

---

## DigitalOcean App Platform

1. Создайте аккаунт на [digitalocean.com](https://digitalocean.com)
2. Создайте Managed PostgreSQL Database
3. Создайте App из GitHub репозитория
4. Настройте переменные окружения
5. Добавьте Database компонент
6. Deploy

---

## Docker (для любого хостинга)

### Создайте Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/gamedonatestore
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=gamedonatestore
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Запуск

```bash
docker-compose up -d
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
```

---

## VPS (Ubuntu/Debian)

### 1. Подготовка сервера

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установите PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установите Nginx
sudo apt install -y nginx

# Установите certbot для SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Настройка PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE game_donate_store;
CREATE USER gamedonateuser WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE game_donate_store TO gamedonateuser;
\q
```

### 3. Деплой приложения

```bash
# Клонируйте репозиторий
cd /var/www
sudo git clone https://github.com/yourusername/game-donate-store.git
cd game-donate-store

# Установите зависимости
sudo npm install

# Создайте .env
sudo nano .env
# Заполните переменные

# Соберите приложение
sudo npm run build

# Установите PM2 для управления процессом
sudo npm install -g pm2

# Запустите приложение
pm2 start npm --name "game-donate" -- start
pm2 save
pm2 startup
```

### 4. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/game-donate
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активируйте конфиг
sudo ln -s /etc/nginx/sites-available/game-donate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Настройте SSL
sudo certbot --nginx -d your-domain.com
```

---

## Проверка после деплоя

### Чеклист

- [ ] Сайт открывается по URL
- [ ] База данных подключена
- [ ] Можно зарегистрироваться/войти
- [ ] Отображаются игры
- [ ] Работает добавление в корзину
- [ ] Работает оформление заказа
- [ ] SSL сертификат установлен (для production)
- [ ] Stripe webhooks настроены
- [ ] Переменные окружения защищены

### Мониторинг

```bash
# Логи (Vercel)
vercel logs

# Логи (Railway)
railway logs

# Логи (Heroku)
heroku logs --tail

# Логи (PM2)
pm2 logs game-donate
```

---

## Производительность

### Рекомендации

1. Включите Next.js Image Optimization
2. Настройте CDN для статики
3. Используйте database connection pooling
4. Настройте caching headers
5. Включите compression

### Prisma Connection Pooling

Для serverless окружений (Vercel, Railway):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Безопасность для Production

1. **Используйте HTTPS** везде
2. **Настройте CORS** правильно
3. **Rate limiting** для API
4. **Валидация** всех входных данных
5. **Регулярные бэкапы** БД
6. **Мониторинг** ошибок (Sentry)
7. **Secure headers** (helmet.js)

---

## Поддержка

Если возникли проблемы при деплое, создайте Issue в GitHub репозитории.
