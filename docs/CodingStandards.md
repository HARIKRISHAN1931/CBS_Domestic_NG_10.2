# Coding Standards — CBS Enterprise Automation Framework

## File Naming
- Pages:       `<ScreenName>Page.ts`         e.g. `CustomerCreatePage.ts`
- Repositories: `<Module>Repository.ts`      e.g. `CustomerRepository.ts`
- Workflows:   `<Module>MakerCheckerWorkflow.ts`
- Validators:  `<Module>Validator.ts`
- Models:      `<Module>Model.ts`
- Tests:       `<feature>-<action>.spec.ts`  e.g. `customer-create.spec.ts`

## Test Tags (mandatory)
Every test must have at minimum:
- A suite tag: `@sanity` | `@smoke` | `@regression` | `@e2e`
- A module tag: `@customer` | `@casa` | `@td` | `@loan` | `@rtgs` | `@neft` | `@eod` | `@npa`

```typescript
test.describe('Customer Creation @smoke @customer', () => { ... });
```

## Page Object Rules
- One class per CBS screen
- Extend `CbsFormPage` for create screens
- Extend `CbsUpdatePage` for edit screens
- Extend `CbsAuthPage` for checker-only screens
- `menuPath` must be `readonly [string, string, string]`
- No assertions in page objects — only interactions

## Repository Rules
- Extend `BaseRepository`
- All SQL in repository methods, never in tests or pages
- Use parameterized queries always — never string concatenation
- Method names: `findBy*`, `getBy*`, `getPending*`, `getCount*`

## Workflow Rules
- Extend the appropriate workflow base class
- `makerAction()` returns the reference ID (toast text or extracted ID)
- `checkerAction(referenceId)` returns the authorization toast
- `validateDb(referenceId)` is optional but recommended

## Validator Rules
- Business validators live in `business-validators/`
- Module validators live in `modules/<Module>/validators/`
- Use fluent chaining: `.exists().authStatus('A').isActive(1)`
- Always call `.assert()` at the end

## Test Data Rules
- JSON files in `modules/<Module>/data/`
- Use `@faker-js/faker` for dynamic data
- Never hardcode customer names, account numbers, or amounts in tests
- Shared reference data (branch codes, product codes) in `testdata/seeds/`

## Import Rules
- Use path aliases defined in `tsconfig.json`
- `@framework/*` for framework layer
- `@common/*` for common components
- `@workflows/*` for workflow layer
- `@modules/*` for module imports

## Forbidden Patterns
- No `page.waitForTimeout()` except in MenuNavigation (CBS-specific)
- No hardcoded credentials — always from `config`
- No `console.log()` — use `logger.*`
- No assertions in page objects
- No DB queries in test files — use repositories
- No `any` type — use proper TypeScript types
