# 💸 UPIConnect API

UPIConnect is a RESTful API that simulates a UPI (Unified Payments Interface) system. Built with Node.js and Express, this backend handles user authentication, balance checks, payments, payment requests, notifications, and transaction history.

---

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/auth/logout` | User logout | ✅ |
| `GET` | `/api/auth/current-user` | Get current user details | ✅ |
| `GET` | `/api/balance` | Check account balance | ✅ |
| `POST` | `/api/pay` | Make a payment | ✅ |
| `GET` | `/api/transactions` | View transaction history | ✅ |
| `GET` | `/api/transactions/:count` | View transaction history of specific count | ✅ |
| `GET` | `/api/convert` | Currency conversion | ✅ |
| `POST` | `/api/requests` | Request payment from another user | ✅ |
| `POST` | `/api/requests/accept/:id` | Accept payment request | ✅ |
| `POST` | `/api/requests/reject/:id` | reject payment request | ✅ |
| `GET` | `/api/notifications` | View notifications | ✅ |
| `GET` | `/api/notifications/seen` | marks all notifications as seen | ✅ |

---

## 🔐 Authentication

### Signup
```http
POST /api/auth/signup
```
**Request Body:**
```json
{
  "email": "user1@gmail.com",
  "phone": "1234567890",
  "username": "mruser1",
  "password": "12345678"
}
```

### Login
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "username": "user2",
  "password": "12345678"
}
```

### Logout
```http
POST /api/auth/logout
```
**Headers:**
```
Authorization: Bearer <token>
```

---

## 💰 Payment Features

### Check Balance
```http
GET /api/balance
```
**Headers:**
```
Authorization: Bearer <token>
```

### Make Payment
```http
POST /api/pay
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "amount": 15,
  "note": "dinner",
  "payee": "user2"
}
```

### Transaction History
```http
GET /api/transactions?count=100
```
**Query Parameters:**
- `count`: Number of transactions to return (default: all)

---

## 🔄 Currency Conversion
```http
GET /api/convert?amount=100&rate=1.2
```
**Query Parameters:**
- `amount`: Amount to convert (required)
- `rate`: Conversion rate (required)

---

## 🔔 Notifications
```http
GET /api/notifications
```
**Headers:**
```
Authorization: Bearer <token>
```

---

## 🧰 Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcrypt for password hashing

---

## 📦 Installation

```bash
git clone https://github.com/your-username/upiconnect.git
cd upiconnect
npm install
npm run dev
```

---

## 📝 License

MIT License - Free for educational and personal use.
