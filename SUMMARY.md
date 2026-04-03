# Finance Dashboard Backend - System Overview

## 📊 Project Summary

A **production-ready Finance Dashboard Backend** built with Node.js, Express.js, and MongoDB. This is a complete, scalable system for managing financial records with role-based access control, comprehensive analytics, and secure authentication.

### ✨ Complete Implementation

- ✅ **User Management** - User creation, authentication, role assignment
- ✅ **Authentication** - JWT tokens with refresh capability
- ✅ **Authorization** - Role-based access control (RBAC) with fine-grained permissions
- ✅ **Financial Records** - Full CRUD operations with soft delete
- ✅ **Analytics APIs** - Dashboards with income/expense summaries, trends, category breakdowns
- ✅ **Validation** - Comprehensive input validation with Joi schemas
- ✅ **Error Handling** - Custom error classes and global error handler
- ✅ **Security** - Helmet, CORS, rate limiting, password hashing, login attempt tracking
- ✅ **Database** - MongoDB with optimized indexes and data models
- ✅ **Middleware** - Layered middleware for cross-cutting concerns
- ✅ **Logging** - Structured logging for debugging and monitoring

## 📁 Project Structure

```
finance-dashboard-backend/
├── src/
│   ├── config/              # Configuration (database, env)
│   ├── models/              # Database models (User, FinancialRecord)
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── routes/              # API routes (auth, users, records, dashboard)
│   ├── middleware/          # Custom middleware (auth, RBAC, errors)
│   ├── validators/          # Input validation schemas
│   ├── constants/           # Roles, permissions, constants
│   ├── utils/               # Utilities (errors, logger)
│   └── index.js             # Application entry point
├── scripts/
│   └── seedData.js          # Database seeding for testing
├── tests/                   # Test files
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── README.md                # Full API documentation
├── ARCHITECTURE.md          # System design and architecture
├── QUICK_START.md           # 5-minute setup guide
├── DEPLOYMENT.md            # Production deployment guide
├── requests.http            # Sample API requests
└── SUMMARY.md               # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev    # Development with auto-reload
npm start      # Production mode
```

### 5. Test API
```bash
curl http://localhost:5000/health
```

See [QUICK_START.md](./QUICK_START.md) for detailed 5-minute setup.

## 🔑 Key Features by Role

### Admin Role
- ✓ Full system access
- ✓ Create, read, update, delete users
- ✓ Manage settings
- ✓ View all financial records
- ✓ Access all analytics
- ✓ Export data

### Analyst Role
- ✓ Create financial records
- ✓ Read own records
- ✓ Access analytics
- ✓ Export data
- ✗ Cannot manage users

### Viewer Role
- ✓ Read financial records
- ✓ View analytics
- ✗ Cannot create/edit records
- ✗ Cannot export data
- ✗ Cannot manage users

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/refresh` - Refresh access token

### Users (Admin Only, except profile)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:userId` - Get user by ID
- `PUT /api/v1/users/:userId` - Update user
- `DELETE /api/v1/users/:userId` - Delete user
- `PUT /api/v1/users/:userId/change-password` - Change password
- `POST /api/v1/users/:userId/reset-login` - Reset login attempts

### Financial Records
- `POST /api/v1/records` - Create record
- `GET /api/v1/records` - Get records with filtering
- `GET /api/v1/records/:recordId` - Get single record
- `PUT /api/v1/records/:recordId` - Update record
- `DELETE /api/v1/records/:recordId` - Delete record
- `GET /api/v1/records/export` - Export records

### Dashboard Analytics
- `GET /api/v1/dashboard/summary` - Income/expense summary
- `GET /api/v1/dashboard/trends` - Monthly financial trends
- `GET /api/v1/dashboard/categories` - Category breakdown
- `GET /api/v1/dashboard/recent` - Recent transactions

See [README.md](./README.md) for full API documentation.

## 🏗️ Architecture Highlights

### Layered Architecture

```
Routes → Controllers → Services → Models → Database
                ↓
         Middleware Layer
         (Auth, Validation, Errors)
```

**Benefits:**
- Separation of concerns
- Easy to test
- Reusable components
- Scalable structure

### Security Layers

1. **Network**: HTTPS/TLS
2. **Request**: Helmet, CORS, Rate Limiting
3. **Authentication**: JWT with secure hashing
4. **Authorization**: Role-based permissions
5. **Data**: Input validation, parameterized queries
6. **Database**: Authentication, encryption at rest

### Database Design

**Optimized Indexes:**
- User: `email`, `role`, `status`
- FinancialRecord: `userId + date`, `userId + type + date`, `userId + category`

**Soft Delete:**
- Records marked as deleted instead of removed
- Enables recovery and audit trail

**Virtual Fields:**
- `monthYear` for financial record grouping
- `isLocked` for user account status

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  userId: "user_id",
  iat: timestamp,
  exp: timestamp
}
```

**Default Expiry:**
- Access Token: 7 days
- Refresh Token: 30 days

### Permission Model

Permissions are assigned per role:
```
Admin → Analyst → Viewer (hierarchical)
```

Fine-grained permissions:
- `users:create`, `users:read`, `users:update`, `users:delete`
- `records:create`, `records:read`, `records:update`, `records:delete`
- `analytics:read`, `analytics:export`
- `settings:manage`

## 📈 Analytics Features

### Summary Analytics
- Total income
- Total expenses
- Net balance (income - expenses)
- Category-wise breakdown
- By-type breakdown

### Trends Analysis
- Monthly income and expenses
- Net balance trends
- Multi-month comparisons
- Growth patterns

### Category Analysis
- Amount by category
- Transaction count
- Income vs. expense split
- Top spending categories

## 💾 Database Schema

### User Model
```javascript
{
  email: String (unique),
  fullName: String,
  password: String (hashed),
  role: String (admin|analyst|viewer),
  status: String (active|inactive|suspended),
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date (account lockout),
  metadata: { department, phone, avatar },
  createdAt: Date,
  updatedAt: Date
}
```

### FinancialRecord Model
```javascript
{
  userId: ObjectId,
  amount: Number (positive),
  type: String (income|expense),
  category: String,
  description: String,
  date: Date,
  tags: [String],
  isRecurring: Boolean,
  recurringPattern: String,
  metadata: { paymentMethod, vendor, reference },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  isDeleted: Boolean (soft delete),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Technology Stack

**Backend Framework:**
- Node.js 16+
- Express.js 4.x

**Database:**
- MongoDB with Mongoose ODM

**Authentication:**
- JWT (jsonwebtoken)
- bcryptjs (password hashing)

**Validation:**
- Joi (schema validation)

**Security:**
- Helmet (HTTP headers)
- CORS (cross-origin control)
- Express Rate Limit

**Development:**
- Nodemon (auto-reload)
- Jest (testing)
- Morgan (HTTP logging)

## 📊 Best Practices Implemented

### Code Quality
- ✅ Layered architecture
- ✅ Separation of concerns
- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID principles
- ✅ Error handling
- ✅ Input validation
- ✅ Logging and monitoring

### Security
- ✅ Password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Account lockout after failed attempts
- ✅ Secure headers (Helmet)

### Performance
- ✅ Database indexing
- ✅ Pagination
- ✅ Lean queries for read-only operations
- ✅ Connection pooling
- ✅ Query optimization

### Scalability
- ✅ Stateless API (horizontal scaling)
- ✅ Modular middleware
- ✅ Service layer for business logic
- ✅ Environment-based configuration
- ✅ Connection pooling

## 🚀 Deployment Options

### Supported Platforms
1. **Docker** - Container deployment
2. **PM2** - Process manager for VPS
3. **Heroku** - Platform as a Service
4. **AWS Elastic Beanstalk** - AWS managed service
5. **Kubernetes** - Container orchestration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- **[README.md](./README.md)** - Complete API documentation and features
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and architecture details
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[requests.http](./requests.http)** - Sample API requests

## 🧪 Testing

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm test -- --coverage  # With coverage report
```

### Sample Test Data
```bash
npm run seed
```

Creates:
- Admin user: `admin@example.com` / `Admin@123456`
- Analyst user: `analyst@example.com` / `Analyst@123456`
- Viewer user: `viewer@example.com` / `Viewer@123456`
- Sample financial records

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### 2. Develop and Test
```bash
npm run dev      # Start dev server
npm test         # Run tests
npm run lint     # Check code quality
```

### 3. Commit and Push
```bash
git add .
git commit -m "Add feature description"
git push origin feature/your-feature
```

### 4. Create Pull Request
- Request review
- Ensure tests pass
- Merge to main

### 5. Deploy to Production
```bash
npm start        # Start production server
npm run seed     # Optional: seed production data
```

## 📊 Sample Usage Flow

### 1. Register User
```bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe"
}
```

### 2. Login
```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
# Returns: accessToken, refreshToken
```

### 3. Create Financial Record
```bash
POST /api/v1/records
Authorization: Bearer <accessToken>
{
  "amount": 100,
  "type": "expense",
  "category": "food",
  "description": "Lunch"
}
```

### 4. View Summary
```bash
GET /api/v1/dashboard/summary
Authorization: Bearer <accessToken>
# Returns: totalIncome, totalExpense, netBalance, breakdown
```

## 🎯 Use Cases

### Personal Finance Management
- Track daily expenses
- Monitor income sources
- Analyze spending patterns
- Set and track budgets

### Family Finance
- Multiple users with different roles
- Shared financial visibility
- Controlled access based on roles
- Expense categorization

### Small Business
- Invoice tracking
- Expense management
- Revenue analysis
- Financial reporting

## 🔮 Future Enhancements

Potential additions:
- Budget planning and alerts
- Recurring transaction automation
- Receipt image OCR
- Multi-currency support
- Mobile app integration
- Advanced reporting (PDF)
- Machine learning insights
- Bank account integration
- Tax report generation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - See LICENSE file

## ✉️ Support

For questions or issues:
1. Check documentation files
2. Review API examples in `requests.http`
3. Check GitHub issues
4. Contact: support@finance-dashboard.com

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **JWT**: https://jwt.io
- **Joi**: https://joi.dev

## ✅ Verification Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] MongoDB running (`mongod`)
- [ ] Environment file created (`.env`)
- [ ] Sample data seeded (`npm run seed`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check passes (`GET /health`)
- [ ] Can login with test credentials
- [ ] Can create financial record
- [ ] Can view dashboard summary
- [ ] RBAC restrictions work

## 📈 Metrics

**Code Organization:**
- 10+ modular files
- Clear separation of concerns
- Reusable components

**Security:**
- 6+ security layers
- Password hashing
- JWT authentication
- RBAC implementation
- Input validation

**Performance:**
- Optimized indexes
- Pagination support
- Efficient queries
- Connection pooling

**Scalability:**
- Stateless architecture
- Modular middleware
- Service layer abstraction
- Environment configuration

---

## 🚀 Ready to Deploy?

1. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Configure production environment
3. Choose deployment platform
4. Follow platform-specific instructions
5. Set up monitoring and logging
6. Configure backups

**Happy coding! 🎉**

For detailed information, refer to the comprehensive documentation:
- [README.md](./README.md) - API & Features
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System Design
- [QUICK_START.md](./QUICK_START.md) - Quick Setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production Guide
