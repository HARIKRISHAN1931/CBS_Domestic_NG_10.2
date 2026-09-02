# CBS Domestic NG Enterprise Automation Framework

## Framework Overview

Enterprise-grade Playwright + TypeScript automation framework for CBS 10.2 products.

- 10,000+ test case capacity
- Multi-bank: BDCC, BCCB, extensible to future banks
- Multi-environment: QA, UAT, SIT, PROD
- UI + API + DB testing
- Maker-Checker workflow automation
- EOD/BOD process automation
- Allure reporting + GitHub Pages

## Quick Start

```bash
npm install
npx playwright install chromium
npm run test:smoke
```

## Documentation

| Document | Description |
|---|---|
| [Architecture.md](docs/Architecture.md) | Layer design, workflow hierarchy, module standard |
| [DeveloperGuide.md](docs/DeveloperGuide.md) | Setup, running tests, writing tests |
| [MigrationGuide.md](docs/MigrationGuide.md) | Old-to-new path mapping, migration phases |
| [CodingStandards.md](docs/CodingStandards.md) | Naming, patterns, forbidden practices |

## Modules

| Module | Status | Tests |
|---|---|---|
| Customer | Active | smoke, regression |
| CASA | Scaffolded | — |
| TD | Scaffolded | — |
| Loans | Scaffolded | — |
| RTGS | Scaffolded | — |
| NEFT | Scaffolded | — |
| NACH | Scaffolded | — |
| GL | Scaffolded | — |
| Locker | Scaffolded | — |
| Administration | Scaffolded | — |
| Configurations | Scaffolded | — |
| Reports | Scaffolded | — |
| Processes | Scaffolded | — |

## Create a New Module

```bash
npm run create-module <ModuleName>
```
