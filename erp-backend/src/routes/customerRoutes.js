const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { checkAuth, checkRole } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.use(checkAuth);

router.get('/', checkRole('Admin', 'Sales'), async (req, res) => {
  try {
    const customers = await Customer.find();
    return success(res, customers, 'Customers fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

router.get('/:id', checkRole('Admin', 'Sales'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, customer, 'Customer fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

router.post('/', checkRole('Admin', 'Sales'), async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    return success(res, customer, 'Customer created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
});

router.put('/:id', checkRole('Admin', 'Sales'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, customer, 'Customer updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
});

router.delete('/:id', checkRole('Admin'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, null, 'Customer deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
});

module.exports = router;
