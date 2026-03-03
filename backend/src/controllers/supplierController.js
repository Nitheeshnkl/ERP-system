const supplierService = require('../services/supplierService');
const { success, error } = require('../utils/response');

exports.listSuppliers = async (req, res, next) => {
  try {
    const { items, meta } = await supplierService.listSuppliers(req.query);
    return success(res, items, 'Suppliers fetched successfully', 200, meta);
  } catch (requestError) {
    return next(requestError);
  }
};

exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    if (!supplier) return error(res, 'Supplier not found', 404);
    return success(res, supplier, 'Supplier fetched successfully');
  } catch (requestError) {
    return next(requestError);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    return success(res, supplier, 'Supplier created successfully', 201);
  } catch (requestError) {
    return next(requestError);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    if (!supplier) return error(res, 'Supplier not found', 404);
    return success(res, supplier, 'Supplier updated successfully');
  } catch (requestError) {
    return next(requestError);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.deleteSupplier(req.params.id);
    if (!supplier) return error(res, 'Supplier not found', 404);
    return success(res, null, 'Supplier deleted successfully');
  } catch (requestError) {
    return next(requestError);
  }
};
