import { config } from '../config/config';
import { logger } from '../logger/logger';

export default async function globalSetup(): Promise<void> {
  logger.info(`CBS Enterprise Framework — Global Setup`);
  logger.info(`Bank        : ${config.bank.bankCode} — ${config.bank.bankName}`);
  logger.info(`Server      : ${config.bank.baseUrl}  (port ${config.bank.port})`);
  logger.info(`Tenant ID   : ${config.bank.tenantId}`);
  logger.info(`Environment : ${config.env}`);
  logger.info(`DB Host     : ${config.db.host || '(not configured)'}`);
}
