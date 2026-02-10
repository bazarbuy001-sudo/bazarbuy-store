# Сценарии тестирования Bazar Buy

## 🔧 Подготовка
- Backend: `http://localhost:3001` ✅
- Frontend: `http://localhost:3000` ✅
- PostgreSQL: bazarbuy_db ✅

## 📝 Тестовые учетные данные

### Admin
- Email: `admin@bazarbuy.ru`
- Password: `password`
- Role: `admin`

### Manager
- Email: `manager@bazarbuy.ru`
- Password: `password`
- Role: `manager`

### Client 1
- Email: `client1@example.com`
- Company: ОАО Ткани Мир
- INN: 123456789012

### Client 2
- Email: `client2@example.com`
- Company: ООО Розница
- INN: 210987654321

## 🧪 Тесты API

### 1. Health Check ✅
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Authentication ✅
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bazarbuy.ru","password":"password"}'
# Expected: JWT token
```

### 3. Catalog Categories ✅
```bash
curl http://localhost:3001/api/v1/catalog/categories
# Expected: List of categories (Ткани, Хлопок, Полиэстер)
```

### 4. Products ✅
```bash
curl http://localhost:3001/api/v1/catalog/products
# Expected: 5 products (Хлопок Премиум, Полиэстер, etc.)
```

## 🖥️ UI тесты

### 1. Login Page
- [x] Form displays
- [x] Can enter email/password
- [x] Submit sends to backend
- [ ] JWT token stored in localStorage

### 2. Catalog Page
- [ ] Products load from API
- [ ] Grid layout displays all 5 items
- [ ] Add to cart button visible

### 3. Cart Page
- [ ] Empty state shows "корзина пуста"
- [ ] Can add items to cart
- [ ] Total calculation works

### 4. Orders Page
- [ ] Shows user orders
- [ ] Order status visible
- [ ] Order date formatted

## 📊 Фиксутры в БД

### Таблицы созданы ✅
- clients (2 записи)
- admin_users (2 записи)
- orders (1 запись)
- order_items (1 запись)
- categories (3 записи)
- products (5 записей)
- saga_orchestration (пусто)
- saga_steps (пусто)
- sessions (пусто)
- idempotent_requests (пусто)

## 🚀 Развертывание

- [ ] GitHub Actions CI/CD
- [ ] Vercel frontend deploy
- [ ] Render backend deploy
- [ ] Production database migration
- [ ] SSL certificates
- [ ] CORS configuration
- [ ] Environment variables

## 📌 Известные проблемы

Нет известных проблем. Все endpoints работают ✅

## 📍 Следующие шаги

1. Финализировать frontend компоненты (Cart logic)
2. Интегрировать CDEK API
3. Интегрировать платежный шлюз
4. Настроить email уведомления
5. Deploy на продакшен
