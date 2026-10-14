# Pehchaan (SKIT021) - SaaS Deployment & Operations Manual

This guide describes the complete procedure for deploying, configuring, migrating, backing up, and operating the Pehchaan multi-tenant SaaS platform on Render or any cloud container infrastructure.

---

## 1. System Architecture

```
                       ┌────────────────────────────────────────┐
                       │           Render / CDN Edge            │
                       └───────────────────┬────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                        ▼                                     ▼
           ┌────────────────────────┐            ┌────────────────────────┐
           │ Static Frontend (Vite) │            │ Backend Web Service    │
           │ skit021-student-platf. │            │ pehchaan-backend (Node)│
           └────────────────────────┘            └───────────┬────────────┘
                                                             │
                                         ┌───────────────────┴───────────────────┐
                                         │                                       │
                                         ▼                                       ▼
                              ┌──────────────────────┐               ┌──────────────────────┐
                              │ Managed PostgreSQL   │               │ Private File Storage │
                              │ pehchaan-postgres    │               │ /var/data/uploads    │
                              └──────────────────────┘               └──────────────────────┘
```

---

## 2. Environment Variables Inventory

### Backend Service (`pehchaan-backend`)

| Variable Name | Required | Default / Format | Description |
|---|---|---|---|
| `PORT` | Yes | `10000` | Port on which Express listens |
| `NODE_ENV` | Yes | `production` | Set to `production` for production deployments |
| `API_PREFIX` | Yes | `/api/v1` | URL namespace for REST APIs |
| `DATABASE_URL` | Yes | `postgresql://...` | Connection string to PostgreSQL instance |
| `CORS_ORIGIN` | Yes | `https://pehchaan-skit021.onrender.com` | Comma-separated allowed frontend origins |
| `SESSION_SECRET` | Yes | Random 32+ chars | Secret for signing session cookies |
| `JWT_SECRET` | Yes | Random 32+ chars | Secret for cryptographic JWT verification |
| `COOKIE_SECURE` | Yes | `true` | Requires HTTPS for session cookies |
| `COOKIE_SAME_SITE` | Yes | `lax` | SameSite cookie policy |
| `STORAGE_PROVIDER` | Yes | `local` | `local` disk storage or `s3` compatible |
| `STORAGE_LOCAL_DIR` | Yes | `/var/data/uploads` | Path to persistent private evidence store |

### Frontend Static Site (`skit021-student-platform`)

| Variable Name | Required | Example | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `https://pehchaan-backend.onrender.com/api/v1` | Base URL pointing to live backend API |

---

## 3. Database Migrations

Pehchaan uses **Prisma Migrations** for version-controlled, reproducible database schema management.

### Running Migrations in Production:
```bash
cd server
npx prisma migrate deploy
```
This applies all unapplied SQL migrations located in `server/prisma/migrations/` sequentially without destructive automatic table dropping.

### Seeding Initial Institutional Data:
```bash
cd server
npm run prisma:seed
```
This safely provisions the default institution (`SKIT-021`), default administrative and coordinator accounts, academic departments, initial student rosters, activities, and initial review records.

---

## 4. Secure Initial Administrator Provisioning

When `prisma:seed` runs, default credentials are initialized for initial platform onboarding:

- **Institutional Admin:** `studentaffairs@skit.ac.in`
- **Faculty Coordinator:** `cse.coordinator@skit.ac.in`
- **Student User:** `aarav.patel.22@skit.ac.in`
- **Accreditation Auditor:** `auditor@rajasthan-gov.ac.in`
- **Default Seed Password:** `DemoPassword2024!`

> **Security Advisory:** After initial deployment, administrators should immediately change their password using the `/api/v1/auth/change-password` endpoint or the Settings portal.

---

## 5. Health Check & Monitoring

The platform exposes dual health endpoints:
- Root: `GET /health`
- API Namespace: `GET /api/v1/health`

### Health Check Response:
```json
{
  "status": "UP",
  "timestamp": "2026-10-14T11:34:00.000Z",
  "database": "CONNECTED",
  "uptime": 1420.5,
  "environment": "production"
}
```
If the database connection is interrupted, the endpoint returns HTTP `503 Service Unavailable` with `"database": "DISCONNECTED"`, allowing Render or Kubernetes orchestrators to automatically route traffic or restart containers.

---

## 6. Backup and Restore Procedures

### Database Backup (`pg_dump`):
```bash
# Dump compressed PostgreSQL database to timestamped file
pg_dump -h <HOST> -U <USER> -d pehchaan -F c -b -v -f "pehchaan_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Database Restore (`pg_restore`):
```bash
# Restore from dump file
pg_restore -h <HOST> -U <USER> -d pehchaan -v --clean "pehchaan_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 7. Rollback Procedure

1. **Frontend Rollback:** In the Render dashboard under `skit021-student-platform` > **Deploys**, select the previous green deploy and click **Rollback to this deploy**.
2. **Backend Rollback:** Under `pehchaan-backend` > **Deploys**, select the prior release.
3. **Database Rollback:** If a migration must be reverted, verify the down-migration script before applying changes to live institutional records.
