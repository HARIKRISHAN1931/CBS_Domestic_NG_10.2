import { Page } from '@playwright/test';
import { ConfigManager } from './ConfigManager';
import { MenuNavigation } from '../../common/components/MenuNavigation';

/**
 * Central screen registry.
 *
 * Tests and page objects always call:
 *   await ScreenRegistry.navigate(page, 'PRDACNOMST');
 *
 * Never:
 *   await nav.navigate('Masters', 'accountmgmt', 'PRDACNOMST');
 *
 * The menu path is resolved from config/environments/{BANK}-{ENV}/menu-mapping.json.
 * If a bank has a different path for the same screen, only the JSON changes — no test code changes.
 */
export class ScreenRegistry {
  static async navigate(page: Page, screenId: string): Promise<void> {
    const mapping = ConfigManager.getMenuMapping(screenId);
    const nav     = new MenuNavigation(page);
    await nav.navigate(mapping.top, mapping.sub, mapping.item);
  }

  static getTitle(screenId: string): string {
    return ConfigManager.getScreen(screenId).title;
  }

  static isEnabled(screenId: string): boolean {
    const flag = SCREEN_FEATURE_FLAGS[screenId];
    if (!flag) return true;
    return ConfigManager.getFeatureFlag(flag);
  }

  static getAllScreenIds(): string[] {
    return ConfigManager.getAllScreenIds();
  }
}

/**
 * Maps screenId → feature flag key.
 * Only screens that can be disabled need an entry here.
 */
const SCREEN_FEATURE_FLAGS: Record<string, string> = {
  KCCLOANSANCTION:          'kcc',
  KCCLOANDISBUR:            'kcc',
  KCCREPAYMENT:             'kcc',
  MEMBERLINKAGEMASTER:      'kcc',
  KCCSHAREPARAMETER:        'kcc',
  CROPWISEMAINTENANCE:      'kcc',
  LOCKERISSUEREG:           'locker',
  LOCKEROPERATIONMST:       'locker',
  LOCKERBREAKOPENREGISTER:  'locker',
  LOCKERSURRENDERMST:       'locker',
  SHAREMEMBERMAINTAIN:      'shares',
  SHAREALLOTMENT:           'shares',
  SHARECLOSURE:             'shares',
  SHAREDIVTRFINST:          'shares',
  PIGMYCUSTAGENTLINKMST:    'pigmy',
  AGENTREGMSTR:             'pigmy',
  GoldLoanApplnMst:         'goldLoan',
  PACKETPRDAPPRAISERDTLS:   'goldLoan',
  TRANSACTIONMST:           'rtgs',
  NEFTOUT:                  'neft',
  DBTLFILEUPLOAD:           'nach',
  FILEGENERATIONDBTL:       'nach',
  NACHUPLOADLINK:           'nach',
  DEALPURCHASE:             'treasury',
  DEALSALE:                 'treasury',
  DEALPENDFORCONFIRM:       'treasury',
  DELERPARDMST:             'forex',
  DEALCUSTLIMITMST:         'forex',
  FXDCUSTCURACCT:           'forex',
  IMPORTBILLS:              'importBills',
  FXIMPORTINVOICEDETAILS:   'importBills',
  ExportBillsMst:           'exportBills',
  AGENCYDTLS:               'bancassurance',
  AGENTMASTER:              'bancassurance',
  ISSUANCE:                 'bancassurance',
};
