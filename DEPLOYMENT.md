# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] Environment variables defined
- [ ] Database backups configured
- [ ] SSL/TLS certificates obtained
- [ ] CDN configured (optional)
- [ ] Monitoring/logging setup

### Security Configuration

#### 1. Update Environment Variables

```env
NODE_ENV=production
PORT=5000

# Change ALL secrets
JWT_SECRET=<generate-strong-random-key>
JWT_REFRESH_SECRET=<generate-strong-random-key>

# Production MongoDB URI
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/finance-dashboard?retryWrites=true&w=majority

# CORS for production domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=warn

# Rate limiting for production load
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate Secure Random Keys:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

#### 2. Database Security

**MongoDB Atlas:**
```javascript
// Connection string format
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl=true

// Enable in MongoDB Atlas:
- IP Access List (restrict to server IP)
- Database User (strong password)
- Encryption at rest
- Backup enabled
- VPC peering (if available)
```

**On-Premises MongoDB:**
```bash
# Enable authentication
mongod --auth --replSet rs0

# Create admin user
db.createUser({
  user: "admin",
  pwd: "<strong-password>",
  roles: ["root"]
})

# Create application user
db.createUser({
  user: "app_user",
  pwd: "<strong-password>",
  roles: [{role: "readWrite", db: "finance-dashboard"}]
})
```

### Deployment Options

## Option 1: AWS Elastic Beanstalk

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize EB application
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" finance-backend

# 3. Create environment
eb create finance-prod

# 4. Set environment variables
eb setenv NODE_ENV=production JWT_SECRET=<key> MONGODB_URI=<uri>

# 5. Deploy
git add .
git commit -m "Deploy to production"
eb deploy

# 6. Monitor
eb logs
eb health
```

## Option 2: Heroku

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create finance-backend-prod

# 3. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 4. Set config vars
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<key>

# 5. Deploy
git push heroku main

# 6. Monitor
heroku logs --tail
heroku ps
```

## Option 3: Docker & Docker Compose

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/finance-dashboard
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - mongodb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    restart: unless-stopped
    ports:
      - "27017:27017"

volumes:
  mongodb_data:
```

Deploy with Docker:
```bash
# Build image
docker build -t finance-backend:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

## Option 4: PM2 (VPS/Dedicated Server)

### Setup

```bash
# 1. Connect to VPS
ssh user@ip-address

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Clone repository
git clone <repository-url>
cd finance-dashboard-backend

# 5. Install dependencies
npm install

# 6. Create .env file
nano .env
# Add production configuration

# 7. Create PM2 ecosystem file
pm2 ecosystem.config.js

# 8. Start with PM2
pm2 start ecosystem.config.js --env production

# 9. Startup on reboot
pm2 startup
pm2 save

# 10. Check status
pm2 status
pm2 logs
```

### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'finance-backend',
      script: './src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      watch: false,
      ignore_watch: ['node_modules'],
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

## Option 5: Kubernetes

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: finance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: finance-backend
  template:
    metadata:
      labels:
        app: finance-backend
    spec:
      containers:
      - name: finance-backend
        image: your-registry/finance-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
```

Deploy:
```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-uri=<uri> \
  --from-literal=jwt-secret=<secret>

# Apply deployment
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl logs <pod-name>
```

## Post-Deployment

### Monitoring Setup

**Application Monitoring:**
```bash
# Option 1: Sentry (Error tracking)
npm install @sentry/node

# Option 2: DataDog (APM)
npm install dd-trace

# Option 3: New Relic
npm install newrelic
```

### Logging Setup

```javascript
// Winston logger for production
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Database Backup

**MongoDB Atlas Backups:**
- Automatic daily backups (enabled by default)
- Point-in-time recovery available
- Manual backups: Atlas console → Backup & Restore

**On-Premises Backup:**
```bash
# Daily automated backup
0 2 * * * /usr/bin/mongodump --uri "mongodb://user:pass@localhost:27017/finance-dashboard" --out /backups/$(date +\%Y-\%m-\%d)
```

### SSL/TLS Configuration

**Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Install Let's Encrypt Certificate:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.yourdomain.com
```

### Performance Optimization

**Redis Caching:**
```javascript
// Cache user permissions
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cachePermissions = async (userId) => {
  const cached = await client.get(`permissions:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const permissions = await fetchPermissions(userId);
  await client.setEx(`permissions:${userId}`, 3600, JSON.stringify(permissions));
  return permissions;
};
```

**Database Optimization:**
```bash
# Create indexes on production
db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1 })
db.financialrecords.createIndex({ userId: 1, date: -1 })
```

### Health Checks

```bash
# Monitor endpoint
curl http://api.yourdomain.com/health

# Check database connection
curl http://api.yourdomain.com/api/docs
```

### Scaling

**Load Balancing:**
- Nginx load balancer
- AWS ELB/ALB
- HAProxy

**Read Replicas:**
```javascript
// Read from replica
const readConnection = mongoose.createConnection(
  'mongodb+srv://user:pass@replica.mongodb.net/db'
);
```

## Rollback Plan

```bash
# Keep previous version
git tag v1.0.0-production

# Rollback to previous version
git checkout v1.0.0-production
npm install
pm2 restart ecosystem.config.js

# Or use Docker
docker run -d -p 5000:5000 --env-file .env \
  your-registry/finance-backend:previous-tag
```

## Performance Benchmarks

**Expected Performance:**
- Response time: < 200ms (p99)
- Database queries: < 100ms
- Memory: ~150-300MB per instance
- CPU: < 30% under normal load
- Throughput: 1000+ requests/second (depending on hardware)

## Security Best Practices Checklist

- [ ] HTTPS/TLS enabled
- [ ] JWT secrets are strong and unique
- [ ] Database authentication enabled
- [ ] Backups encrypted
- [ ] Rate limiting configured
- [ ] CORS restricted to allowed origins
- [ ] Security headers set (Helmet)
- [ ] No sensitive data in logs
- [ ] Secrets in environment variables only
- [ ] Regular security updates
- [ ] Monitor for suspicious activity
- [ ] DDoS protection (CloudFlare, AWS Shield)

---

**Deployment complete! Monitor the application closely in the first 24 hours. 🚀**
