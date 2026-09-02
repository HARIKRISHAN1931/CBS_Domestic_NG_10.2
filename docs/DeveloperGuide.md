# Developer Guide — CBS Enterprise Automation Framework

## Quick Start

```bash
cd D:\CBS_Domestic_NG_10.2
npm install
npx playwright install chromium

# Copy and configure environment
copy .env.qa .env.qa.local
# Edit .env.qa with your server URL and credentials

# Run sanity tests
npm run test:sanity

# Run smoke tests
npm run test:smoke

# Open Playwright UI
npm run test:ui
```

## Environment Setup

Set `ENV=qa` (default) or `ENV=uat` before running tests.

```bash
set ENV=uat && npm run test:smoke
```

## Running Specific Modules

```bash
# Customer module only
npm run test:customer

# RTGS + NEFT
npx playwright test --grep "@rtgs|@neft"

# Single test file
npx playwright test src/modules/Customer/tests/smoke/customer-create.spec.ts
```

## Parallel Execution

```bash
# 10 workers
set PARALLEL=true && npm test

# Custom worker count
set WORKERS=5 && npm test
```

## Creating a New Module

```bash
npm run create-module GL
```

This generates the complete module structure under `src/modules/GL/`.

## Writing a Maker-Checker Test

```typescript
import { test, expect } from '../../../framework/fixtures/fixtures';
import { CustomerMakerCheckerWorkflow } from '../workflows/CustomerMakerCheckerWorkflow';

test('create and authorize customer @smoke @customer', async ({
  makerContext, checkerContext, db,
}) => {
  const workflow = new CustomerMakerCheckerWorkflow(
    { makerPage: makerContext.pages()[0], checkerPage: checkerContext.pages()[0], db },
    { firstName: 'Test', lastName: 'User', customerType: 'R' }
  );
  const result = await workflow.execute();
  expect(result.checkerToast).toContain('success');
});
```

## DB Validation Pattern

```typescript
import { DatabaseValidator } from '@common/validators/DatabaseValidator';

const record = await repo.findByName('Test User');
new DatabaseValidator(record, 'Customer[Test User]')
  .exists()
  .authStatus('A')
  .isActive(1)
  .fieldNotEmpty('customerId');
```

## Business Validator Pattern

```typescript
import { InterestValidator } from '@validators/interest/InterestValidator';

new InterestValidator()
  .validateSimpleInterest(100000, 7.5, 12, actualInterest)
  .validateMaturityAmount(100000, actualInterest, actualMaturity)
  .validateUiVsDb(uiInterest, dbInterest)
  .assert();
```

## Allure Reporting

```bash
npm run allure:generate
npm run allure:open
```

## Switching Banks

```bash
# Run tests against BCCB bank
set BANK=BCCB && npm run test:smoke
```
