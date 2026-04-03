# System Architecture

## Overview

The Finance Dashboard Backend follows a **layered architecture** pattern with clear separation of concerns. This design ensures scalability, maintainability, and testability.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                     │
│                (Web, Mobile, Desktop Clients)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                   HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    EXPRESS.JS SERVER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Request/Response Middleware Stack             │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Security: Helmet, CORS, Rate Limiting           │  │ │
│  │  │  Parsing: JSON, URL-encoded                       │  │ │
│  │  │  Logging: Morgan, Custom Logger                   │  │ │
│  │  │  Authentication: JWT Token Verification           │  │ │
│  │  │  Authorization: RBAC Middleware                   │  │ │
│  │  │  Validation: Joi Schema Validation                │  │ │
│  │  │  Error Handling: Custom Error Handler             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ROUTE LAYER        ROUTE LAYER        ROUTE LAYER
   (Auth Routes)      (User Routes)      (Record Routes)
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────────┬──────────────────┬──────────────────┐
│  Auth Controller │  User Controller │ Record Controller│
│                  │                  │                  │
│  - register()    │  - getAllUsers() │  - createRecord()│
│  - login()       │  - getUserById() │  - getRecords()  │
│  - refresh()     │  - updateUser()  │  - updateRecord()│
│  - getProfile()  │  - deleteUser()  │  - deleteRecord()│
└────────┬─────────┴────────┬─────────┴────────┬─────────┘
         │                  │                  │
         ▼                  ▼                  ▼
    SERVICE LAYER - Business Logic
┌──────────────────────────────────────────────────────────────┐
│  UserService                 FinancialRecordService          │
│  ├── createUser()            ├── createRecord()              │
│  ├── authenticateUser()      ├── getRecords()                │
│  ├── findById()              ├── getRecordById()             │
│  ├── updateUser()            ├── updateRecord()              │
│  ├── deleteUser()            ├── deleteRecord()              │
│  ├── changePassword()        ├── getSummary()                │
│  ├── getAllUsers()           ├── getMonthlyTrends()          │
│  └── resetLoginAttempts()    └── getCategoryBreakdown()      │
└──────────────────────────────────────────────────────────────┘
         │                  │
         ▼                  ▼
    DATA ACCESS LAYER - Mongoose Models
┌──────────────────────────────────────────────────────────────┐
│  User Model                  FinancialRecord Model           │
│  ├── Indexes                 ├── Indexes                     │
│  ├── Validations             ├── Validations                 │
│  ├── Pre-save hooks          ├── Virtual fields              │
│  ├── Methods                 ├── Static methods              │
│  └── Virtuals                └── Query helpers               │
└──────────────────────────────────────────────────────────────┘
         │                  │
         ▼                  ▼
    DATABASE CONNECTION LAYER
┌──────────────────────────────────────────────────────────────┐
│            MongoDB (Local or Atlas Cloud)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database: finance-dashboard                             │  │
│  │  Collections:                                            │  │
│  │    - users (with indexes)                               │  │
│  │    - financialrecords (with compound indexes)           │  │
│  │    - sessions (optional, for refresh tokens)            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
1. CLIENT REQUEST
    │
    ▼
2. MIDDLEWARE PROCESSING
    ├── Helmet (Security headers)
    ├── CORS (Origin validation)
    ├── Rate Limiter (Request throttling)
    ├── Body Parser (JSON parsing)
    ├── Logger (Request logging)
    └── Authentication (JWT verification) ◄─── If needed
    │
    ▼
3. ROUTE HANDLING
    ├── Route matching
    └── Access control (RBAC) ◄─── Role/Permission check
    │
    ▼
4. INPUT VALIDATION
    ├── Joi schema validation
    └── Data sanitization
    │
    ▼
5. CONTROLLER
    ├── Extract validated data
    ├── Parse request parameters
    └── Call service layer
    │
    ▼
6. SERVICE LAYER
    ├── Apply business logic
    ├── Interact with database
    ├── Handle edge cases
    └── Return processed data
    │
    ▼
7. DATABASE OPERATION
    ├── Query construction
    ├── Data validation
    ├── Transaction (if needed)
    └── Return results
    │
    ▼
8. RESPONSE PREPARATION
    ├── Format response
    ├── Add metadata (pagination, etc.)
    └── Prepare status code
    │
    ▼
9. ERROR HANDLING
    ├── Catch errors from any layer
    ├── Format error response
    ├── Log error details
    └── Send to client
    │
    ▼
10. CLIENT RECEIVES RESPONSE
    └── Success or Error JSON response
```

## Key Components

### 1. **Middleware Layer**

Handles cross-cutting concerns:

```
Request → Security → Parsing → Logging → Auth → Validation → Routes
```

**Security Middleware:**
- `helmet()` - Sets secure HTTP headers
- `cors()` - Validates origin
- Rate Limiter - Prevents DDoS

**Authentication Middleware:**
- `authenticate()` - Verifies JWT token
- `optionalAuth()` - Non-blocking auth check

**Authorization Middleware:**
- `requireAuth()` - Ensures authentication
- `requireRole()` - Checks user role
- `requirePermission()` - Checks specific permissions

**Validation Middleware:**
- `validateBody()` - Validates request body
- `validateQuery()` - Validates query parameters
- `validateParams()` - Validates URL parameters

**Error Handling Middleware:**
- `errorHandler()` - Global error handler
- `asyncHandler()` - Wraps async functions

### 2. **Controller Layer**

Handles HTTP requests/responses:

```javascript
POST /api/v1/records
├── Validate request
├── Extract user from context
├── Call service method
└── Format and send response
```

Controllers are thin - they delegate business logic to services.

### 3. **Service Layer**

Contains business logic:

```javascript
FinancialRecordService.createRecord()
├── Validate business rules
├── Call model methods
├── Process data
├── Handle errors
└── Return result
```

Services are independent and testable.

### 4. **Model Layer**

Database interaction:

```javascript
User.save()
├── Apply validators
├── Run pre-save hooks
├── Insert/Update in DB
└── Run post-save hooks
```

Models include:
- Schemas and validation
- Instance methods (comparePassword)
- Static methods (getSummary, getMonthlyTrends)
- Pre/post hooks
- Indexes for performance

### 5. **Route Layer**

Maps URLs to handlers:

```javascript
router.post('/records',
  authenticate,           // Middleware
  requirePermission(),    // Middleware
  validateBody(),         // Middleware
  controller.createRecord // Handler
)
```

## Data Flow Example: Create Financial Record

```
POST /api/v1/records
│
├─ Headers: { Authorization: "Bearer token..." }
├─ Body: { amount: 100, type: "expense", category: "food" }
│
▼ Middleware Chain
├─ helmet() ✓
├─ cors() ✓
├─ rateLimiter() ✓
├─ jsonParser() ✓
├─ logger() ✓
├─ authenticate() 
│   └─ Verify JWT → Extract user ID
├─ requirePermission('records:create')
│   └─ Check user role has permission
├─ validateBody(recordSchema)
│   └─ Validate amount, type, category
│
▼ Controller: FinancialRecordController.createRecord()
├─ Get user ID from req.user
├─ Extract validated body
├─ Call: FinancialRecordService.createRecord(userId, data)
│
▼ Service: FinancialRecordService.createRecord()
├─ Instantiate new FinancialRecord
├─ Set userId and createdBy
├─ Call: record.save()
│
▼ Model: FinancialRecord.save()
├─ Run pre-save hooks
├─ Validate schema
├─ Insert into MongoDB
│
▼ Database: Insert operation
├─ Generate _id
├─ Save document
├─ Create indexes
└─ Return saved document
│
▼ Service response
├─ Populate user reference
├─ Return record object
│
▼ Controller response
├─ Set status 201
├─ Format response JSON
├─ Send to client
│
▼ Middleware error handler (if needed)
├─ Catch any errors
├─ Format error response
├─ Log error
├─ Send error to client
│
Response to Client:
{
  "success": true,
  "message": "Record created successfully",
  "data": { _id, userId, amount, type, ... }
}
```

## Role-Based Access Control (RBAC)

```
Permission Assignment by Role
├─ Admin
│   └─ [ALL PERMISSIONS]
│       ├─ users:create, read, update, delete
│       ├─ records:create, read, update, delete
│       ├─ analytics:read, export
│       └─ settings:manage
│
├─ Analyst
│   └─ [LIMITED PERMISSIONS]
│       ├─ records:create, read, update
│       ├─ analytics:read, export
│
└─ Viewer
    └─ [READ-ONLY PERMISSIONS]
        ├─ records:read
        └─ analytics:read
```

## Error Handling Architecture

```
Request Processing
    │
    ├─ Error occurs (any layer)
    │   └─ Throw custom error: new ValidationError()
    │                          new AuthorizationError()
    │                          new NotFoundError()
    │
    ▼
Express Error Handler
    ├─ Catch error
    ├─ Log error details
    ├─ Format error response
    └─ Send status code + JSON
    
Response Format:
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "details": { optional validation details }
}
```

## Security Architecture

```
Defense Layers
├─ Layer 1: Network
│   └─ HTTPS/TLS (in production)
│
├─ Layer 2: Request Validation
│   ├─ Helmet (secure headers)
│   ├─ CORS (origin validation)
│   ├─ Rate Limiting (throttle requests)
│   
├─ Layer 3: Authentication
│   ├─ Password hashing (bcryptjs)
│   ├─ JWT tokens (signed)
│   ├─ Refresh token rotation
│   └─ Token expiration
│
├─ Layer 4: Authorization
│   ├─ Role-based checks
│   ├─ Permission validation
│   └─ Resource ownership
│
├─ Layer 5: Data Validation
│   ├─ Input sanitization (Joi)
│   ├─ Type checking
│   └─ Schema validation
│
└─ Layer 6: Database
    ├─ Parameterized queries (Mongoose)
    └─ Prepared statements (protection against injection)
```

## Performance Optimization

### Database Indexes
```javascript
// User collection
db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1 })

// FinancialRecord collection
db.financialrecords.createIndex({ userId: 1, date: -1 })
db.financialrecords.createIndex({ userId: 1, type: 1, date: -1 })
db.financialrecords.createIndex({ userId: 1, category: 1 })
```

### Query Optimization
- Use `lean()` for read-only operations
- Pagination for large result sets
- Selective field projection
- Aggregation pipelines for complex queries

### Caching Opportunities
- Redis for session storage
- Cache frequently accessed user data
- Cache analytics results
- Cache role/permission rules

## Scalability Considerations

### Horizontal Scaling
```
Load Balancer
├─ Server 1
├─ Server 2
├─ Server 3
└─ Server n
    └─ Shared MongoDB
```

**Benefits:**
- Stateless API (no session affinity needed)
- Horizontal scaling without code changes
- Independent server restart
- Load balancing capability

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Database clustering/replication
- Connection pooling

### Database Optimization
- Sharding by userId
- Replication for read scaling
- Compression for storage
- Regular index maintenance

## Deployment Architecture

```
Development:
├─ Local Node.js
├─ Local MongoDB
└─ .env.example configuration

Production:
├─ PM2 / Docker container
├─ Nginx reverse proxy
├─ MongoDB Atlas / AWS DocumentDB
├─ Redis for caching
├─ CDN for static assets
└─ Monitoring (DataDog, New Relic)
```

## Technology Decisions

### Why Express.js?
- Lightweight and flexible
- Large ecosystem
- Great middleware support
- Easy to learn and maintain

### Why MongoDB?
- Flexible schema (financial records vary)
- Horizontal scalability
- JSON-like data model
- Good performance for nested queries

### Why JWT?
- Stateless authentication
- Scalable across servers
- No session storage needed
- Standard and widely supported

### Why Joi?
- Powerful schema validation
- Clear error messages
- Reusable schemas
- Easy to maintain
