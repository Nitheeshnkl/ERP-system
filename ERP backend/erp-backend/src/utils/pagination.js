const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getPaginationOptions = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const requestedLimit = parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  const search = String(query.search || '').trim();

  return { page, limit, skip, search };
};

const buildSearchFilter = (search, fields = []) => {
  if (!search || fields.length === 0) {
    return {};
  }

  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

const buildMeta = (total, page, limit) => ({
  total,
  page,
  pageSize: limit,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

module.exports = {
  DEFAULT_PAGE_SIZE,
  getPaginationOptions,
  buildSearchFilter,
  buildMeta,
};
