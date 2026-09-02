# Migration Guide — CBS10.2 → CBS_Domestic_NG_10.2

## Source Project
`D:\CBS Domestic NG10X\CBS10.2`

## Target Project
`D:\CBS_Domestic_NG_10.2`

---

## Migration Categories

### MIGRATE AS-IS (direct copy, minimal changes)

| Old Path | New Path | Action |
|---|---|---|
| `src/common/components/GridComponent.ts` | `src/common/components/GridComponent.ts` | Copy |
| `src/common/components/ToastComponent.ts` | `src/common/components/ToastComponent.ts` | Copy |
| `src/common/components/ModalComponent.ts` | `src/common/components/ModalComponent.ts` | Copy |
| `src/common/components/MenuNavigation.ts` | `src/common/components/MenuNavigation.ts` | Copy |
| `src/common/components/CalendarComponent.ts` | `src/common/components/CalendarComponent.ts` | Copy |
| `src/common/components/DropdownComponent.ts` | `src/common/components/DropdownComponent.ts` | Copy |
| `src/common/components/HeaderComponent.ts` | `src/common/components/HeaderComponent.ts` | Copy |
| `src/common/components/TableComponent.ts` | `src/common/components/TableComponent.ts` | Copy |
| `src/common/validators/DatabaseValidator.ts` | `src/common/validators/DatabaseValidator.ts` | Copy |
| `src/common/constants/cbs.constants.ts` | `src/common/constants/cbs.constants.ts` | Copy |
| `src/common/enums/domain.enums.ts` | `src/common/enums/domain.enums.ts` | Copy |
| `src/common/types/domain.types.ts` | `src/common/types/domain.types.ts` | Copy |
| `src/framework/logger/logger.ts` | `src/framework/logger/logger.ts` | Copy + add API/PERF levels |
| `src/framework/utils/SharedDataStore.ts` | `src/framework/utils/SharedDataStore.ts` | Copy + add getOrThrow |
| `src/framework/utils/TestDataLoader.ts` | `src/framework/utils/TestDataLoader.ts` | Copy |
| `src/framework/config/selectors.ts` | `src/framework/config/selectors.ts` | Copy |
| `src/framework/config/timeouts.ts` | `src/framework/config/timeouts.ts` | Copy + add PROCESS/EOD |
| `src/framework/database/DatabaseConnectionManager.ts` | `src/framework/database/DatabaseConnectionManager.ts` | Copy + add queryOne |
| `src/framework/base/BasePage.ts` | `src/framework/base/BasePage.ts` | Copy |
| `src/framework/base/BaseRepository.ts` | `src/framework/base/BaseRepository.ts` | Copy |
| `src/framework/base/BaseComponent.ts` | `src/framework/base/BaseComponent.ts` | Copy |
| `src/framework/base/CbsBasePage.ts` | `src/framework/base/CbsBasePage.ts` | Copy |
| `src/framework/base/CbsFormPage.ts` | `src/framework/base/CbsFormPage.ts` | Copy |
| `src/framework/base/CbsUpdatePage.ts` | `src/framework/base/CbsUpdatePage.ts` | Copy |
| `src/framework/base/CbsAuthPage.ts` | `src/framework/base/CbsAuthPage.ts` | Copy |
| `.github/workflows/cbs-automation.yml` | `.github/workflows/cbs-enterprise.yml` | Redesign (8 shards) |

---

### REDESIGN (migrate with significant changes)

| Old Path | New Path | Change |
|---|---|---|
| `src/framework/auth/AuthManager.ts` | `src/framework/auth/AuthManager.ts` | Add multi-bank support, SessionOptions |
| `src/framework/fixtures/fixtures.ts` | `src/framework/fixtures/fixtures.ts` | Use AuthManager.createMakerSession() |
| `src/framework/config/config.ts` | `src/framework/config/config.ts` | Add multi-bank BANKS map, API config |
| `src/framework/reports/ReportHelper.ts` | `src/monitoring/metrics/ExecutionMonitor.ts` | Expand to full metrics + failure analytics |

---

### MODULE MIGRATION

For each existing module under `src/modules/`:

| Old Structure | New Structure |
|---|---|
| `modules/Masters/CustomerManagement/CustomerCreationretail/src/` | `modules/Customer/pages/` |
| `modules/Masters/CustomerManagement/CustomerCreationretail/tests/` | `modules/Customer/tests/smoke/` |
| `modules/Masters/CustomerManagement/CustomerCreationretail/data/` | `modules/Customer/data/` |
| `modules/Masters/AccountsManagement/CustomerAccountCreation/src/` | `modules/CASA/pages/` |
| `modules/Masters/TermDepositManagement/TermDepositContract/src/` | `modules/TD/pages/` |
| `modules/Masters/TermLoans/LoanLimitDetails/src/` | `modules/Loans/pages/` |
| `modules/Transaction/RtgsAndNeft/RtgsneftEntry/src/` | `modules/RTGS/pages/` + `modules/NEFT/pages/` |
| `modules/Administration/TenantAndBranchManagement/*/src/` | `modules/Administration/pages/` |
| `modules/Administration/UserManagement/*/src/` | `modules/Administration/pages/` |

---

### RETIRE (do not migrate)

| Component | Reason |
|---|---|
| `src/framework/auth/LoginPage.ts` | Replaced by AuthManager.createSession() |
| `src/framework/config/global-setup.ts` | Replaced by per-test fresh sessions |
| `src/framework/config/tables.ts` | Inline in repositories |
| `modules/Masters/TermDepositManagement/capture-all-td-screens.spec.ts` | Utility script, not a test |
| `.auth/maker.json` | No session caching in new framework |

---

### NEW COMPONENTS (build fresh)

| Component | Location |
|---|---|
| MakerCheckerWorkflow | `src/workflows/maker-checker/` |
| AuthorizationWorkflow | `src/workflows/authorization/` |
| TransactionWorkflow | `src/workflows/transaction/` |
| ProcessWorkflow | `src/workflows/process/` |
| InterestValidator | `business-validators/interest/` |
| EMIValidator | `business-validators/emi/` |
| NPAValidator | `business-validators/npa/` |
| VoucherValidator | `business-validators/voucher/` |
| MaturityValidator | `business-validators/maturity/` |
| SIValidator | `business-validators/si/` |
| ApiClient | `src/api/client/` |
| CoverageDashboard | `src/coverage/` |
| ExecutionMonitor | `src/monitoring/metrics/` |
| Module Generator | `scripts/generators/create-module.ts` |

---

## Migration Phases

### Phase 1 — Foundation (Week 1-2)
- Set up new project structure
- Migrate all framework layer files
- Migrate all common components
- Validate build compiles

### Phase 2 — Workflows (Week 3)
- Build BaseWorkflow hierarchy
- Build MakerCheckerWorkflow
- Build AuthorizationWorkflow
- Build TransactionWorkflow + ProcessWorkflow

### Phase 3 — Modules (Week 4-8)
- Migrate Customer module (reference implementation)
- Migrate CASA module
- Migrate TD module
- Migrate Loans module
- Migrate RTGS/NEFT module
- Migrate Administration module

### Phase 4 — Validators + Analytics (Week 9-10)
- Build all business validators
- Build coverage dashboard
- Build execution monitor
- Wire Allure reporting

### Phase 5 — CI/CD + Governance (Week 11-12)
- Configure GitHub Actions (8-shard regression)
- Configure Azure DevOps pipeline
- Write all documentation
- Conduct team onboarding
