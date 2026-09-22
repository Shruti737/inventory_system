# Simple Inventory & Order API

A simple, clean REST API for managing an inventory of products and placing orders. Built with **Node.js**, **Express**, **Sequelize** and **PostgreSQL (Neon)**, secured with **JWT** authentication.

This project was built as a backend developer technical assignment and intentionally avoids over-engineering: the flow is simply `Routes → Middleware → Controllers → Models/Database`.

---

## 1. Project Overview

The API allows users to register, log in, and manage products. Authenticated users can place orders containing multiple products. Creating an order validates stock, calculates the total on the server, reduces stock, and stores everything inside a single database transaction.

---

## 2. Features

- User registration and login with hashed passwords (`bcryptjs`)
- JWT-based authentication for protected routes
- Full product CRUD
- Product search, category filter, availability filter and pagination
- Order creation with server-side total calculation
- Stock validation and automatic stock reduction
- Database transaction for safe order creation
- Centralized validation (`express-validator`) and error handling
- Users can only access their own orders
- Deployable to Render, using Neon PostgreSQL

---

## 3. Tech Stack

| Technology | Purpose |
| --- | --- |
| Node.js | Runtime |
| Express.js | Web framework |
| PostgreSQL (Neon) | Database |
| Sequelize | ORM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| dotenv | Environment variables |

---

## 4. Project Structure

```text
inventory-order-api/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── index.js          # associations
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── productValidator.js
│   │   └── orderValidator.js
│   │
│   └── app.js
│
├── postman/
│   └── inventory-api.postman_collection.json
├── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Database Design

**users**

| Column | Type | Notes |
| --- | --- | --- |
| id | integer | PK, auto increment |
| name | string | required |
| email | string | required, unique |
| password | string | required, hashed with bcryptjs |
| createdAt / updatedAt | timestamp | |

**products**

| Column | Type | Notes |
| --- | --- | --- |
| id | integer | PK |
| name | string | required |
| description | text | optional |
| price | decimal(10,2) | required, positive |
| stockQuantity | integer | required, non-negative |
| category | string | required |
| createdAt / updatedAt | timestamp | |

**orders**

| Column | Type | Notes |
| --- | --- | --- |
| id | integer | PK |
| userId | integer | FK → users.id |
| totalAmount | decimal(10,2) | calculated on server |
| status | enum | `pending`, `confirmed`, `cancelled` (default `pending`) |
| createdAt / updatedAt | timestamp | |

**order_items**

| Column | Type | Notes |
| --- | --- | --- |
| id | integer | PK |
| orderId | integer | FK → orders.id |
| productId | integer | FK → products.id |
| quantity | integer | positive |
| price | decimal(10,2) | product price at time of ordering |
| createdAt / updatedAt | timestamp | |

### Relationships

```text
User  1 → many Orders
Order 1 → many OrderItems
Product 1 → many OrderItems
```

---

## 6. Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

> `.env` is git-ignored. Never commit real credentials or secrets.

---

## 7. Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file from the example
cp .env.example .env
# then fill in DATABASE_URL and JWT_SECRET

# 3. Start the server
npm run dev     # with nodemon
# or
npm start
```

The server runs on `http://localhost:5000` by default.

---

## 8. How to Run the Application

```bash
npm install
npm start
```

On startup the app connects to the database and runs `sequelize.sync()` to create the tables.

Health check:

```http
GET /
```

```json
{ "success": true, "message": "Simple Inventory & Order API is running." }
```

---

## 9. API List

Base path: `/api`

### Authentication

| Method | Endpoint | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |

### Products

| Method | Endpoint | Auth |
| --- | --- | --- |
| POST | `/api/products` | No |
| GET | `/api/products` | No |
| GET | `/api/products/:id` | No |
| PATCH | `/api/products/:id` | No |
| DELETE | `/api/products/:id` | No |

### Orders

| Method | Endpoint | Auth |
| --- | --- | --- |
| POST | `/api/orders` | Yes |
| GET | `/api/orders` | Yes |
| GET | `/api/orders/:id` | Yes |

---

## 10. Authentication Instructions

1. Register or log in to receive a JWT.
2. Send the token on protected requests:

```http
Authorization: Bearer <token>
```

Protected routes return `401` if the token is missing, invalid, or expired.

---

## 11. Example API Requests

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Shruti",
  "email": "shruti@example.com",
  "password": "Password@123"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { "id": 1, "name": "Shruti", "email": "shruti@example.com", "createdAt": "...", "updatedAt": "..." },
    "token": "<jwt>"
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "shruti@example.com",
  "password": "Password@123"
}
```

### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Apple smartphone",
  "price": 70000,
  "stockQuantity": 10,
  "category": "electronics"
}
```

### Search / Filter / Paginate Products

```http
GET /api/products?search=phone&category=electronics&inStock=true&page=1&limit=10
```

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

### Create Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

---

## 12. Order Creation Flow

1. Authenticate the user via JWT middleware.
2. Validate the request body (`items` array, `productId`, `quantity`).
3. Start a database transaction.
4. Load the requested products.
5. Verify each product exists.
6. Verify stock availability for each item.
7. Calculate the total on the server.
8. Create the `Order`.
9. Create the `OrderItems` (storing the price at purchase time).
10. Reduce the stock for each product.
11. Commit. If anything fails, roll back.

---

## 13. Stock Handling Explanation

- Each order item checks `product.stockQuantity >= quantity`.
- If any item fails, the whole order is rejected and no stock is changed.
- On success, stock is reduced by the ordered quantity.
- Stock can never become negative because orders that would exceed stock are rejected.

```text
Stock = 10, Ordered = 3  →  New stock = 7
```

---

## 14. Transaction Explanation

Order creation wraps all database changes in a single Sequelize transaction:

```javascript
const transaction = await sequelize.transaction();
// ... check products, check stock, calculate total,
// create order, create items, reduce stock ...
await transaction.commit();
```

If any step throws, the transaction is rolled back so the database is never left in a partially updated state.

---

## 15. Postman Collection Instructions

1. Import `postman/inventory-api.postman_collection.json` into Postman.
2. Set the `baseUrl` collection variable to your local or deployed URL.
3. Run **Auth → Login** (or **Register**). The test script automatically saves the JWT into the `token` collection variable.
4. Protected requests use `Authorization: Bearer {{token}}` automatically.
5. Use `productId` and `orderId` variables to test specific resources.

---

## 16. Deployment Instructions for Render

1. Push the repository to GitHub.
2. On Render, create a **Web Service** and connect the repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `DATABASE_URL` (Neon connection string)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT` is provided by Render automatically (the app uses `process.env.PORT || 5000`)
6. Deploy. The server listens on the provided `PORT`.

---

## 17. Neon PostgreSQL Configuration

1. Create a project and database on [Neon](https://neon.tech).
2. Copy the connection string (it looks like `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
3. Set it as `DATABASE_URL` in `.env` (local) and in Render's environment variables (production).
4. SSL is enabled in `src/config/database.js` (required by Neon).

---

## 18. Verification Checklist

```text
[x] Register
[x] Login
[x] JWT authentication
[x] Secure password hashing
[x] Create product
[x] Get products
[x] Get product by ID
[x] Update product
[x] Delete product
[x] Search products
[x] Filter by category
[x] Filter by availability
[x] Pagination
[x] Create order
[x] Get user's orders
[x] Get order by ID
[x] Product existence validation
[x] Stock availability validation
[x] Correct stock reduction
[x] Order total calculation
[x] Order status
[x] Database transaction
[x] Request validation
[x] Proper HTTP status codes
[x] Error handling
[x] Environment variables
[x] Basic security
[x] Postman collection
[x] Render deployment compatible
[x] Neon PostgreSQL compatible