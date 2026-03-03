const Customer = require('../models/Customer');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

const listCustomers = async (query) => {
  const { page, limit, skip, search } = getPaginationOptions(query);
  const filter = buildSearchFilter(search, ['name', 'email', 'phone']);
  const total = await Customer.countDocuments(filter);
  const items = await Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return { items, meta: { ...buildMeta(total, page, limit), search } };
};

const getCustomerById = (id) => Customer.findById(id);
const createCustomer = (payload) => Customer.create(payload);
const updateCustomer = (id, payload) => Customer.findByIdAndUpdate(id, payload, { new: true });
const deleteCustomer = (id) => Customer.findByIdAndDelete(id);

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
