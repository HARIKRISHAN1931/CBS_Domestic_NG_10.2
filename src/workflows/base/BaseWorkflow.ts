import { Page, BrowserContext } from '@playwright/test';
import { logger } from '../../framework/logger/logger';
import { SharedDataStore } from '../../framework/utils/SharedDataStore';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';

export interface WorkflowContext {
  makerPage?:   Page;
  checkerPage?: Page;
  makerCtx?:    BrowserContext;
  checkerCtx?:  BrowserContext;
  db?:          DatabaseConnectionManager;
  bankCode?:    string;
}

export abstract class BaseWorkflow {
  protected readonly ctx: WorkflowContext;
  protected readonly store = SharedDataStore;

  constructor(ctx: WorkflowContext) {
    this.ctx = ctx;
  }

  protected get makerPage(): Page {
    if (!this.ctx.makerPage) throw new Error('makerPage not provided in WorkflowContext');
    return this.ctx.makerPage;
  }

  protected get checkerPage(): Page {
    if (!this.ctx.checkerPage) throw new Error('checkerPage not provided in WorkflowContext');
    return this.ctx.checkerPage;
  }

  protected get db(): DatabaseConnectionManager {
    if (!this.ctx.db) throw new Error('db not provided in WorkflowContext');
    return this.ctx.db;
  }

  protected log(msg: string): void { logger.info(`[${this.constructor.name}] ${msg}`); }
  protected pass(msg: string): void { logger.pass(`[${this.constructor.name}] ${msg}`); }
  protected fail(msg: string): void { logger.fail(`[${this.constructor.name}] ${msg}`); }
}
