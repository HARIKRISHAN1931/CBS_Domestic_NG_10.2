# CBS Domestic NG Enterprise Automation Framework — Architecture

## Overview

Strategic automation platform for CBS 10.2 products. Designed for 10,000+ test cases, multiple banks, multiple engineers, multiple environments.

---

## Architecture Layers

```
Test (*.spec.ts)
    ↓  uses
Fixture (fixtures.ts)
    ↓  provides Page + DB + Context
Workflow (MakerCheckerWorkflow / TransactionWorkflow / ProcessWorkflow)
    ↓  orchestrates
Page (CbsFormPage / CbsUpdatePage / CbsAuthPage)
    ↓  uses
Component (GridComponent / ModalComponent / ToastComponent / MenuNavigation)
    ↓  interacts with
Repository (CustomerRepository / CASARepository / ...)
    ↓  executes via
Database Layer (DatabaseConnectionManager → SQL Server / Oracle)
    ↓  results validated by
Business Validator (InterestValidator / EMIValidator / NPAValidator / ...)
    ↓  results recorded in
Coverage Dashboard (CoverageDashboard.ts)
    ↓  reported via
Allure Report + GitHub Pages
```

---

## Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Test | Declares test intent, tags, data. No logic. |
| Fixture | Provides authenticated sessions (maker/checker), DB connection. |
| Workflow | Orchestrates multi-step business flows (Maker→Checker, EOD, Transaction). |
| Page | Encapsulates screen interactions. One class per CBS screen. |
| Component | Reusable UI widgets (Grid, Toast, Modal, Calendar, Dropdown). |
| Repository | All DB queries for a module. Extends BaseRepository. |
| Database | Connection pool management. Supports SQL Server + Oracle. |
| Business Validator | Domain-specific calculation validation (interest, EMI, NPA, voucher). |
| Coverage Dashboard | Tracks which features are covered, partial, or missing. |
| Allure Report | Execution results, steps, screenshots, videos. |

---

## Workflow Inheritance

```
BaseWorkflow
├── MakerCheckerWorkflow    (Maker creates → Checker authorizes)
├── AuthorizationWorkflow   (Checker-only authorization flows)
├── TransactionWorkflow     (RTGS / NEFT / NACH / CASA transactions)
└── ProcessWorkflow         (EOD / BOD / batch processes)
```

---

## Module Standard Structure

Every module follows:

```
ModuleName/
├── pages/          ← Screen interaction classes
├── repositories/   ← DB query classes
├── workflows/      ← Business flow orchestration
├── validators/     ← UI + DB cross-validation
├── models/         ← TypeScript interfaces/types
├── tests/
│   ├── sanity/     ← @sanity — critical path, < 5 tests
│   ├── smoke/      ← @smoke — happy path, < 20 tests
│   ├── regression/ ← @regression — full coverage
│   └── e2e/        ← @e2e — end-to-end business scenarios
├── data/           ← Test data files (JSON/XLSX)
└── index.ts        ← Public exports
```

---

## Multi-Bank Strategy

Banks are configured in `src/framework/config/config.ts`:

```typescript
const BANKS = {
  BDCC: { bankCode: 'BDCC', tenantId: '139', appPath: '...' },
  BCCB: { bankCode: 'BCCB', tenantId: '140', appPath: '...' },
};
```

Switch bank via `BANK=BCCB` environment variable. All sessions, URLs, and tenant IDs resolve automatically.

---

## Tag Strategy

| Tag | Purpose | Count Target |
|---|---|---|
| @sanity | Critical path only | < 50 |
| @smoke | Happy path per module | < 200 |
| @regression | Full module coverage | Unlimited |
| @e2e | Cross-module business flows | < 100 |
| @customer | Customer module | — |
| @casa | CASA module | — |
| @td | Term Deposit module | — |
| @loan | Loans module | — |
| @rtgs | RTGS module | — |
| @neft | NEFT module | — |
| @eod | EOD process | — |
| @npa | NPA classification | — |

---

## CI/CD Pipeline

```
Push → Sanity (fast, < 5 min)
     → Smoke (< 15 min)
     → Regression (8 shards parallel, nightly)
     → Allure Report → GitHub Pages
```
