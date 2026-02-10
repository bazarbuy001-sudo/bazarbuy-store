# Bazar Buy — B2B E-commerce Platform

🚀 Полнофункциональная B2B платформа для оптовой торговли тканями и фурнитурой.

## Структура проекта

```
bazar-buy/
├── backend/          # Express.js + TypeScript + PostgreSQL
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── types/
│   │   └── server.ts
│   ├── migrations/   # PostgreSQL миграции
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/         # React + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/             # Документация
├── migrate.sh        # Script для миграций БД
└── README.md
```

## Требования

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## Быстрый старт

### 1. Backend

```bash
cd backend
npm install
npm run build
npm run dev
```

Backend запустится на `http://localhost:3001`

### 2. Database

```bash
# Убедитесь, что PostgreSQL запущен и создайте БД:
createdb bazarbuy_db

# Запустите миграции:
./migrate.sh
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend запустится на `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` — Вход (email/password)
- `POST /api/v1/auth/logout` — Выход
- `GET /api/v1/auth/me` — Текущий пользователь

### Catalog
- `GET /api/v1/catalog/categories` — Список категорий
- `GET /api/v1/catalog/products` — Список товаров
- `GET /api/v1/catalog/search` — Поиск товаров

### Orders
- `POST /api/v1/orders` — Создать заказ
- `GET /api/v1/orders/:public_id` — Получить заказ

## Развертывание

- **Frontend:** Vercel
- **Backend:** Render или Heroku
- **Database:** PostgreSQL (Render, AWS RDS)

## Разработка

### Stack
- **Backend:** Express.js, TypeScript, PostgreSQL, JWT
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Architecture:** B2B model (clients + admin_users), Saga pattern

### Тестирование

```bash
# Backend тесты
cd backend
npm test

# Frontend тесты
cd frontend
npm test
```

## Лицензия

MIT
