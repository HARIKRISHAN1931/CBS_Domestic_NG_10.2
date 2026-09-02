import { faker } from '@faker-js/faker';

export const DataHelpers = {
  randomName():    string { return faker.person.firstName() + ' ' + faker.person.lastName(); },
  randomMobile():  string { return faker.string.numeric(10); },
  randomEmail():   string { return faker.internet.email(); },
  randomPAN():     string { return faker.string.alpha({ length: 5, casing: 'upper' }) + faker.string.numeric(4) + faker.string.alpha({ length: 1, casing: 'upper' }); },
  randomAmount(min = 1000, max = 100000): number { return faker.number.int({ min, max }); },
  today():         string { return new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); },
  futureDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-GB').replace(/\//g, '-');
  },
  pastDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toLocaleDateString('en-GB').replace(/\//g, '-');
  },
};
