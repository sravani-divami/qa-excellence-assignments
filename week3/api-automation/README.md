# ShopEasy API — QA Assessment Environment

A fully working REST API for API Testing assessments. Includes Swagger UI, 12 endpoints across 5 modules.

## Quick Start (Docker)

```bash
# 1. Make sure Docker Desktop is running on your Mac
# 2. From this folder, run:
docker compose up

# 3. Open in browser:
#    API:        http://localhost:3000
#    Swagger UI: http://localhost:8080
#    Health:     http://localhost:3000/health
```

## Default Credentials (for login)
| Email | Password |
|-------|----------|
| admin@shopeasy.com | password123 |

## API Endpoints (12 total)

| Method | Endpoint | Auth | Module |
|--------|----------|------|--------|
| POST | /auth/login | No | Auth |
| POST | /auth/register | No | Auth |
| GET | /products | No | Products |
| GET | /products/:id | No | Products |
| POST | /cart/items | Yes | Cart |
| GET | /cart | Yes | Cart |
| DELETE | /cart/items/:itemId | Yes | Cart |
| POST | /orders | Yes | Orders |
| GET | /orders/:orderId | Yes | Orders |
| DELETE | /orders/:orderId/cancel | Yes | Orders |
| POST | /payments | Yes | Payments |
| GET | /payments/:paymentId | Yes | Payments |

## Happy Path Flow
1. `POST /auth/login` → get token
2. `GET /products` → pick productId
3. `POST /cart/items` → add to cart
4. `GET /cart` → verify cart
5. `POST /orders` → place order → get orderId
6. `POST /payments` → pay for order → get paymentId
7. `GET /payments/:paymentId` → verify payment

## Stop the server
```bash
docker compose down
```
