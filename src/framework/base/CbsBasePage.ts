import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { MenuNavigation } from '../../common/components/MenuNavigation';
import { CBS_SELECTORS } from '../config/selectors';

export abstract class CbsBasePage extends BasePage {
  protected abstract readonly menuPath: readonly [string, string, string];
  protected readonly menu: MenuNavigation;

  constructor(page: Page) {
    super(page);
    this.menu = new MenuNavigation(page);
  }

  protected saveBtn        = () => this.loc(CBS_SELECTORS.SAVE_BTN).first();
  protected confirmSaveBtn = () => this.loc(CBS_SELECTORS.CONFIRM_SAVE_BTN);

  async goto(): Promise<void> {
    await this.menu.navigate(this.menuPath[0], this.menuPath[1], this.menuPath[2]);
  }
}
