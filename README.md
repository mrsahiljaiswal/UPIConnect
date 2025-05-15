# UPI Connect API

A robust and secure RESTful mock API for handling UPI payments, user authentication, expense tracking, and financial learning features.

## 🚀 Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication
  - Secure password hashing

- **Payment Processing**
  - UPI payment integration
  - Payment request handling
  - Transaction history

- **Expense Management**
  - Track expenses
  - Categorize transactions
  - Generate expense reports

- **Financial Learning**
  - Educational content
  - Financial tips and insights
  - Learning resources

- **Notification System**
  - Real-time notifications
  - Payment alerts
  - System updates

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- Bcrypt for password hashing
- CORS enabled
- Environment variables support

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd UPI-API
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

## 📋 API Endpoints Summary
| Endpoint                              | Method | Description                         |
| ------------------------------------- | ------ | ----------------------------------- |
| `/api/auth/signup`                    | POST   | Register a new user                 |
| `/api/auth/login`                     | POST   | Log in an existing user             |
| `/api/auth/logout`                    | POST   | Log out the current user            |
| `/api/auth/current-user`              | GET    | Get the profile of the current user |
| `/api/balance`                        | POST   | Get the balance of the current user |
| `/api/pay`                            | POST   | Create a payment                    |
| `/api/transactions`                   | GET    | Get payment transaction history     |
| `/api/requests`                       | GET    | Get pending payment requests        |
| `/api/requests`                       | POST   | Create a payment request            |
| `/api/requests/accept/:id`            | POST   | Accept a payment request            |
| `/api/requests/reject/:id`            | POST   | Reject a payment request            |
| `/api/notifications`                  | GET    | Get notifications                   |
| `/api/notifications/mark-all-as-read` | PATCH  | Mark all notifications as seen      |
| `/api/notifications/mark-as-read/:id` | PATCH  | Mark a notification as seen by ID   |
| `/api/notifications/dismiss/:id`      | DELETE | Dismiss a notification by ID        |


## 📚 Detailed API Documentation

### Authentication Endpoints

#### - Register User
```http
POST /api/auth/signup
```
**Request Body:**
```json
{
  "email": "sahil@gmail.com",
  "phone": "1234567890",
  "username": "mrsahil",
  "password": "12345678"
}
```
**Response:**
```json
{
    "status": "success",
    "message": "User account created successfully.",
    "data": {
        "userId": "68234a177329f739edde8dd4",
        "username": "mrsahil",
        "email": "sahil@gmail.com"
    },
    "timestamp": "2025-05-13T13:33:11.449Z"
}
```

#### - Login
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "username": "mrsahil",
  "password": "12345678"
}

```
**Response:**
```json
{
    "status": "success",
    "message": "User logged in successfully.",
    "data": {
        "userId": "68171a83fb6428ea8504aaf7",
        "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTcxYTgzZmI2NDI4ZWE4NTA0YWFmNyIsInVzZXJuYW1lIjoibXJzYWhpbGphaXN3YWwiLCJpYXQiOjE3NDcxNDQzMjAsImV4cCI6MTc0NzE0NzkyMH0.3dCv1mtORQ9YtXeVk8ajE0MV1GBxynuVjwPC2PPYOqA",
        "expiresIn": 3600
    },
    "timestamp": "2025-05-13T13:52:00.196Z"
}
```

#### - Logout
```http
POST /api/auth/logout
```
**Response:**
```json
{
    "status": "success",
    "message": "User logged out successfully.",
    "timestamp": "2025-05-13T14:38:50.152Z"
}
```



#### - Get Profile
```http
GET /api/auth/current-user
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
    "status": "success",
    "message": "Current user fetched successfully.",
    "data": {
        "username": "mrsahil",
        "email": "sahil@gmail.com",
        "finalBalance": 7636
    },
    "timestamp": "2025-05-13T14:40:47.376Z"
}
```

### Payment Endpoints

#### - Get Balance
```http
POST /api/balance
```
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
    "status": "success",
    "message": "Balance fetched successfully.",
    "data": {
        "username": "mrsahil",
        "email": "sahil@gmail.com",
        "finalBalance": 7621
    },
    "timestamp": "2025-05-13T14:48:07.413Z"
}
```


#### - Create Payment
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
  "note": "meal",
  "payee": "mruser" 
}
```
**Response:**
```json
{
    "status": "success",
    "message": "Payment of ₹15 to 'mruser' completed.",
    "data": {
        "transactionId": "68235a8c7329f739edde8e88",
        "amount": 15,
        "note": "meal",
        "payee": "mruser",
        "balanceAfterTransaction": 7621,
        "transactionDate": "2025-05-13T14:43:24.408Z"
    },
    "timestamp": "2025-05-13T14:43:24.558Z"
}
```

#### - Get Payment History
```http
GET /api/transactions
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
    "status": "success",
    "message": "Transaction history fetched successfully.",
    "data": [
        {
            "transactionId": "68235a8c7329f739edde8e88",
            "amount": 15,
            "type": "debited",
            "note": "prasadam",
            "status": "Success",
            "sender": "mrsahil",
            "receiver": "mruser",
            "transactionDate": "2025-05-13T14:43:24.408Z"
        },
        {
            "transactionId": "682318d49a434189f6e66165",
            "amount": 450,
            "type": "debited",
            "note": "paymeback",
            "status": "Success",
            "sender": "mrsahil",
            "receiver": "mruser",
            "transactionDate": "2025-05-13T10:03:00.140Z"
        },
```

### Request Endpoints

#### - Get Payment Request
```http
GET /api/requests
```
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
    "status": "success",
    "message": "Pending payment requests fetched successfully.",
    "data": {
        "requests": [
            {
                "paymentRequestId": "681f56f3f3d52476bfe1ae0a",
                "amount": 123,
                "note": "test-notification",
                "requester": "mrvarunk",
                "createdAt": "2025-05-10T13:38:59.120Z"
            },
        "pendingCount": 41
    },
    "timestamp": "2025-05-15T08:55:59.277Z"
}
}
```

#### - Create Payment Request
```http
POST /api/requests
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "amount": 200.00,
  "recipientId": "recipient_user_id",
  "description": "Request for project payment"
}
```
**Response:**
```json
{
    "status": "success",
    "message": "Payment request of ₹1 sent to 'mruser'.",
    "data": {
        "transactionId": "682360b17329f739edde8e9e",
        "amount": 1,
        "note": "test-notification",
        "recipient": "mruser",
        "date": "2025-05-13T15:09:37.428Z",
        "status": "pending"
    }
}
}
```


#### - accept-payment-request
```http
POST /api/requests/accept/:id
```
**Headers:**
```
Authorization: Bearer <token>
```
**Params:**
```
id of payment request
```

**Response:**
```json
{{
    "status": "success",
    "message": "Payment request accepted.",
    "data": {
        "request": {
            "_id": "6822b737d6ea9dfe398f350a",
            "requester": "68171d1e483ee19dff1c9ccd",
            "recipient": "68171a83fb6428ea8504aaf7",
            "amount": 2,
            "note": "req testing",
            "status": "accepted",
            "createdAt": "2025-05-13T03:06:31.461Z",
            "__v": 0
        },
        "transactions": {
            "debitTransaction": {
                "userId": "68171a83fb6428ea8504aaf7",
                "sender": "mrsahil",
                "receiver": "mruser",
                "amount": 2,
                "type": "debited",
                "status": "completed",
                "note": "req testing",
                "date": "2025-05-15T07:46:27.483Z",
                "_id": "68259bd37329f739edde8f08",
                "__v": 0
            },
            "creditTransaction": {
                "userId": "68171d1e483ee19dff1c9ccd",
                "sender": "mrsahil",
                "receiver": "mruser",
                "amount": 2,
                "type": "credited",
                "status": "completed",
                "note": "req testing",
                "date": "2025-05-15T07:46:27.523Z",
                "_id": "68259bd37329f739edde8f0a",
                "__v": 0
            }
        },
        "recipientBalance": 7619
    }
}
```




#### - reject-payment-request
```http
POST /api/requests/reject/:id
```
**Headers:**
```
Authorization: Bearer <token>
```
**Params:**
```
id of payment request
```

**Response:**
```json
  {
    "status": "success",
    "message": "Payment request rejected.",
    "data": {
        "_id": "681f159ead5d4fa36e4d1b6e",
        "requester": "68171d1e483ee19dff1c9ccd",
        "recipient": "68171a83fb6428ea8504aaf7",
        "amount": 51,
        "note": "test-notification",
        "status": "rejected",
        "createdAt": "2025-05-10T09:00:14.869Z",
        "__v": 0
    }
}
```




### Notification Endpoints

#### - Get Notifications
```http
GET /api/notifications
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
    "status": "success",
    "message": "Notifications fetched successfully.",
    "data": [
        {
            "_id": "6822b737d6ea9dfe398f350c",
            "userId": "68171a83fb6428ea8504aaf7",
            "message": "You have received a payment request of ₹2 from mruser with note: \"req testing\".",
            "seen": true,
            "type": "request_sent",
            "transactionId": "6822b737d6ea9dfe398f350a",
            "createdAt": "2025-05-13T03:06:31.493Z",
            "__v": 0
        },
}     
```

#### - Mark-all-as-read
```http
PATCH /api/notifications
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
    "status": "success",
    "message": "All notifications marked as seen."
}    
```

#### - Mark-as-read
```http
PATCH /api/notifications/mark-as-read/:id
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
    "status": "success",
    "message": "All notifications marked as seen."
}    
```
#### - Dismiss-Notification
```http
DELETE /api/notifications/dismiss/:id
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
    "status": "success",
    "message": "Notification dismissed."
}    
```
## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- CORS protection
- Environment variable configuration
- Secure payment processing

## 🚀 Development

The project uses nodemon for development, which automatically restarts the server when changes are detected.

```bash
npm run dev
```

## 📝 Error Handling

The API implements comprehensive error handling for:
- Invalid requests
- Authentication failures
- Database errors
- Payment processing errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Sahil Jaiswal - Initial work

## 📞 Support

For support, please open an issue in the repository or contact the development team.
