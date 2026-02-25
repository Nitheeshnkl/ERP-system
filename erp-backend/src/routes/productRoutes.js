const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { checkAuth, checkRole } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

router.use(checkAuth);

router.get('/', checkRole('Admin', 'Sales', 'Purchase', 'Inventory'), async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req.query);
    const filter = buildSearchFilter(search, ['name', 'sku']);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    return success(res, products, 'Products fetched successfully', 200, {
      ...buildMeta(total, page, limit),
      search,
    });
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

router.get('/:id', checkRole('Admin', 'Sales', 'Purchase', 'Inventory'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, product, 'Product fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

router.post('/', checkRole('Admin', 'Inventory'), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    return success(res, product, 'Product created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
});

router.put('/:id', checkRole('Admin', 'Inventory'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return error(res, 'Product not found', 404);
    return success(res, product, 'Product updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
});

router.delete('/:id', checkRole('Admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, null, 'Product deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

module.exports = router;
