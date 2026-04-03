# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup (2 minutes)

```bash
# 1. Copy example env file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Ensure MongoDB is running
# Option A: Local MongoDB
mongod

# Option B: MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Seed Sample Data (1 minute)

```bash
npm run seed
```

You'll get test credentials:
- **Admin**: admin@example.com / Admin@123456
- **Analyst**: analyst@example.com / Analyst@123456
- **Viewer**: viewer@example.com / Viewer@123456

### Step 3: Start Server (30 seconds)

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Server runs at: `http://localhost:5000`

### Step 4: Test API (1.5 minutes)

#### Option A: Using cURL

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "fullName": "Test User"
  }'

# 2. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "Analyst@123456"
  }'

# Copy the accessToken from response

# 3. Create financial record
curl -X POST http://localhost:5000/api/v1/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 100,
    "type": "expense",
    "category": "food",
    "description": "Lunch"
  }'

# 4. Get dashboard summary
curl http://localhost:5000/api/v1/dashboard/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Option B: Using REST Client (VS Code)

1. Install "REST Client" extension
2. Create `requests.http` file
3. Add requests:

```http
### Register User
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123",
  "fullName": "Test User"
}

### Login
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "analyst@example.com",
  "password": "Analyst@123456"
}

### Create Record
POST http://localhost:5000/api/v1/records
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "amount": 100,
  "type": "expense",
  "category": "food",
  "description": "Lunch"
}

### Get Dashboard Summary
GET http://localhost:5000/api/v1/dashboard/summary
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Option C: Using Postman

1. Import the API collection (example below)
2. Set environment variables:
   - `base_url`: http://localhost:5000
   - `access_token`: (auto-filled after login)
3. Run requests in sequence

## 📋 Common Tasks

### Create a New Record

```javascript
// POST /api/v1/records
{
  "amount": 500,
  "type": "income",
  "category": "freelance",
  "description": "Freelance project completed",
  "date": "2024-01-15",
  "tags": ["project1", "important"],
  "metadata": {
    "paymentMethod": "bank_transfer",
    "vendor": "Client Name"
  }
}
```

### Get Your Financial Summary

```javascript
// GET /api/v1/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "success": true,
  "data": {
    "period": { "startDate": "...", "endDate": "..." },
    "totalIncome": 5300,
    "totalExpense": 1880,
    "netBalance": 3420,
    "byCategory": { ... },
    "byType": { ... }
  }
}
```

### Filter Records

```javascript
// GET /api/v1/records?page=1&limit=20&type=expense&category=food&sortBy=date&sortOrder=desc

Query Parameters:
- page: Page number (default: 1)
- limit: Records per page (default: 20)
- type: income|expense
- category: salary|freelance|investment|other_income|food|transport|utilities|entertainment|healthcare|education|rent|other_expense
- tags: Array of tags
- startDate: ISO date string
- endDate: ISO date string
- sortBy: date|amount|category
- sortOrder: asc|desc
```

### View Monthly Trends

```javascript
// GET /api/v1/dashboard/trends?months=12

Response:
[
  {
    "month": "2023-01",
    "income": 5300,
    "expense": 1880,
    "net": 3420
  },
  ...
]
```

### Export Records

```javascript
// GET /api/v1/records/export?type=income&startDate=2023-01-01&endDate=2024-12-31

// Returns all records as JSON for download/processing
```

## 🛠 Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Watch mode testing
npm run test:watch

# Generate test coverage
npm test -- --coverage

# Seed database
npm run seed

# Lint code
npm run lint

# Stop MongoDB (if running locally)
mongod --shutdown
```

## 🔑 Sample Test Scenarios

### Scenario 1: Monthly Budget Tracking

```bash
# 1. Login as analyst
POST /auth/login
{ "email": "analyst@example.com", "password": "Analyst@123456" }

# 2. Create multiple expense records
POST /records
{ "amount": 1500, "type": "expense", "category": "rent" }
{ "amount": 200, "type": "expense", "category": "food" }
{ "amount": 100, "type": "expense", "category": "transport" }

# 3. View summary
GET /dashboard/summary?startDate=2024-01-01&endDate=2024-01-31

# 4. View category breakdown
GET /dashboard/categories?startDate=2024-01-01&endDate=2024-01-31

# 5. View monthly trends
GET /dashboard/trends?months=6
```

### Scenario 2: User Management (Admin)

```bash
# 1. Login as admin
POST /auth/login
{ "email": "admin@example.com", "password": "Admin@123456" }

# 2. Get all users
GET /users

# 3. Update user role
PUT /users/:userId
{ "role": "analyst" }

# 4. Reset locked account
POST /users/:userId/reset-login

# 5. Delete user
DELETE /users/:userId
```

### Scenario 3: Viewer Access Control

```bash
# 1. Login as viewer
POST /auth/login
{ "email": "viewer@example.com", "password": "Viewer@123456" }

# 2. Can read records
GET /records ✓

# 3. Cannot create records
POST /records ✗ (403 Access denied)

# 4. Can view analytics
GET /dashboard/summary ✓

# 5. Cannot export data
GET /records/export ✗ (403 Access denied)
```

## 🐛 Troubleshooting

### MongoDB Connection Refused

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process on port 5000
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Invalid JWT Token

- Token may have expired (default: 7 days)
- Use refresh endpoint: `POST /auth/refresh`
- Check token format: `Authorization: Bearer <token>`

### Validation Errors

Check `.env` file matches expected format:
- `MONGODB_URI`: Valid MongoDB connection string
- `JWT_SECRET`: Non-empty string
- `PORT`: Valid port number

## 📚 Next Steps

1. **Environment Setup**: Follow [README.md](./README.md) installation section
2. **API Documentation**: Check [README.md](./README.md#-api-documentation)
3. **Architecture**: Review [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Database**: Review database schema in [README.md](./README.md#-database-schema)
5. **Deployment**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

## 💡 Tips

- Keep `.env` file secure, never commit to repository
- Use `npm run seed` to reset and populate database with sample data
- Check logs in development mode to debug issues
- Use `Authorization: Bearer` format for all protected endpoints
- Test RBAC by switching between user roles
- Monitor MongoDB queries in development for optimization

## 🆘 Need Help?

Check:
1. Logs in console (verbose in dev mode)
2. [README.md](./README.md) - Comprehensive documentation
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design details
4. `requests.http` or Postman collection for API examples
5. Model files for schema validation rules

---

**Ready to build? Start with Step 1! 🚀**
