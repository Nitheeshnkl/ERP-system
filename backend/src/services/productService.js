const Product = require('../models/Product');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

const listProducts = async (query) => {
  const { page, limit, skip, search } = getPaginationOptions(query);
  const filter = buildSearchFilter(search, ['name', 'sku']);
  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return { items, meta: { ...buildMeta(total, page, limit), search } };
};

const getProductById = (id) => Product.findById(id);
const createProduct = (payload) => Product.create(payload);
const updateProduct = (id, payload) => Product.findByIdAndUpdate(id, payload, { new: true });
const deleteProduct = (id) => Product.findByIdAndDelete(id);

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
