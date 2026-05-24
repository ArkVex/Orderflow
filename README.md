# OrderFlow - Restaurant Order Management API

A scalable, production-ready backend API for restaurant order management, online ordering, real-time delivery tracking, and restaurant dashboard analytics. Built with clean layered architecture.

## Architecture

```
src/
├── config/              # Environment, database, WebSocket configuration
├── middleware/           # Auth, validation, error handling, rate limiting
├── shared/
│   ├── types/           # Shared TypeScript interfaces
│   └── utils/           # ApiError, response helpers, pagination
├── modules/
│   ├── auth/            # JWT authentication & role-based access
│   ├── restaurant/      # Restaurant CRUD & management
│   ├── menu/            # Menu categories & items management
│   ├── order/           # Order lifecycle with state machine
│   └── delivery/        # Delivery tracking & driver management
├── app.ts               # Express app setup & route mounting
└── server.ts            # HTTP server bootstrap with Socket.IO
```

### Design Patterns

- **Layered Architecture**: Controller → Service → Repository → Prisma ORM
- **State Machine**: Order status transitions with role-based guards (`order.state-machine.ts`)
- **Repository Pattern**: Data access abstracted behind repository classes
- **Singleton Database**: Single Prisma client instance via Database class
- **Centralized Error Handling**: Custom `ApiError` class with operational error distinction
- **Input Validation**: Zod schemas at the controller layer
- **Role-Based Access Control**: JWT + middleware-based authorization per route

## Tech Stack

| Layer          | Technology           |
|----------------|----------------------|
| Runtime        | Node.js + TypeScript |
| Framework      | Express v5           |
| ORM            | Prisma               |
| Database       | PostgreSQL           |
| Auth           | JWT + bcrypt         |
| Real-time      | Socket.IO            |
| Validation     | Zod                  |
| Rate Limiting  | express-rate-limit   |
| Security       | Helmet + CORS        |

## Database Schema

```
User ──┬── Restaurant ── MenuCategory ── MenuItem
       ├── Order ── OrderItem ── MenuItem
       ├── Address
       └── Driver ── Delivery ── DeliveryLocationLog
```

**Key models**: User (multi-role), Restaurant, MenuCategory, MenuItem, Order (with state machine), OrderItem, Delivery, Driver, DeliveryLocationLog, Address

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint    | Auth | Description           |
|--------|-------------|------|-----------------------|
| POST   | /register   | No   | Register new user     |
| POST   | /login      | No   | Login & get JWT token |
| GET    | /profile    | Yes  | Get current user      |

### Restaurants (`/api/v1/restaurants`)
| Method | Endpoint | Auth  | Role            | Description         |
|--------|----------|-------|-----------------|---------------------|
| GET    | /        | No    | -               | List restaurants    |
| GET    | /:id     | No    | -               | Get restaurant      |
| POST   | /        | Yes   | RESTAURANT_OWNER| Create restaurant   |
| PATCH  | /:id     | Yes   | RESTAURANT_OWNER| Update restaurant   |
| DELETE | /:id     | Yes   | RESTAURANT_OWNER| Delete restaurant   |

### Menu (`/api/v1/menu`)
| Method | Endpoint                              | Auth | Role            | Description         |
|--------|---------------------------------------|------|-----------------|---------------------|
| GET    | /restaurant/:restaurantId/categories  | No   | -               | Get menu            |
| POST   | /restaurant/:restaurantId/categories  | Yes  | RESTAURANT_OWNER| Create category     |
| PATCH  | /categories/:categoryId               | Yes  | RESTAURANT_OWNER| Update category     |
| DELETE | /categories/:categoryId               | Yes  | RESTAURANT_OWNER| Delete category     |
| POST   | /categories/:categoryId/items         | Yes  | RESTAURANT_OWNER| Create menu item    |
| PATCH  | /items/:itemId                        | Yes  | RESTAURANT_OWNER| Update menu item    |
| DELETE | /items/:itemId                        | Yes  | RESTAURANT_OWNER| Delete menu item    |

### Orders (`/api/v1/orders`)
| Method | Endpoint          | Auth | Role            | Description              |
|--------|-------------------|------|-----------------|--------------------------|
| POST   | /                 | Yes  | CUSTOMER        | Place order              |
| GET    | /my-orders        | Yes  | CUSTOMER        | Get my order history     |
| GET    | /restaurant       | Yes  | RESTAURANT_OWNER| Get restaurant orders    |
| GET    | /restaurant/stats | Yes  | RESTAURANT_OWNER| Get revenue/order stats  |
| GET    | /:id              | Yes  | Any             | Get order details        |
| PATCH  | /:id/status       | Yes  | Role-based*     | Update order status      |

**Order State Machine:**
```
PLACED → CONFIRMED → PREPARING → READY → PICKED_UP → DELIVERED
                                                        ↗
Any non-terminal state ─────────→ CANCELLED
```

*Status transitions are role-guarded: restaurant owners confirm/prepare/ready, drivers pick up/deliver, customers/owners can cancel.

### Deliveries (`/api/v1/deliveries`)
| Method | Endpoint                  | Auth | Role            | Description              |
|--------|---------------------------|------|-----------------|--------------------------|
| POST   | /drivers/register         | Yes  | DRIVER          | Register as driver       |
| GET    | /drivers/my-deliveries    | Yes  | DRIVER          | Get active deliveries    |
| GET    | /drivers/available        | Yes  | RESTAURANT_OWNER| List available drivers   |
| POST   | /order/:orderId           | Yes  | RESTAURANT_OWNER| Create delivery          |
| GET    | /order/:orderId           | Yes  | Any             | Get delivery by order    |
| GET    | /:id                      | Yes  | Any             | Get delivery details     |
| PATCH  | /:id/assign               | Yes  | RESTAURANT_OWNER| Assign driver            |
| PATCH  | /:id/status               | Yes  | DRIVER          | Update delivery status   |
| PATCH  | /:id/location             | Yes  | DRIVER          | Update driver location   |

## WebSocket Events

Connect with JWT token:
```js
const socket = io("http://localhost:3000", { auth: { token: "your-jwt" } });
```

| Event (Client → Server)  | Description                    |
|---------------------------|--------------------------------|
| `track:order`             | Subscribe to order updates     |
| `track:delivery`          | Subscribe to delivery updates  |

| Event (Server → Client)       | Description                     |
|--------------------------------|---------------------------------|
| `order:new`                    | New order for restaurant owner  |
| `order:status-updated`        | Order status changed            |
| `delivery:location-updated`   | Driver location update          |
| `delivery:status-updated`     | Delivery status changed         |
| `delivery:new-available`      | New delivery for driver pool    |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/next_order_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

## Scalability Considerations

- **Modular architecture**: Each module is self-contained and can be extracted into a microservice
- **Repository pattern**: Database layer is swappable without touching business logic
- **Pagination**: All list endpoints support cursor/offset pagination
- **Rate limiting**: API and auth-specific rate limits
- **Database indexing**: Strategic indexes on frequently queried columns
- **Connection pooling**: Prisma manages PostgreSQL connection pool
- **WebSocket rooms**: Targeted event broadcasting to reduce unnecessary traffic
- **Stateless auth**: JWT-based, horizontally scalable across instances
