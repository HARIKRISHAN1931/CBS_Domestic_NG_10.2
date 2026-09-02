/** CBS date format: dd-MM-yyyy */
export class DateHelper {
  static readonly FORMAT = 'dd-MM-yyyy';

  static format(date: Date): string {
    const d  = String(date.getDate()).padStart(2, '0');
    const m  = String(date.getMonth() + 1).padStart(2, '0');
    const y  = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  static today(): string { return this.format(new Date()); }

  static minusYears(years: number): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return this.format(d);
  }

  static minusDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return this.format(d);
  }

  static plusDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return this.format(d);
  }

  /** Returns true if the given CBS-format date string represents age >= 18 */
  static isAdult(dobStr: string): boolean {
    const [dd, mm, yyyy] = dobStr.split('-').map(Number);
    const dob  = new Date(yyyy, mm - 1, dd);
    const age  = new Date();
    age.setFullYear(age.getFullYear() - 18);
    return dob <= age;
  }
}
