import * as fs from 'fs';
import * as path from 'path';

const STORE_DIR  = path.join(process.cwd(), '.auth');
const STORE_FILE = path.join(STORE_DIR, 'shared-data.json');

function load(): Record<string, unknown> {
  if (!fs.existsSync(STORE_FILE)) return {};
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
}

export const SharedDataStore = {
  set(key: string, value: unknown): void {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    const store = load();
    store[key]  = value;
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  },

  get<T = string>(key: string): T | undefined {
    return load()[key] as T | undefined;
  },

  getOrThrow<T = string>(key: string): T {
    const val = this.get<T>(key);
    if (val === undefined) throw new Error(`SharedDataStore: key "${key}" not found`);
    return val;
  },

  clear(): void {
    if (fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '{}');
  },
};
