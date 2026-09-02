#!/usr/bin/env ts-node
/**
 * Module Generator — npm run create-module <ModuleName>
 * Scaffolds a complete module with pages, repositories, workflows, validators, models, tests, data.
 */
import * as fs   from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Usage: npm run create-module <ModuleName>');
  process.exit(1);
}

const base = path.join(process.cwd(), 'src', 'modules', moduleName);

const dirs = [
  'pages', 'repositories', 'workflows', 'validators', 'models',
  'tests/sanity', 'tests/smoke', 'tests/regression', 'tests/e2e', 'data',
];

dirs.forEach(d => fs.mkdirSync(path.join(base, d), { recursive: true }));

const files: Record<string, string> = {
  [`models/${moduleName}Model.ts`]: `export interface ${moduleName}Model {
  id?:         string;
  authStatus?: string;
  isActive?:   number;
}

export interface ${moduleName}CreateInput {
  // TODO: add fields
}
`,

  [`pages/${moduleName}CreatePage.ts`]: `import { Page } from '@playwright/test';
import { CbsFormPage } from '../../../framework/base/CbsFormPage';
import { ${moduleName}CreateInput } from '../models/${moduleName}Model';

export class ${moduleName}CreatePage extends CbsFormPage {
  protected readonly menuPath = ['TODO', 'TODO', 'TODO'] as const;

  constructor(page: Page) { super(page); }

  async create(data: ${moduleName}CreateInput): Promise<string> {
    await this.goto();
    await this.openCreateForm();
    // TODO: fill form fields
    return this.save();
  }
}
`,

  [`repositories/${moduleName}Repository.ts`]: `import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { ${moduleName}Model } from '../models/${moduleName}Model';

export class ${moduleName}Repository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findById(id: string): Promise<${moduleName}Model | null> {
    return this.queryOne<${moduleName}Model>(
      \`SELECT * FROM TODO_TABLE WHERE id = @id\`,
      { id }
    );
  }
}
`,

  [`workflows/${moduleName}MakerCheckerWorkflow.ts`]: `import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { ${moduleName}CreatePage } from '../pages/${moduleName}CreatePage';
import { ${moduleName}CreateInput } from '../models/${moduleName}Model';

export class ${moduleName}MakerCheckerWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: ${moduleName}CreateInput) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new ${moduleName}CreatePage(this.makerPage);
    return page.create(this.data);
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new ${moduleName}CreatePage(this.checkerPage);
    return page.authorize(referenceId);
  }
}
`,

  [`validators/${moduleName}Validator.ts`]: `import { DatabaseValidator } from '../../../common/validators/DatabaseValidator';
import { ${moduleName}Repository } from '../repositories/${moduleName}Repository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

export class ${moduleName}Validator {
  private readonly repo: ${moduleName}Repository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new ${moduleName}Repository(db);
  }

  async validateAuthorized(id: string): Promise<void> {
    const record = await this.repo.findById(id);
    new DatabaseValidator(record, \`${moduleName}[\${id}]\`)
      .exists()
      .authStatus('A')
      .isActive(1);
  }
}
`,

  [`tests/smoke/${moduleName.toLowerCase()}-create.spec.ts`]: `import { test, expect } from '../../../framework/fixtures/fixtures';
import { ${moduleName}MakerCheckerWorkflow } from '../workflows/${moduleName}MakerCheckerWorkflow';

test.describe('${moduleName} — Maker Checker @smoke @${moduleName.toLowerCase()}', () => {
  test('should create and authorize ${moduleName}', async ({ makerContext, checkerContext, db }) => {
    const makerPage   = makerContext.pages()[0];
    const checkerPage = checkerContext.pages()[0];

    const workflow = new ${moduleName}MakerCheckerWorkflow(
      { makerPage, checkerPage, db },
      { /* TODO: test data */ }
    );

    const result = await workflow.execute();
    expect(result.checkerToast).toContain('success');
  });
});
`,

  [`index.ts`]: `export { ${moduleName}CreatePage }            from './pages/${moduleName}CreatePage';
export { ${moduleName}Repository }           from './repositories/${moduleName}Repository';
export { ${moduleName}MakerCheckerWorkflow } from './workflows/${moduleName}MakerCheckerWorkflow';
export { ${moduleName}Validator }            from './validators/${moduleName}Validator';
export type { ${moduleName}Model, ${moduleName}CreateInput } from './models/${moduleName}Model';
`,
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(base, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log(`✅ Module "${moduleName}" scaffolded at: ${base}`);
console.log('   Folders: pages, repositories, workflows, validators, models, tests/*, data');
console.log('   Files:   Model, Page, Repository, Workflow, Validator, Spec, index.ts');
