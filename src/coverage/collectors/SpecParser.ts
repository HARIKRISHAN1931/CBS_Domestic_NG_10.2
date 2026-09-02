import * as fs from 'fs';

/**
 * Parses spec files to count individual test cases.
 * Counts `test(` and `it(` declarations — handles both Playwright and Jest style.
 */
export class SpecParser {

  static countTests(specFiles: string[]): number {
    return specFiles.reduce((total, file) => total + this.countInFile(file), 0);
  }

  static countInFile(filePath: string): number {
    if (!fs.existsSync(filePath)) return 0;
    const src = fs.readFileSync(filePath, 'utf-8');
    // Match: test('...', or test("...', or it('...', — not test.describe
    const matches = src.match(/^\s*(test|it)\s*\(/gm) ?? [];
    return matches.length;
  }

  static extractTestTitles(specFiles: string[]): string[] {
    const titles: string[] = [];
    for (const file of specFiles) {
      if (!fs.existsSync(file)) continue;
      const src = fs.readFileSync(file, 'utf-8');
      const matches = src.matchAll(/(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]/g);
      for (const m of matches) titles.push(m[1]);
    }
    return titles;
  }
}
