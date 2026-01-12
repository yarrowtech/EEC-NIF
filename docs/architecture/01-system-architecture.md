# System Architecture - EEC-NIF Multi-Tenant School Management System

## 1. High-Level System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end

    subgraph "Frontend Layer"
        REACT[React 19 SPA]
        VITE[Vite Build Tool]
        ROUTER[React Router]

        subgraph "User Portals"
            STUDENT[Student Portal]
            TEACHER[Teacher Portal]
            PARENT[Parent Portal]
            ADMIN[Admin Portal]
        end
    end

    subgraph "Backend Layer"
        NGINX[Nginx/Load Balancer]
        API[Express.js API Server]

        subgraph "Middleware Stack"
            AUTH[JWT Authentication]
            RBAC[Role-Based Access Control]
            RATE[Rate Limiter]
            CORS[CORS Handler]
            TENANT[Tenant Resolver]
        end

        subgraph "Business Logic"
            USER_SVC[User Service]
            ACADEMIC_SVC[Academic Service]
            FEE_SVC[Fee Service]
            AI_SVC[AI Learning Service]
            NOTIF_SVC[Notification Service]
            REPORT_SVC[Report Service]
        end
    end

    subgraph "Data Layer"
        MONGO[(MongoDB Atlas)]
        REDIS[(Redis Cache)]
    end

    subgraph "External Services"
        CLOUDINARY[Cloudinary CDN]
        EMAIL[Email Service]
        SMS[SMS Gateway]
    end

    WEB --> REACT
    MOBILE --> REACT
    REACT --> ROUTER
    ROUTER --> STUDENT
    ROUTER --> TEACHER
    ROUTER --> PARENT
    ROUTER --> ADMIN

    STUDENT --> NGINX
    TEACHER --> NGINX
    PARENT --> NGINX
    ADMIN --> NGINX

    NGINX --> API
    API --> AUTH
    AUTH --> RBAC
    RBAC --> RATE
    RATE --> CORS
    CORS --> TENANT

    TENANT --> USER_SVC
    TENANT --> ACADEMIC_SVC
    TENANT --> FEE_SVC
    TENANT --> AI_SVC
    TENANT --> NOTIF_SVC
    TENANT --> REPORT_SVC

    USER_SVC --> MONGO
    ACADEMIC_SVC --> MONGO
    FEE_SVC --> MONGO
    AI_SVC --> MONGO
    NOTIF_SVC --> MONGO
    REPORT_SVC --> MONGO

    USER_SVC -.-> REDIS
    ACADEMIC_SVC -.-> REDIS

    USER_SVC --> CLOUDINARY
    NOTIF_SVC --> EMAIL
    NOTIF_SVC --> SMS
```

## 2. Multi-Tenant Architecture

```mermaid
graph LR
    subgraph "Tenant Isolation Model"
        REQUEST[Incoming Request]
        JWT_DECODE[JWT Decode]
        EXTRACT[Extract schoolId]

        subgraph "School A Data"
            SA_USERS[Users]
            SA_ACADEMIC[Academic]
            SA_FEES[Fees]
        end

        subgraph "School B Data"
            SB_USERS[Users]
            SB_ACADEMIC[Academic]
            SB_FEES[Fees]
        end

        subgraph "School C Data"
            SC_USERS[Users]
            SC_ACADEMIC[Academic]
            SC_FEES[Fees]
        end
    end

    REQUEST --> JWT_DECODE
    JWT_DECODE --> EXTRACT
    EXTRACT -->|schoolId: A| SA_USERS
    EXTRACT -->|schoolId: A| SA_ACADEMIC
    EXTRACT -->|schoolId: A| SA_FEES
    EXTRACT -->|schoolId: B| SB_USERS
    EXTRACT -->|schoolId: B| SB_ACADEMIC
    EXTRACT -->|schoolId: B| SB_FEES
    EXTRACT -->|schoolId: C| SC_USERS
    EXTRACT -->|schoolId: C| SC_ACADEMIC
    EXTRACT -->|schoolId: C| SC_FEES
```

### Tenant Isolation Strategy

**Approach:** Shared Database with Tenant Discriminator

**Implementation:**
- Every collection has `schoolId` field
- All queries filtered by `schoolId`
- JWT token contains `schoolId`
- Middleware injects `schoolId` into request context
- Database indexes on `schoolId` for performance

**Benefits:**
- Cost-effective (single database)
- Easy maintenance
- Simple backups
- Efficient resource utilization

**Security:**
- Tenant ID in JWT (tamper-proof)
- Query-level filtering
- Middleware enforcement
- No cross-tenant data leakage

## 3. Technology Stack

### Frontend Stack
```
┌─────────────────────────────────────┐
│         React 19.1.0                │
├─────────────────────────────────────┤
│  Routing: React Router DOM 7.6.2    │
│  Build: Vite 6.3.5                  │
│  Styling: Tailwind CSS 4.1.10       │
│  State: Context API + Local State   │
│  HTTP: Axios 1.13.2 + Fetch API     │
├─────────────────────────────────────┤
│  UI Libraries:                      │
│  - lucide-react (icons)             │
│  - sweetalert2 (alerts)             │
│  - react-hot-toast (notifications)  │
│  - Chart.js + Recharts (charts)     │
│  - jsPDF (PDF generation)           │
│  - XLSX (Excel export)              │
│  - Quill (rich text)                │
│  - Three.js (3D graphics)           │
└─────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────┐
│      Node.js + Express 5.1.0        │
├─────────────────────────────────────┤
│  Database: MongoDB + Mongoose 8.15.1│
│  Auth: JWT (jsonwebtoken 9.0.2)     │
│  Password: bcryptjs 3.0.2           │
│  Files: Multer 2.0.2                │
│  Storage: Cloudinary 2.8.0          │
│  Security: CORS 2.8.5               │
│  Config: dotenv 16.5.0              │
│  Dev: nodemon 3.1.10                │
└─────────────────────────────────────┘
```

### Database Stack
```
┌─────────────────────────────────────┐
│        MongoDB Atlas                │
├─────────────────────────────────────┤
│  ODM: Mongoose 8.15.1               │
│  Features:                          │
│  - Schema validation                │
│  - Middleware hooks                 │
│  - Aggregation pipeline             │
│  - Indexes (unique, compound)       │
│  - Population (refs)                │
└─────────────────────────────────────┘
```

## 4. System Layers

```mermaid
graph TD
    subgraph "Presentation Layer"
        UI[User Interface Components]
        FORMS[Forms & Validation]
        CHARTS[Charts & Reports]
        TABLES[Data Tables]
    end

    subgraph "Application Layer"
        ROUTING[Client-Side Routing]
        STATE[State Management]
        API_CLIENT[API Client]
        AUTH_CLIENT[Auth Manager]
    end

    subgraph "API Layer"
        ROUTES[REST API Routes]
        CONTROLLERS[Controllers]
        VALIDATION[Input Validation]
    end

    subgraph "Business Logic Layer"
        USER_LOGIC[User Management]
        ACADEMIC_LOGIC[Academic Operations]
        FEE_LOGIC[Fee Processing]
        AI_LOGIC[AI Analytics]
        REPORT_LOGIC[Report Generation]
    end

    subgraph "Data Access Layer"
        MODELS[Mongoose Models]
        QUERIES[Query Builders]
        AGGREGATIONS[Aggregation Pipelines]
    end

    subgraph "Infrastructure Layer"
        DB[Database]
        CACHE[Cache]
        STORAGE[File Storage]
        QUEUE[Job Queue]
    end

    UI --> ROUTING
    FORMS --> STATE
    CHARTS --> API_CLIENT
    TABLES --> API_CLIENT

    ROUTING --> API_CLIENT
    STATE --> API_CLIENT
    AUTH_CLIENT --> API_CLIENT

    API_CLIENT --> ROUTES
    ROUTES --> CONTROLLERS
    CONTROLLERS --> VALIDATION

    VALIDATION --> USER_LOGIC
    VALIDATION --> ACADEMIC_LOGIC
    VALIDATION --> FEE_LOGIC
    VALIDATION --> AI_LOGIC
    VALIDATION --> REPORT_LOGIC

    USER_LOGIC --> MODELS
    ACADEMIC_LOGIC --> MODELS
    FEE_LOGIC --> MODELS
    AI_LOGIC --> QUERIES
    REPORT_LOGIC --> AGGREGATIONS

    MODELS --> DB
    QUERIES --> DB
    AGGREGATIONS --> DB
    MODELS -.-> CACHE
    MODELS -.-> STORAGE
    MODELS -.-> QUEUE
```

## 5. Request Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API Gateway
    participant Auth Middleware
    participant Route Handler
    participant Service Layer
    participant Database
    participant Cache

    Client->>Frontend: User Action
    Frontend->>Frontend: Get JWT from localStorage
    Frontend->>API Gateway: HTTP Request + JWT
    API Gateway->>Auth Middleware: Verify Token

    alt Token Invalid
        Auth Middleware->>Frontend: 401 Unauthorized
        Frontend->>Client: Redirect to Login
    else Token Valid
        Auth Middleware->>Auth Middleware: Extract schoolId & role
        Auth Middleware->>Route Handler: Inject user context
        Route Handler->>Route Handler: Validate input
        Route Handler->>Service Layer: Business logic

        Service Layer->>Cache: Check cache
        alt Cache Hit
            Cache->>Service Layer: Return cached data
        else Cache Miss
            Service Layer->>Database: Query with schoolId filter
            Database->>Service Layer: Return data
            Service Layer->>Cache: Update cache
        end

        Service Layer->>Route Handler: Return result
        Route Handler->>Frontend: JSON Response
        Frontend->>Client: Update UI
    end
```

## 6. Microservices-Ready Architecture

While currently monolithic, the system is structured for easy migration to microservices:

```mermaid
graph TB
    subgraph "API Gateway"
        GATEWAY[Gateway + Auth]
    end

    subgraph "User Service"
        USER_API[User API]
        USER_DB[(User DB)]
    end

    subgraph "Academic Service"
        ACADEMIC_API[Academic API]
        ACADEMIC_DB[(Academic DB)]
    end

    subgraph "Fee Service"
        FEE_API[Fee API]
        FEE_DB[(Fee DB)]
    end

    subgraph "AI Service"
        AI_API[AI API]
        AI_DB[(AI DB)]
        ML_ENGINE[ML Engine]
    end

    subgraph "Notification Service"
        NOTIF_API[Notification API]
        MSG_QUEUE[Message Queue]
    end

    subgraph "Report Service"
        REPORT_API[Report API]
        DATA_WAREHOUSE[(Data Warehouse)]
    end

    GATEWAY --> USER_API
    GATEWAY --> ACADEMIC_API
    GATEWAY --> FEE_API
    GATEWAY --> AI_API
    GATEWAY --> NOTIF_API
    GATEWAY --> REPORT_API

    USER_API --> USER_DB
    ACADEMIC_API --> ACADEMIC_DB
    FEE_API --> FEE_DB
    AI_API --> AI_DB
    AI_API --> ML_ENGINE
    NOTIF_API --> MSG_QUEUE
    REPORT_API --> DATA_WAREHOUSE

    ACADEMIC_API -.->|Event| NOTIF_API
    FEE_API -.->|Event| NOTIF_API
    USER_API -.->|Event| NOTIF_API
```

## 7. Scalability Architecture

```mermaid
graph TB
    subgraph "Load Balancing"
        LB[Load Balancer]
    end

    subgraph "Application Tier - Horizontal Scaling"
        API1[API Server 1]
        API2[API Server 2]
        API3[API Server N]
    end

    subgraph "Caching Tier"
        REDIS_MASTER[Redis Master]
        REDIS_SLAVE1[Redis Slave 1]
        REDIS_SLAVE2[Redis Slave 2]
    end

    subgraph "Database Tier"
        MONGO_PRIMARY[MongoDB Primary]
        MONGO_SECONDARY1[MongoDB Secondary 1]
        MONGO_SECONDARY2[MongoDB Secondary 2]
    end

    subgraph "Storage Tier"
        CDN[Cloudinary CDN]
        S3[S3 Backup]
    end

    LB --> API1
    LB --> API2
    LB --> API3

    API1 --> REDIS_MASTER
    API2 --> REDIS_MASTER
    API3 --> REDIS_MASTER

    REDIS_MASTER --> REDIS_SLAVE1
    REDIS_MASTER --> REDIS_SLAVE2

    API1 --> MONGO_PRIMARY
    API2 --> MONGO_PRIMARY
    API3 --> MONGO_PRIMARY

    MONGO_PRIMARY --> MONGO_SECONDARY1
    MONGO_PRIMARY --> MONGO_SECONDARY2

    API1 --> CDN
    API2 --> CDN
    API3 --> CDN

    CDN -.-> S3
```

## 8. Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Perimeter Security"
            FIREWALL[Firewall]
            WAF[Web Application Firewall]
            DDoS[DDoS Protection]
        end

        subgraph "Application Security"
            HTTPS[HTTPS/TLS]
            CORS_SEC[CORS Policy]
            RATE_SEC[Rate Limiting]
            INPUT_VAL[Input Validation]
        end

        subgraph "Authentication Security"
            JWT_AUTH[JWT Authentication]
            PASSWORD_HASH[Password Hashing]
            PASSWORD_POLICY[Password Policy]
            SESSION_MGT[Session Management]
        end

        subgraph "Authorization Security"
            RBAC_SEC[Role-Based Access]
            TENANT_ISO[Tenant Isolation]
            API_PERM[API Permissions]
        end

        subgraph "Data Security"
            ENCRYPTION[Encryption at Rest]
            SECURE_CONN[Secure Connections]
            AUDIT_LOG[Audit Logging]
            BACKUP[Encrypted Backups]
        end
    end

    FIREWALL --> WAF
    WAF --> DDoS
    DDoS --> HTTPS
    HTTPS --> CORS_SEC
    CORS_SEC --> RATE_SEC
    RATE_SEC --> INPUT_VAL
    INPUT_VAL --> JWT_AUTH
    JWT_AUTH --> PASSWORD_HASH
    PASSWORD_HASH --> PASSWORD_POLICY
    PASSWORD_POLICY --> SESSION_MGT
    SESSION_MGT --> RBAC_SEC
    RBAC_SEC --> TENANT_ISO
    TENANT_ISO --> API_PERM
    API_PERM --> ENCRYPTION
    ENCRYPTION --> SECURE_CONN
    SECURE_CONN --> AUDIT_LOG
    AUDIT_LOG --> BACKUP
```

## 9. Key Architectural Decisions

### Decision 1: Multi-Tenant Strategy
**Choice:** Shared Database with Tenant Discriminator (schoolId)
**Rationale:**
- Cost-effective for small to medium scale
- Simple to maintain
- Easy backups and migrations
- Good performance with proper indexing

**Alternatives Considered:**
- Separate Database per Tenant: Too expensive, complex maintenance
- Schema-based Isolation: PostgreSQL-specific, migration complexity

### Decision 2: Monolithic Architecture
**Choice:** Monolithic with modular design
**Rationale:**
- Simpler deployment
- Lower operational overhead
- Faster development
- Sufficient for current scale

**Future Migration Path:**
- Modular code structure allows easy extraction to microservices
- Clear service boundaries defined

### Decision 3: JWT-Based Authentication
**Choice:** Stateless JWT tokens
**Rationale:**
- Scalable (no session store needed)
- Works well with load balancing
- Self-contained (contains user + tenant context)

**Trade-offs:**
- Cannot revoke tokens before expiry (mitigated with short expiry)
- Token size overhead (minimal impact)

### Decision 4: MongoDB Database
**Choice:** MongoDB with Mongoose ODM
**Rationale:**
- Flexible schema (rapid development)
- Good for hierarchical data (academic structure)
- Excellent aggregation framework (reports)
- Horizontal scaling capability

**Trade-offs:**
- No transactions across collections (acceptable for use case)
- Manual referential integrity

### Decision 5: React SPA
**Choice:** Single Page Application with React
**Rationale:**
- Rich interactive experience
- Fast client-side navigation
- Reusable components
- Large ecosystem

**Trade-offs:**
- Initial load time (mitigated with code splitting)
- SEO challenges (not critical for authenticated app)

## 10. Performance Characteristics

**Target Metrics:**
- API Response Time: < 200ms (p95)
- Page Load Time: < 2s
- Concurrent Users: 10,000+ per school
- Data Retention: 10+ years
- Uptime: 99.9%

**Optimization Strategies:**
- Database indexing on critical fields
- Redis caching for frequently accessed data
- Cloudinary CDN for static assets
- Aggregation pipelines for reports
- Lazy loading for large lists
- Code splitting for frontend

## 11. Architecture Evolution Roadmap

### Phase 1: Current (Monolithic)
- Single application server
- MongoDB database
- Basic caching

### Phase 2: Enhanced Monolith (6 months)
- Redis caching layer
- Database replication
- Horizontal scaling of API servers
- CDN for frontend assets

### Phase 3: Service Extraction (12 months)
- Extract notification service (async)
- Extract report service (CPU-intensive)
- Message queue introduction

### Phase 4: Microservices (18-24 months)
- Full service decomposition
- Event-driven architecture
- API gateway
- Service mesh

---

**Document Version:** 1.0
**Last Updated:** 2026-01-12
**Author:** System Architecture Team
