# Finance Dashboard Backend

A production-ready Finance Dashboard Backend system built with Node.js, Express, and MongoDB. Implements user management, role-based access control (RBAC), financial record management, and comprehensive analytics APIs.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

### Core Features
- ✅ User Management with role-based system (Admin, Analyst, Viewer)
- ✅ JWT-based Authentication with refresh tokens
- ✅ Role-Based Access Control (RBAC) with permission system
- ✅ Financial Record CRUD operations
- ✅ Comprehensive Dashboard Analytics
- ✅ Input Validation with Joi schemas
- ✅ Error Handling & Logging
- ✅ Rate Limiting & Security (Helmet, CORS)
- ✅ Soft Delete support
- ✅ Pagination and Filtering

### Analytics Features
- 📊 Total Income/Expense Summary
- 📈 Monthly Financial Trends
- 🏷️ Category-wise Breakdown
- 📋 Recent Transactions
- 📥 Data Export (JSON/CSV ready)

## 🛠 Tech Stack

**Runtime & Framework:**
- Node.js 16+
- Express.js 4.x

**Database:**
- MongoDB with Mongoose ODM

**Authentication & Security:**
- JWT (JSON Web Tokens)
- bcryptjs for password hashing
- Helmet for HTTP headers
- CORS for cross-origin requests
- Express Rate Limit

**Validation & Error Handling:**
- Joi for schema validation
- Custom error classes

**Development Tools:**
- Nodemon for development server
- Morgan for HTTP logging
- Jest for testing
- ESLint for code quality

## 📂 Project Structure

```
finance-dashboard-backend/
│
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── env.js           # Environment setup
│   │
│   ├── models/              # Database models
│   │   ├── User.js          # User schema with auth
│   │   └── FinancialRecord.js
│   │
│   ├── controllers/         # Request handlers
│   │   ├── UserController.js
│   │   └── FinancialRecordController.js
│   │
│   ├── services/            # Business logic layer
│   │   ├── UserService.js
│   │   └── FinancialRecordService.js
│   │
│   ├── routes/              # API route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── records.js
│   │   └── dashboard.js
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── rbac.js          # Role-based access control
│   │   └── errorHandler.js  # Error handling
│   │
│   ├── validators/          # Input validation
│   │   ├── schemas.js       # Joi schemas
│   │   └── middleware.js    # Validation middleware
│   │
│   ├── constants/           # Constants & enums
│   │   └── roles.js         # Roles & permissions
│   │
│   ├── utils/               # Utility functions
│   │   ├── errors.js        # Custom error classes
│   │   └── logger.js        # Logging utility
│   │
│   └── index.js             # Application entry point
│
├── scripts/
│   └── seedData.js          # Database seeding script
│
├── tests/                   # Test files
│
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── ARCHITECTURE.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB running locally or MongoDB Atlas connection string

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd finance-dashboard-backend

# Install dependencies
npm install
```

### Step 2: Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
```

### Step 3: Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed sample data
npm run seed
```

### Step 4: Start Development Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:5000`

## ⚙️ Environment Configuration

Edit `.env` file with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/finance-dashboard

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe",
  "role": "viewer"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### Get Current User Profile
```
GET /api/v1/auth/me
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "data": { user_object }
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response (200):
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "..."
  }
}
```

### User Management Endpoints

#### Get All Users (Admin Only)
```
GET /api/v1/users?page=1&limit=20&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <adminToken>

Response (200):
{
  "success": true,
  "data": [ users_array ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get User by ID
```
GET /api/v1/users/:userId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { user_object }
}
```

#### Update User
```
PUT /api/v1/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "metadata": {
    "department": "Finance",
    "phone": "+1234567890"
  }
}

Response (200):
{
  "success": true,
  "message": "User updated successfully",
  "data": { updated_user }
}
```

#### Change Password
```
PUT /api/v1/users/:userId/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Delete User (Admin Only)
```
DELETE /api/v1/users/:userId
Authorization: Bearer <adminToken>

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Financial Records Endpoints

#### Create Record
```
POST /api/v1/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "description": "Monthly salary",
  "date": "2024-01-15",
  "tags": ["work"],
  "metadata": {
    "paymentMethod": "bank_transfer"
  }
}

Response (201):
{
  "success": true,
  "message": "Record created successfully",
  "data": { record_object }
}
```

#### Get All Records
```
GET /api/v1/records?page=1&limit=20&type=expense&category=food&startDate=2024-01-01&endDate=2024-01-31&sortBy=date&sortOrder=desc
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [ records_array ],
  "pagination": { pagination_object }
}
```

#### Get Record by ID
```
GET /api/v1/records/:recordId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { record_object }
}
```

#### Update Record
```
PUT /api/v1/records/:recordId
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5500,
  "description": "Updated description"
}

Response (200):
{
  "success": true,
  "message": "Record updated successfully",
  "data": { updated_record }
}
```

#### Delete Record
```
DELETE /api/v1/records/:recordId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Record deleted successfully"
}
```

#### Export Records
```
GET /api/v1/records/export?type=income&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [ records_array ],
  "count": 50,
  "exportedAt": "2024-01-15T10:30:00Z"
}
```

### Dashboard Analytics Endpoints

#### Get Summary
```
GET /api/v1/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    },
    "totalIncome": 5300,
    "totalExpense": 1880,
    "netBalance": 3420,
    "byCategory": {
      "salary": { income: 5000, expense: 0, total: 5000 },
      "food": { income: 0, expense: 200, total: 200 }
    },
    "byType": {
      "income": 5300,
      "expense": 1880
    }
  }
}
```

#### Get Monthly Trends
```
GET /api/v1/dashboard/trends?months=12
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "month": "2023-01",
      "income": 5300,
      "expense": 1880,
      "net": 3420
    },
    ...
  ]
}
```

#### Get Category Breakdown
```
GET /api/v1/dashboard/categories?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "period": { ... },
    "data": [
      {
        "category": "salary",
        "total": 5000,
        "count": 1,
        "type": "income"
      },
      ...
    ]
  }
}
```

#### Get Recent Transactions
```
GET /api/v1/dashboard/recent?limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [ recent_records ]
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure

The system uses two types of tokens:

**Access Token** (Short-lived):
- Used for API authentication
- Default expiry: 7 days
- Include in Authorization header: `Authorization: Bearer <token>`

**Refresh Token** (Long-lived):
- Used to obtain new access tokens
- Default expiry: 30 days
- Keep in secure httpOnly cookie or secure storage

### Role-Based Access Control (RBAC)

Three roles with hierarchical permissions:

**Admin:**
- Full access to all resources
- Can manage users and system settings
- Can view all analytics

**Analyst:**
- Can create and read financial records
- Can access analytics and export data
- Cannot manage users

**Viewer:**
- Read-only access to records
- Can access own analytics
- Cannot create or modify records

### Permission Model

Permissions are hierarchical:
```
                    [Admin]
                       ↓
                    [Analyst]
                       ↓
                    [Viewer]
```

## 📊 Database Schema

### User Model

```javascript
{
  email: String (unique, required),
  fullName: String (required),
  password: String (hashed, required),
  role: String (admin|analyst|viewer, default: viewer),
  status: String (active|inactive|suspended),
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date (for account lockout),
  metadata: {
    department: String,
    phone: String,
    avatar: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Financial Record Model

```javascript
{
  userId: ObjectId (ref: User),
  amount: Number (required, positive),
  type: String (income|expense, required),
  category: String (required),
  description: String,
  date: Date (required),
  tags: [String],
  isRecurring: Boolean,
  recurringPattern: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  metadata: {
    paymentMethod: String,
    vendor: String,
    reference: String
  },
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  isDeleted: Boolean (soft delete),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

Optimized indexes for performance:
- User: email, role, status
- FinancialRecord: userId + date, userId + type + date, userId + category

## 🏆 Best Practices Implemented

### Code Organization
✅ **Layered Architecture**: Controllers → Services → Models  
✅ **Separation of Concerns**: Each module has a single responsibility  
✅ **DRY (Don't Repeat Yourself)**: Reusable utilities and middleware  

### Security
✅ **Password Hashing**: bcryptjs with salt rounds  
✅ **JWT Tokens**: Secure token-based authentication  
✅ **Input Validation**: Joi schemas for all inputs  
✅ **Rate Limiting**: Prevent brute force attacks  
✅ **CORS**: Controlled cross-origin requests  
✅ **Helmet**: Secure HTTP headers  
✅ **Login Attempt Tracking**: Account lockout after failed attempts  

### Error Handling
✅ **Custom Error Classes**: Type-specific error handling  
✅ **Meaningful Error Messages**: Helpful feedback to clients  
✅ **HTTP Status Codes**: Proper status codes for all responses  
✅ **Error Logging**: Detailed error logs for debugging  

### Data Validation
✅ **Input Validation**: All user inputs validated with Joi  
✅ **Schema Validation**: Database models have validators  
✅ **Type Checking**: TypeScript-like validation  

### Performance
✅ **Pagination**: Efficient data retrieval with limits  
✅ **Indexing**: Database indexes for common queries  
✅ **Lean Queries**: Using .lean() for read-only operations  
✅ **Compound Indexes**: Optimized for complex queries  

### Scalability
✅ **Stateless Architecture**: Easy horizontal scaling  
✅ **Middleware Chain**: Modular request processing  
✅ **Service Layer**: Easy to extend with new features  
✅ **Configuration Management**: Environment-based config  

## 🧪 Testing

### Run Tests
```bash
npm test
npm run test:watch
```

### Test Coverage
```bash
npm test -- --coverage
```

Example test structure:
```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // test implementation
    });

    it('should throw error if user already exists', async () => {
      // test implementation
    });
  });
});
```

## 🌐 Deployment

### Environment Setup for Production

1. **Update .env file:**
```env
NODE_ENV=production
JWT_SECRET=<complex-random-string>
JWT_REFRESH_SECRET=<complex-random-string>
MONGODB_URI=<production-mongodb-uri>
LOG_LEVEL=warn
```

2. **Security Checklist:**
- [ ] Change all SECRET keys
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Enable MongoDB authentication
- [ ] Configure rate limiting for production loads
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable request logging and monitoring
- [ ] Configure CDN for static files

3. **Deploy Options:**

**Using PM2 (Production Process Manager):**
```bash
npm install -g pm2
pm2 start src/index.js --name "finance-backend"
pm2 startup
pm2 save
```

**Using Docker:**
```bash
docker build -t finance-backend .
docker run -p 5000:5000 --env-file .env finance-backend
```

**Using Heroku:**
```bash
heroku create finance-dashboard-backend
git push heroku main
```

**Using AWS/Azure/GCP:**
- Deploy to containerized environments (ECS, App Service, Cloud Run)
- Use managed databases (MongoDB Atlas, AWS DocumentDB)
- Enable auto-scaling based on metrics
- Use CDN for API caching

## 📝 API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pagination": { /* optional pagination info */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "details": { /* optional validation details */ }
}
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📧 Support

For support, email: support@finance-dashboard.com

---

**Happy Coding! 🚀**
