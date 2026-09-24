# Inventory & Order API

A simple REST API for managing products and creating orders, built as a Backend Developer Technical Assignment.

## 🚀 Live API

The application is deployed on Render and can be tested directly:

**Base URL:** `https://inventory-system-69rg.onrender.com`

You can test the APIs using the deployed URL without running the project locally.

## 🧪 Quick Testing with Postman

A ready-to-use Postman collection is included in the repository:

```text
postman/inventory-api.postman_collection.json
```        

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL (Neon)**
* **Sequelize**
* **JWT**
* **bcryptjs**
* **express-validator**
* **Postman**

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Password hashing using bcryptjs

### Products

* Create, read, update and delete products
* Search by product name
* Filter by category
* Filter by availability
* Pagination

### Orders

* Create orders for authenticated users
* View logged-in user's orders
* View order by ID
* Validate product existence and stock
* Calculate total amount on the server
* Reduce stock after successful order
* Database transaction for order creation

## Project Structure

```text
inventory-order-api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── productValidator.js
│   │   └── orderValidator.js
│   └── app.js
├── postman/
│   └── inventory-api.postman_collection.json
├── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Add:

```env
PORT=5000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Start the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server:

```text
http://localhost:5000
```

## API Endpoints

### Authentication

| Method | Endpoint             | Auth |
| ------ | -------------------- | ---- |
| POST   | `/api/auth/register` | No   |
| POST   | `/api/auth/login`    | No   |

### Products

| Method | Endpoint            | Auth |
| ------ | ------------------- | ---- |
| POST   | `/api/products`     | No   |
| GET    | `/api/products`     | No   |
| GET    | `/api/products/:id` | No   |
| PATCH  | `/api/products/:id` | No   |
| DELETE | `/api/products/:id` | No   |

### Orders

| Method | Endpoint          | Auth |
| ------ | ----------------- | ---- |
| POST   | `/api/orders`     | Yes  |
| GET    | `/api/orders`     | Yes  |
| GET    | `/api/orders/:id` | Yes  |

## Product Search & Filters

Example:

```http
GET /api/products?search=phone&category=electronics&inStock=true&page=1&limit=10
```

Supports:

* Search
* Category filter
* Availability filter
* Pagination

## Order Creation

Example:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

The server validates the product, checks stock, calculates the total, creates the order, and reduces stock inside a database transaction.

If any operation fails, the transaction is rolled back.


## Validation & Error Handling

The API includes:

* Request validation using `express-validator`
* Centralized error handling
* Proper HTTP status codes
* JWT authentication
* Secure password hashing
* Environment-based configuration

## Postman

Postman collection:

```text
postman/inventory-api.postman_collection.json
```

Import the collection into Postman and set the `baseUrl` variable:

```text
http://localhost:5000/api
```

Recommended flow:

```text
Register → Login → Create Product → Get Products → Create Order → Get Orders
```

## AI Usage

### ChatGPT

Used for:

* Understanding requirements
* Debugging
* API/database design discussions
* Documentation

### GitHub Copilot

Used for:

* Code suggestions
* Boilerplate and repetitive code
* Development assistance

All generated code was reviewed, tested, and understood before submission.

## Security

* Passwords are hashed using bcryptjs
* JWT is used for protected routes
* Secrets are stored in environment variables
* `.env` is excluded from Git
* Users can only access their own orders
* Order totals are calculated server-side

------------------------------------------------------------------------------------------------------------------------------------------------

**Question:**
Imagine two users try to buy the last available item at the same time. How would you make sure the stock does not become negative or both orders get confirmed?

**Answer:**
I would use a **database transaction with row-level locking or an atomic stock update**.

The stock check and stock reduction should happen atomically. For example:

```sql
UPDATE products
SET "stockQuantity" = "stockQuantity" - 1
WHERE id = 1
  AND "stockQuantity" >= 1;
```

Then I would check the number of affected rows:

* **1 row updated:** Stock was available, so the order can proceed.
* **0 rows updated:** The product is out of stock, so the order is rejected.

This ensures that when two users try to purchase the last item at the same time, only one request can successfully reduce the stock. Therefore, stock cannot become negative and both orders cannot be confirmed.

In the current implementation, order creation is wrapped in a **database transaction**, so if any step fails, the complete order operation is rolled back.


---

**Author:** Shruti Kushwaha
**Backend Developer | Node.js | Express.js | PostgreSQL**
