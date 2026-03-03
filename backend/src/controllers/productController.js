const productService = require('../services/productService');
const { success, error } = require('../utils/response');

exports.listProducts = async (req, res, next) => {
  try {
    const { items, meta } = await productService.listProducts(req.query);
    return success(res, items, 'Products fetched successfully', 200, meta);
  } catch (requestError) {
    return next(requestError);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, product, 'Product fetched successfully');
  } catch (requestError) {
    return next(requestError);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return success(res, product, 'Product created successfully', 201);
  } catch (requestError) {
    return next(requestError);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, product, 'Product updated successfully');
  } catch (requestError) {
    return next(requestError);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, null, 'Product deleted successfully');
  } catch (requestError) {
    return next(requestError);
  }
};
