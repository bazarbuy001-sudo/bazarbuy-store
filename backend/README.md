# Bazar Buy Backend

B2B E-commerce Backend for Fabrics & Furnishings

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **API:** RESTful with `/api/v1` prefix (D-006)

## Architecture

Based on: `/Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/DATA_DICTIONARY.md`

### Core Entities (8)
1. `clients` — B2B customers (D-001)
2. `admin_users` — System administrators (D-001)
3. `orders` — Customer orders
4. `order_items` — Order line items (meters-based, D-004)
5. `saga_orchestration` — Order sagas (D-002)
6. `saga_steps` — Saga step tracking (D-002)
7. `idempotent_requests` — Idempotency handling
8. `sessions` — Admin sessions

### Key Decisions
- **D-001:** B2B model with `clients` + `admin_users` (no generic `users`)
- **D-002:** Enterprise-grade Saga pattern with `saga_orchestration` + `saga_steps`
- **D-003:** Status `processing` (not `in_progress`)
- **D-004:** Meters as `DECIMAL` for fabric orders
- **D-005:** PublicID format: `CL-`, `ADM-`, `ORD-`
- **D-006:** API prefix `/api/v1`

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Migrations
```bash
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` — Login admin
- `POST /api/v1/auth/logout` — Logout admin

### Catalog
- `GET /api/v1/catalog/categories` — List categories
- `GET /api/v1/catalog/products` — List products

### Orders
- `POST /api/v1/orders` — Create order
- `GET /api/v1/orders/:id` — Get order details
- `PUT /api/v1/orders/:id/status` — Update order status

### Clients
- `GET /api/v1/clients/:id` — Get client info
- `PUT /api/v1/clients/:id` — Update client

### Admin Panel
- `GET /api/v1/admin/dashboard` — Dashboard stats
- `GET /api/v1/admin/orders` — Manage orders
- `GET /api/v1/admin/clients` — Manage clients

## Database Migrations

All migrations are in `/migrations`:
- `001_create_core_tables.sql` — Core 8 entities
- `002_create_catalog_tables.sql` — Catalog structure

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run compiled code
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Documentation

- [DATA_DICTIONARY](../../../Desktop/ТЗ%20для%20сайта%20Bazar%20Buy/CANONICAL/DATA_DICTIONARY.md)
- [STATE_MACHINES](../../../Desktop/ТЗ%20для%20сайта%20Bazar%20Buy/CANONICAL/STATE_MACHINES.md)
- [DECISIONS](../../../Desktop/ТЗ%20для%20сайта%20Bazar%20Buy/CANONICAL/DECISIONS.md)

## Notes

- All schemas follow CANONICAL documentation (LOCKED)
- PublicID generation follows D-005 format
- Saga pattern handles complex order workflows
- Idempotency prevents duplicate operations
