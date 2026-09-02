import * as fs   from 'fs';
import * as path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserConfig {
  username: string;
  password: string;
}

export interface BranchConfig {
  code:     string;
  name:     string;
  clerk:    string;
  manager:  string;
  password: string;
}

export interface ProductScheme {
  code:    string;
  name:    string;
  schemes: string[];
}

export interface ProductConfig {
  CASA?: Record<string, ProductScheme>;
  TD?:   Record<string, ProductScheme>;
  LOAN?: Record<string, ProductScheme>;
}

export interface RulesConfig {
  minimumBalance?:     Record<string, number>;
  maxWithdrawal?:      Record<string, number>;
  tdMinAmount?:        number;
  tdMaxAmount?:        number;
  loanMinAmount?:      number;
  loanMaxAmount?:      number;
  rtgsMinAmount?:      number;
  neftMinAmount?:      number;
  modeOfOperation?:    string[];
  [key: string]:       unknown;
}

export interface MenuEntry {
  top:  string;
  sub:  string;
  item: string;
  tag?: string;
}

export interface ScreenConfig {
  screenId: string;
  title:    string;
}

// ── ConfigManager ─────────────────────────────────────────────────────────────

class ConfigManagerClass {
  private readonly envKey: string;
  private readonly configRoot: string;

  private _users?:       Record<string, UserConfig>;
  private _branches?:    Record<string, BranchConfig>;
  private _products?:    ProductConfig;
  private _rules?:       RulesConfig;
  private _menuMapping?: Record<string, MenuEntry>;
  private _screens?:     Record<string, ScreenConfig>;
  private _features?:    Record<string, boolean>;

  constructor() {
    const bank = (process.env.BANK ?? 'BDCC').trim().toUpperCase();
    const env  = (process.env.ENV  ?? 'QA').trim().toUpperCase();
    this.envKey     = `${bank}-${env}`;                                    // e.g. BDCC-QA
    this.configRoot = path.resolve(process.cwd(), 'config', 'environments', this.envKey);

    if (!fs.existsSync(this.configRoot)) {
      throw new Error(`Config directory not found: ${this.configRoot}`);
    }
  }

  private load<T>(file: string): T {
    const filePath = path.join(this.configRoot, file);
    if (!fs.existsSync(filePath)) throw new Error(`Config file not found: ${filePath}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  }

  private get users():       Record<string, UserConfig>   { return this._users       ??= this.load('users.json'); }
  private get branches():    Record<string, BranchConfig> { return this._branches    ??= this.load('branches.json'); }
  private get products():    ProductConfig                 { return this._products    ??= this.load('products.json'); }
  private get rules():       RulesConfig                   { return this._rules       ??= this.load('rules.json'); }
  private get menuMapping(): Record<string, MenuEntry>     { return this._menuMapping ??= this.load('menu-mapping.json'); }
  private get screens():     Record<string, ScreenConfig>  { return this._screens     ??= this.load('screens.json'); }
  private get features():    Record<string, boolean>       { return this._features    ??= this.load('feature-flags.json'); }

  // ── Public API ──────────────────────────────────────────────────────────────

  getEnv(): string { return this.envKey; }

  getUser(role: 'maker' | 'checker' | 'viewer'): UserConfig {
    const user = this.users[role];
    if (!user) throw new Error(`User role "${role}" not found in ${this.envKey}/users.json`);
    if (!user.username) throw new Error(`Username for role "${role}" is empty in ${this.envKey}/users.json`);
    return user;
  }

  getBranch(key: string): BranchConfig {
    const branch = this.branches[key];
    if (!branch) throw new Error(`Branch "${key}" not found in ${this.envKey}/branches.json`);
    return branch;
  }

  getAllBranches(): BranchConfig[] {
    return Object.values(this.branches);
  }

  getProduct(module: 'CASA' | 'TD' | 'LOAN', code: string): ProductScheme {
    const moduleProducts = this.products[module];
    if (!moduleProducts) throw new Error(`Module "${module}" not found in ${this.envKey}/products.json`);
    const product = moduleProducts[code];
    if (!product) throw new Error(`Product "${code}" not found under module "${module}" in ${this.envKey}/products.json`);
    return product;
  }

  getRule<T = unknown>(key: string): T {
    const rule = this.rules[key];
    if (rule === undefined) throw new Error(`Rule "${key}" not found in ${this.envKey}/rules.json`);
    return rule as T;
  }

  getMenuMapping(screenId: string): MenuEntry {
    const entry = this.menuMapping[screenId];
    if (!entry) throw new Error(`No menu mapping for screen "${screenId}" in ${this.envKey}/menu-mapping.json`);
    return entry;
  }

  getScreen(screenId: string): ScreenConfig {
    const screen = this.screens[screenId];
    if (!screen) throw new Error(`Screen "${screenId}" not found in ${this.envKey}/screens.json`);
    return screen;
  }

  getFeatureFlag(flag: string): boolean {
    return this.features[flag] ?? false;
  }

  getAllScreenIds(): string[] {
    return Object.keys(this.screens);
  }

  /** @deprecated Use getMenuMapping(screenId) instead */
  getMenu(key: string): MenuEntry {
    return this.getMenuMapping(key);
  }

  // ── Test Data Path ──────────────────────────────────────────────────────────

  getTestDataPath(fileName: string): string {
    return path.resolve(process.cwd(), 'testdata', this.envKey, fileName);
  }
}

// Singleton — one instance per process
export const ConfigManager = new ConfigManagerClass();
