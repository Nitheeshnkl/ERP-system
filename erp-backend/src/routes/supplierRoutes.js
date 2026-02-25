const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { checkAuth, checkRole } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.use(checkAuth);

router.get('/', checkRole('Admin', 'Purchase'), async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    return success(res, suppliers, 'Suppliers fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

router.get('/:id', checkRole('Admin', 'Purchase'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return error(res, 'Supplier not found', 404);
    return success(res, supplier, 'Supplier fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

router.post('/', checkRole('Admin', 'Purchase'), async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    return success(res, supplier, 'Supplier created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
});

router.put('/:id', checkRole('Admin', 'Purchase'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return error(res, 'Supplier not found', 404);
    return success(res, supplier, 'Supplier updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
});

router.delete('/:id', checkRole('Admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return error(res, 'Supplier not found', 404);
    return success(res, null, 'Supplier deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

module.exports = router;
