const { getPaginationOptions, buildSearchFilter, buildMeta, DEFAULT_PAGE_SIZE } = require('../src/utils/pagination');

describe('pagination utility', () => {
  test('uses default page size 10 when no params provided', () => {
    const options = getPaginationOptions({});
    expect(options.page).toBe(1);
    expect(options.limit).toBe(DEFAULT_PAGE_SIZE);
    expect(options.skip).toBe(0);
  });

  test('builds case-insensitive search filter for text fields', () => {
    const filter = buildSearchFilter('acme', ['name', 'email']);
    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0].name).toBeInstanceOf(RegExp);
    expect(filter.$or[0].name.flags).toContain('i');
  });

  test('builds response meta with total/page/pageSize/totalPages', () => {
    const meta = buildMeta(25, 2, 10);
    expect(meta).toEqual({ total: 25, page: 2, pageSize: 10, totalPages: 3 });
  });
});
