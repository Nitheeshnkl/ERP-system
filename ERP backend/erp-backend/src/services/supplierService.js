const Supplier = require('../models/Supplier');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

const listSuppliers = async (query) => {
  const { page, limit, skip, search } = getPaginationOptions(query);
  const filter = buildSearchFilter(search, ['name', 'email', 'phone']);
  const total = await Supplier.countDocuments(filter);
  const items = await Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return { items, meta: { ...buildMeta(total, page, limit), search } };
};

const getSupplierById = (id) => Supplier.findById(id);
const createSupplier = (payload) => Supplier.create(payload);
const updateSupplier = (id, payload) => Supplier.findByIdAndUpdate(id, payload, { new: true });
const deleteSupplier = (id) => Supplier.findByIdAndDelete(id);

module.exports = {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
