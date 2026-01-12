# Deployment Architecture - EEC-NIF System

## 1. Deployment Overview

```mermaid
graph TB
    subgraph "Client Tier"
        BROWSER[Web Browsers]
        MOBILE[Mobile Browsers]
    end

    subgraph "CDN Layer"
        CLOUDFRONT[CloudFront CDN]
        CLOUDINARY[Cloudinary CDN]
    end

    subgraph "Load Balancer"
        ALB[Application Load Balancer]
    end

    subgraph "Application Tier"
        FRONTEND[Frontend Static Files<br/>S3 + CloudFront]

        subgraph "Backend Services"
            API1[API Server 1<br/>EC2/ECS]
            API2[API Server 2<br/>EC2/ECS]
            API3[API Server N<br/>EC2/ECS]
        end
    end

    subgraph "Data Tier"
        MONGO_PRIMARY[(MongoDB Primary<br/>Atlas)]
        MONGO_SECONDARY[(MongoDB Secondary<br/>Atlas)]
        REDIS[(Redis Cache<br/>ElastiCache)]
    end

    subgraph "Storage Tier"
        S3[S3 Bucket<br/>Backups]
        CLOUDINARY_STORAGE[Cloudinary Storage<br/>User Uploads]
    end

    subgraph "Monitoring"
        CLOUDWATCH[CloudWatch]
        LOGS[Log Aggregation]
    end

    BROWSER --> CLOUDFRONT
    MOBILE --> CLOUDFRONT
    CLOUDFRONT --> FRONTEND
    FRONTEND --> ALB

    ALB --> API1
    ALB --> API2
    ALB --> API3

    API1 --> MONGO_PRIMARY
    API2 --> MONGO_PRIMARY
    API3 --> MONGO_PRIMARY

    MONGO_PRIMARY --> MONGO_SECONDARY

    API1 --> REDIS
    API2 --> REDIS
    API3 --> REDIS

    API1 --> CLOUDINARY_STORAGE
    API2 --> CLOUDINARY_STORAGE
    API3 --> CLOUDINARY_STORAGE

    MONGO_PRIMARY --> S3

    API1 --> CLOUDWATCH
    API2 --> CLOUDWATCH
    API3 --> CLOUDWATCH

    CLOUDWATCH --> LOGS
```

## 2. Development Environment

### Local Development Setup

```mermaid
graph LR
    subgraph "Developer Machine"
        FRONTEND_DEV[Frontend<br/>Vite Dev Server<br/>:5173]
        BACKEND_DEV[Backend<br/>Node + Nodemon<br/>:5000]
        MONGO_LOCAL[(MongoDB<br/>Local/Atlas)]
    end

    FRONTEND_DEV -->|API Calls| BACKEND_DEV
    BACKEND_DEV -->|Database Queries| MONGO_LOCAL
```

**Setup Commands:**

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure .env
npm run dev  # Runs on port 5000

# Frontend
cd frontend
npm install
cp .env.example .env
# Configure .env
npm run dev  # Runs on port 5173
```

**Environment Variables:**

**Backend (.env):**
```env
PORT=5000
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/eec_nif
JWT_SECRET=your_secret_key_min_32_chars
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
```

## 3. Staging Environment

```mermaid
graph TB
    subgraph "Staging Infrastructure"
        STAGING_LB[Load Balancer]
        STAGING_FRONTEND[Frontend<br/>Vercel/Netlify Staging]
        STAGING_API[API Server<br/>Single Instance]
        STAGING_DB[(MongoDB Atlas<br/>Staging Cluster)]
        STAGING_REDIS[(Redis<br/>Single Instance)]
    end

    STAGING_FRONTEND --> STAGING_LB
    STAGING_LB --> STAGING_API
    STAGING_API --> STAGING_DB
    STAGING_API --> STAGING_REDIS
```

**Characteristics:**
- Single API server instance
- Smaller database cluster (M10)
- Reduced Redis cache (1GB)
- Purpose: Testing before production
- Data: Anonymized production data or test data
- Access: Limited to internal team

## 4. Production Environment

### 4.1 Simple Production Setup (Recommended for MVP)

```mermaid
graph TB
    subgraph "Production - Simple Setup"
        USERS[Users] --> VERCEL[Vercel Frontend]
        VERCEL --> RENDER[Render Backend]
        RENDER --> ATLAS[(MongoDB Atlas M10)]
        RENDER --> CLOUDINARY[Cloudinary]
    end
```

**Stack:**
- **Frontend:** Vercel (free tier with custom domain)
- **Backend:** Render (starter plan $7/month)
- **Database:** MongoDB Atlas (M10 shared $0.08/hr = ~$60/month)
- **Storage:** Cloudinary (free tier 25GB)
- **Total Cost:** ~$70/month

**Deployment Steps:**

1. **Frontend to Vercel:**
```bash
cd frontend
npm run build
# Connect GitHub repo to Vercel
# Auto-deploy on push to main
```

2. **Backend to Render:**
```bash
# Create new Web Service on Render
# Connect GitHub repo
# Set build command: npm install
# Set start command: node index.js
# Configure environment variables
```

3. **Database Setup:**
```bash
# Create MongoDB Atlas cluster
# Configure network access (0.0.0.0/0 or specific IPs)
# Create database user
# Copy connection string to backend env
```

### 4.2 Advanced Production Setup (Scalable)

```mermaid
graph TB
    subgraph "Users"
        WEB[Web Clients]
        MOBILE[Mobile Clients]
    end

    subgraph "DNS & CDN"
        ROUTE53[Route 53 DNS]
        CLOUDFRONT[CloudFront CDN]
    end

    subgraph "Frontend Hosting"
        S3_FRONTEND[S3 Bucket<br/>Static Files]
    end

    subgraph "Load Balancing"
        ALB[Application Load Balancer]
        TARGET_GROUP[Target Group]
    end

    subgraph "Application Tier - Auto Scaling"
        ASG[Auto Scaling Group]

        subgraph "EC2 Instances"
            API1[API Server 1]
            API2[API Server 2]
            API3[API Server N]
        end
    end

    subgraph "Data Layer"
        MONGO_CLUSTER[(MongoDB Atlas<br/>M30 Replica Set)]
        ELASTICACHE[(ElastiCache Redis<br/>Multi-AZ)]
    end

    subgraph "Storage"
        S3_BACKUP[S3 - Backups]
        CLOUDINARY_PROD[Cloudinary - Files]
    end

    subgraph "Monitoring & Logging"
        CLOUDWATCH[CloudWatch]
        CLOUDTRAIL[CloudTrail]
        SNS[SNS Alerts]
    end

    WEB --> ROUTE53
    MOBILE --> ROUTE53
    ROUTE53 --> CLOUDFRONT
    CLOUDFRONT --> S3_FRONTEND
    S3_FRONTEND --> ALB

    ALB --> TARGET_GROUP
    TARGET_GROUP --> ASG

    ASG --> API1
    ASG --> API2
    ASG --> API3

    API1 --> MONGO_CLUSTER
    API2 --> MONGO_CLUSTER
    API3 --> MONGO_CLUSTER

    API1 --> ELASTICACHE
    API2 --> ELASTICACHE
    API3 --> ELASTICACHE

    API1 --> CLOUDINARY_PROD
    API2 --> CLOUDINARY_PROD
    API3 --> CLOUDINARY_PROD

    MONGO_CLUSTER --> S3_BACKUP

    API1 --> CLOUDWATCH
    API2 --> CLOUDWATCH
    API3 --> CLOUDWATCH
    CLOUDWATCH --> SNS
```

**Infrastructure Details:**

**Frontend:**
- S3 bucket with static website hosting
- CloudFront distribution for CDN
- Route 53 for DNS
- SSL/TLS certificate (ACM)

**Backend:**
- EC2 instances (t3.medium or larger)
- Auto Scaling Group (min: 2, max: 10)
- Application Load Balancer
- Target group health checks
- SSL/TLS termination at ALB

**Database:**
- MongoDB Atlas M30+ cluster
- 3-node replica set
- Multi-region deployment
- Automated backups
- Point-in-time recovery

**Cache:**
- ElastiCache Redis
- Multi-AZ deployment
- Cache cluster with 2+ nodes
- 4GB+ memory

**Monitoring:**
- CloudWatch metrics
- CloudWatch Logs
- CloudTrail for audit
- SNS for alerts
- Custom dashboards

## 5. Docker Deployment

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: eec-nif-backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URL=${MONGODB_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - eec-network

  frontend:
    build: ./frontend
    container_name: eec-nif-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - eec-network

  mongo:
    image: mongo:6
    container_name: eec-nif-mongo
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped
    networks:
      - eec-network

  redis:
    image: redis:7-alpine
    container_name: eec-nif-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - eec-network

volumes:
  mongo-data:

networks:
  eec-network:
    driver: bridge
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error('Health check failed')})"

# Start server
CMD ["node", "index.js"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 6. Kubernetes Deployment

### Kubernetes Architecture

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        INGRESS[Ingress Controller<br/>nginx]

        subgraph "Frontend Deployment"
            FE1[Frontend Pod 1]
            FE2[Frontend Pod 2]
            FE_SVC[Frontend Service]
        end

        subgraph "Backend Deployment"
            BE1[Backend Pod 1]
            BE2[Backend Pod 2]
            BE3[Backend Pod 3]
            BE_SVC[Backend Service]
        end

        subgraph "Config & Secrets"
            CONFIG[ConfigMap]
            SECRET[Secrets]
        end

        subgraph "Storage"
            PV[Persistent Volume]
        end
    end

    subgraph "External Services"
        MONGO[(MongoDB Atlas)]
        REDIS[(Redis Cloud)]
    end

    INGRESS --> FE_SVC
    INGRESS --> BE_SVC
    FE_SVC --> FE1
    FE_SVC --> FE2
    BE_SVC --> BE1
    BE_SVC --> BE2
    BE_SVC --> BE3

    BE1 --> CONFIG
    BE1 --> SECRET
    BE2 --> CONFIG
    BE2 --> SECRET
    BE3 --> CONFIG
    BE3 --> SECRET

    BE1 --> MONGO
    BE2 --> MONGO
    BE3 --> MONGO
    BE1 --> REDIS
    BE2 --> REDIS
    BE3 --> REDIS
```

### Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eec-nif-backend
  labels:
    app: eec-nif-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eec-nif-backend
  template:
    metadata:
      labels:
        app: eec-nif-backend
    spec:
      containers:
      - name: backend
        image: your-registry/eec-nif-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: eec-nif-secrets
              key: mongodb-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: eec-nif-secrets
              key: jwt-secret
        - name: CLOUDINARY_CLOUD_NAME
          valueFrom:
            configMapKeyRef:
              name: eec-nif-config
              key: cloudinary-cloud-name
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

---
apiVersion: v1
kind: Service
metadata:
  name: eec-nif-backend-service
spec:
  selector:
    app: eec-nif-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: ClusterIP
```

### Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eec-nif-frontend
  labels:
    app: eec-nif-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: eec-nif-frontend
  template:
    metadata:
      labels:
        app: eec-nif-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/eec-nif-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: eec-nif-frontend-service
spec:
  selector:
    app: eec-nif-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: eec-nif-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - eec-nif.com
    secretName: eec-nif-tls
  rules:
  - host: eec-nif.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: eec-nif-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: eec-nif-frontend-service
            port:
              number: 80
```

## 7. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install backend dependencies
      run: cd backend && npm install

    - name: Run backend tests
      run: cd backend && npm test

    - name: Install frontend dependencies
      run: cd frontend && npm install

    - name: Run frontend tests
      run: cd frontend && npm test

  build-and-deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t eec-nif-backend:${{ github.sha }} ./backend

    - name: Push to registry
      run: |
        docker tag eec-nif-backend:${{ github.sha }} your-registry/eec-nif-backend:latest
        docker push your-registry/eec-nif-backend:latest

    - name: Deploy to production
      run: kubectl rollout restart deployment/eec-nif-backend

  build-and-deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build frontend
      run: |
        cd frontend
        npm install
        npm run build

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 8. Monitoring and Logging

### Monitoring Stack

```mermaid
graph TB
    subgraph "Application"
        APP[API Servers]
    end

    subgraph "Metrics Collection"
        PROMETHEUS[Prometheus]
    end

    subgraph "Visualization"
        GRAFANA[Grafana Dashboards]
    end

    subgraph "Alerting"
        ALERT_MANAGER[Alert Manager]
        PAGERDUTY[PagerDuty]
        SLACK[Slack]
    end

    subgraph "Log Aggregation"
        LOGS[Application Logs]
        ELK[ELK Stack / CloudWatch]
    end

    APP --> PROMETHEUS
    APP --> LOGS

    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERT_MANAGER

    ALERT_MANAGER --> PAGERDUTY
    ALERT_MANAGER --> SLACK

    LOGS --> ELK
```

### Key Metrics to Monitor

**Application Metrics:**
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active connections

**Infrastructure Metrics:**
- CPU utilization
- Memory usage
- Disk I/O
- Network I/O

**Database Metrics:**
- Query performance
- Connection pool usage
- Replication lag
- Storage usage

**Business Metrics:**
- Active users
- Daily registrations
- Fee collections
- System usage by school

### Logging Configuration

```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

## 9. Backup and Disaster Recovery

### Backup Strategy

```mermaid
graph TB
    subgraph "Production Database"
        MONGO_PRIMARY[(MongoDB Primary)]
    end

    subgraph "Backup Destinations"
        MONGO_SNAPSHOT[Atlas Snapshots<br/>Daily]
        S3_BACKUP[S3 Backup<br/>Weekly Full]
        OFFSITE[Offsite Backup<br/>Monthly]
    end

    subgraph "Recovery"
        RESTORE[Restore Process]
        VERIFY[Verification]
    end

    MONGO_PRIMARY -->|Automated| MONGO_SNAPSHOT
    MONGO_PRIMARY -->|mongodump| S3_BACKUP
    S3_BACKUP -->|Archive| OFFSITE

    MONGO_SNAPSHOT --> RESTORE
    S3_BACKUP --> RESTORE
    RESTORE --> VERIFY
```

**Backup Schedule:**
- **Daily:** Atlas automatic snapshots (retained 7 days)
- **Weekly:** Full database dump to S3 (retained 4 weeks)
- **Monthly:** Archived backup to glacier storage (retained 12 months)
- **On-demand:** Before major deployments

**Recovery Time Objectives (RTO):**
- **Critical data loss:** < 1 hour
- **Full system restore:** < 4 hours

**Recovery Point Objectives (RPO):**
- **Maximum data loss:** < 15 minutes (via oplog)
- **Typical data loss:** < 1 hour (via snapshots)

### Disaster Recovery Plan

**Scenarios:**

1. **Database Failure:**
   - Automatic failover to secondary replica
   - RTO: < 5 minutes
   - RPO: 0 (no data loss)

2. **Region Outage:**
   - Failover to secondary region
   - RTO: < 30 minutes
   - RPO: < 5 minutes

3. **Complete Data Loss:**
   - Restore from S3 backup
   - RTO: < 4 hours
   - RPO: < 24 hours

## 10. Security Configuration

### SSL/TLS Configuration

```nginx
# SSL configuration
ssl_certificate /etc/letsencrypt/live/eec-nif.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/eec-nif.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

### Firewall Rules

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (restrict to specific IPs)
ufw allow from 1.2.3.4 to any port 22

# Deny all other incoming
ufw default deny incoming

# Allow all outgoing
ufw default allow outgoing

# Enable firewall
ufw enable
```

### Environment Variables Security

- Store in AWS Secrets Manager / HashiCorp Vault
- Never commit to git
- Rotate secrets regularly (90 days)
- Use different secrets per environment

## 11. Performance Optimization

### CDN Configuration

```javascript
// CloudFront distribution config
{
  "Origins": [{
    "DomainName": "eec-nif-frontend.s3.amazonaws.com",
    "S3OriginConfig": {
      "OriginAccessIdentity": "origin-access-identity/cloudfront/ABCDEFG"
    }
  }],
  "DefaultCacheBehavior": {
    "Compress": true,
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6" // Managed-CachingOptimized
  },
  "PriceClass": "PriceClass_100" // US, Canada, Europe
}
```

### Database Optimization

```javascript
// Connection pooling
mongoose.connect(MONGODB_URL, {
  maxPoolSize: 10,
  minPoolSize: 2
});

// Indexes
db.studentusers.createIndex({ schoolId: 1, grade: 1, section: 1 });
db.feeinvoices.createIndex({ schoolId: 1, studentId: 1, status: 1 });
```

## 12. Cost Estimation

### Simple Setup (MVP)

| Service | Plan | Cost/Month |
|---------|------|------------|
| Vercel | Pro | $20 |
| Render | Starter | $7 |
| MongoDB Atlas | M10 | $60 |
| Cloudinary | Free | $0 |
| **Total** | | **$87/month** |

### Advanced Setup (100 Schools, 100K Users)

| Service | Specification | Cost/Month |
|---------|---------------|------------|
| CloudFront | 1TB transfer | $85 |
| EC2 | 3x t3.medium | $100 |
| ALB | 1 instance | $16 |
| MongoDB Atlas | M30 cluster | $400 |
| ElastiCache | cache.t3.medium | $50 |
| S3 | 500GB storage | $12 |
| Cloudinary | Advanced plan | $224 |
| CloudWatch | Standard monitoring | $10 |
| **Total** | | **~$900/month** |

## 13. Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] Tests passing (unit, integration)
- [ ] Environment variables configured
- [ ] Database migrations prepared
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### During Deployment
- [ ] Enable maintenance mode
- [ ] Deploy backend first
- [ ] Run database migrations
- [ ] Deploy frontend
- [ ] Smoke tests passed
- [ ] Health checks green

### Post-Deployment
- [ ] Verify core functionality
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Test critical user flows
- [ ] Disable maintenance mode
- [ ] Notify team of completion
- [ ] Document any issues

---

**Document Version:** 1.0
**Last Updated:** 2026-01-12
**Author:** DevOps Architecture Team
