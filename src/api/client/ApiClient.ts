import { APIRequestContext, request } from '@playwright/test';
import { config } from '../../framework/config/config';
import { logger } from '../../framework/logger/logger';

export interface ApiResponse<T = unknown> {
  status:  number;
  body:    T;
  headers: Record<string, string>;
}

export class ApiClient {
  private ctx!: APIRequestContext;
  private token = '';

  async init(): Promise<void> {
    this.ctx = await request.newContext({
      baseURL: config.api.baseUrl || config.baseUrl,
      timeout: config.api.timeout,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
  }

  setToken(token: string): void {
    this.token = token;
  }

  private headers(): Record<string, string> {
    return this.token
      ? { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    logger.api(`GET ${path}`);
    const res  = await this.ctx.get(path, { headers: this.headers() });
    const body = await res.json().catch(() => ({})) as T;
    logger.api(`GET ${path} → ${res.status()}`);
    return { status: res.status(), body, headers: res.headers() };
  }

  async post<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    logger.api(`POST ${path}`);
    const res  = await this.ctx.post(path, { headers: this.headers(), data: JSON.stringify(data) });
    const body = await res.json().catch(() => ({})) as T;
    logger.api(`POST ${path} → ${res.status()}`);
    return { status: res.status(), body, headers: res.headers() };
  }

  async put<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    logger.api(`PUT ${path}`);
    const res  = await this.ctx.put(path, { headers: this.headers(), data: JSON.stringify(data) });
    const body = await res.json().catch(() => ({})) as T;
    logger.api(`PUT ${path} → ${res.status()}`);
    return { status: res.status(), body, headers: res.headers() };
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    logger.api(`DELETE ${path}`);
    const res  = await this.ctx.delete(path, { headers: this.headers() });
    const body = await res.json().catch(() => ({})) as T;
    logger.api(`DELETE ${path} → ${res.status()}`);
    return { status: res.status(), body, headers: res.headers() };
  }

  async dispose(): Promise<void> {
    await this.ctx?.dispose();
  }
}
