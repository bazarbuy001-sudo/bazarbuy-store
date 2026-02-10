# 🚀 Getting Started — Bazar Buy

Полное руководство для локального запуска и тестирования.

## 📋 Требования

- macOS (или Linux с пакетным менеджером)
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## 🛠️ Установка (один раз)

### 1. PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb bazarbuy_db
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql-15
sudo systemctl start postgresql
createdb -U postgres bazarbuy_db
```

### 2. Backend

```bash
cd backend
npm install
npm run build
```

### 3. Frontend

```bash
cd frontend
npm install
```

## 🎮 Запуск разработки

**Терминал 1 (Backend):**
```bash
cd backend
npm run dev
# Outputs: Backend running on port 3001
```

**Терминал 2 (Frontend):**
```bash
cd frontend
npm run dev
# Outputs: Ready at http://localhost:3000
```

## 📖 Первый запуск

### 1. Инициализировать БД

```bash
# Запустить миграции (из корневой папки)
./migrate.sh

# Или вручную:
cd backend/migrations
psql -U $(whoami) -d bazarbuy_db -f 001_create_core_tables.sql
psql -U $(whoami) -d bazarbuy_db -f 002_create_catalog_tables.sql
psql -U $(whoami) -d bazarbuy_db -f 003_insert_test_data.sql
```

### 2. Проверить API

```bash
bash test-api.sh
# Should show ✅ for all tests
```

### 3. Открыть в браузере

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health

## 🧪 Тестирование

### Login

```bash
# Email: admin@bazarbuy.ru
# Password: password
# Expected: Redirect to /catalog
```

### Endpoints

```bash
# Categories
curl http://localhost:3001/api/v1/catalog/categories | jq

# Products
curl http://localhost:3001/api/v1/catalog/products | jq

# Auth
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bazarbuy.ru","password":"password"}' | jq
```

## 📚 Структура проекта

```
bazar-buy/
├── backend/              # Express.js API
│   ├── src/
│   ├── migrations/       # PostgreSQL миграции
│   ├── dist/            # Compiled TypeScript
│   └── package.json
├── frontend/             # React приложение
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/                # Документация
├── test-api.sh          # API health check
├── migrate.sh           # Database migration script
└── README.md
```

## 🔧 Полезные команды

### Backend

```bash
npm run dev          # Start dev server (ts-node)
npm run build        # Compile TypeScript
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint TypeScript
```

### Database

```bash
# Connect to DB
psql -U bazarbuy bazarbuy_db

# Run query
psql -U bazarbuy -d bazarbuy_db -c "SELECT * FROM products;"

# Backup
pg_dump -U bazarbuy bazarbuy_db > backup.sql

# Restore
psql -U bazarbuy bazarbuy_db < backup.sql
```

## 🐛 Troubleshooting

### PostgreSQL connection refused
```bash
# Check if PostgreSQL is running
brew services list
# Start if stopped
brew services start postgresql@15
```

### Port already in use
```bash
# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### ECONNREFUSED error
```bash
# Make sure backend is running before opening frontend
# Backend: npm run dev (first)
# Frontend: npm run dev (second, in another terminal)
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📱 API Documentation

Full API docs available in `/docs/API.md`

**Key Endpoints:**
- `POST /api/v1/auth/login` — Authenticate
- `GET /api/v1/catalog/categories` — List categories
- `GET /api/v1/catalog/products` — List products
- `POST /api/v1/orders` — Create order
- `GET /api/v1/orders/:publicId` — Get order details

## 🚀 Next Steps

1. [ ] Integrate with payment gateway
2. [ ] Add CDEK shipping API
3. [ ] Implement order management dashboard
4. [ ] Set up CI/CD with GitHub Actions
5. [ ] Deploy to Vercel (frontend) + Render (backend)

## 📞 Support

For issues, check:
- Backend logs: `backend/logs/`
- Frontend console: Browser DevTools
- Database logs: `postgresql` logs via `brew logs`

---

Happy coding! 🎉
