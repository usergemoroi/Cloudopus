# 📡 API Documentation

## Authentication Endpoints

### POST `/api/auth/signup`
Регистрация нового пользователя.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx123...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### POST `/api/auth/signin` (NextAuth)
Вход пользователя (handled by NextAuth).

### POST `/api/auth/signout` (NextAuth)
Выход пользователя (handled by NextAuth).

---

## Games Endpoints

### GET `/api/games/[slug]`
Получить информацию об игре и её пакетах донатов.

**Response:**
```json
{
  "game": {
    "id": "clx123...",
    "slug": "world-of-warcraft",
    "name": "World of Warcraft",
    "description": "...",
    "genre": ["MMORPG", "Fantasy"],
    "rating": 4.5,
    "imageUrl": "https://...",
    "isFeatured": true
  },
  "packages": [
    {
      "id": "clx456...",
      "name": "Starter Pack",
      "description": "...",
      "priceRUB": 499,
      "priceUSD": 5.99,
      "priceEUR": 5.49,
      "features": ["500 Premium Currency", "..."],
      "isPopular": false
    }
  ]
}
```

---

## Cart Endpoints

### GET `/api/cart`
Получить содержимое корзины текущего пользователя.

**Auth Required:** Yes

**Response:**
```json
{
  "items": [
    {
      "id": "clx789...",
      "userId": "clx123...",
      "donatePackageId": "clx456...",
      "quantity": 2,
      "donatePackage": {
        "id": "clx456...",
        "name": "Premium Pack",
        "priceRUB": 1499,
        "game": {
          "id": "clx123...",
          "name": "World of Warcraft",
          "imageUrl": "https://..."
        }
      }
    }
  ]
}
```

### POST `/api/cart`
Добавить товар в корзину.

**Auth Required:** Yes

**Request:**
```json
{
  "packageId": "clx456..."
}
```

**Response:**
```json
{
  "item": {
    "id": "clx789...",
    "userId": "clx123...",
    "donatePackageId": "clx456...",
    "quantity": 1
  }
}
```

### PATCH `/api/cart`
Обновить количество товара в корзине.

**Auth Required:** Yes

**Request:**
```json
{
  "itemId": "clx789...",
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true
}
```

### DELETE `/api/cart`
Удалить товар из корзины.

**Auth Required:** Yes

**Request:**
```json
{
  "itemId": "clx789..."
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Orders Endpoints

### GET `/api/orders`
Получить все заказы текущего пользователя.

**Auth Required:** Yes

**Response:**
```json
{
  "orders": [
    {
      "id": "clxabc...",
      "orderNumber": "ORD-123ABC-XYZ789",
      "status": "COMPLETED",
      "totalAmount": 2998,
      "currency": "RUB",
      "createdAt": "2024-01-15T10:30:00Z",
      "orderItems": [
        {
          "id": "clxdef...",
          "quantity": 2,
          "price": 1499,
          "donatePackage": {
            "name": "Premium Pack",
            "game": {
              "name": "World of Warcraft"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Checkout Endpoints

### POST `/api/checkout`
Создать заказ и получить Stripe Payment Intent.

**Auth Required:** Yes

**Request:** (no body required, uses cart items)

**Response:**
```json
{
  "clientSecret": "pi_123abc_secret_456def",
  "orderId": "clxabc...",
  "orderNumber": "ORD-123ABC-XYZ789"
}
```

**Note:** После успешного создания заказа корзина очищается автоматически.

---

## Webhooks

### POST `/api/webhooks/stripe`
Stripe webhook для обработки событий платежей.

**Events:**
- `payment_intent.succeeded` - Платёж успешен
- `payment_intent.payment_failed` - Платёж отклонён

**Headers Required:**
```
stripe-signature: [webhook signature]
```

---

## Error Responses

Все endpoints возвращают ошибки в формате:

```json
{
  "error": "Error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Большинство endpoints требуют аутентификации через NextAuth.js session.

**Session Cookie:** `next-auth.session-token`

Для защищённых endpoints используется middleware в `middleware.ts`.

---

## Rate Limiting

В production рекомендуется настроить rate limiting для API endpoints:

```typescript
// Пример с next-rate-limit
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // максимум 100 запросов
})
```

---

## CORS

API доступен только с того же домена (same-origin policy).

Для разрешения CORS добавьте в `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
      ],
    },
  ]
}
```

---

## Testing

### Пример запроса с curl:

```bash
# Получить игру
curl http://localhost:3000/api/games/world-of-warcraft

# Добавить в корзину (требует cookie)
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"packageId": "clx456..."}' \
  --cookie "next-auth.session-token=..."
```

### Пример с fetch:

```javascript
// Добавить в корзину
const response = await fetch('/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    packageId: 'clx456...'
  })
})

const data = await response.json()
```

---

## Future Endpoints (TODO)

- `GET /api/admin/games` - Список игр для админа
- `POST /api/admin/games` - Создать игру
- `PATCH /api/admin/games/[id]` - Обновить игру
- `DELETE /api/admin/games/[id]` - Удалить игру
- `GET /api/admin/orders` - Все заказы
- `PATCH /api/admin/orders/[id]` - Обновить статус заказа
- `GET /api/reviews/[gameId]` - Отзывы на игру
- `POST /api/reviews` - Создать отзыв
- `GET /api/stats` - Статистика продаж

---

For more information, see the [README.md](./README.md) file.
