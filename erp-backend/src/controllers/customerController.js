const customerService = require('../services/customerService');
const { success, error } = require('../utils/response');

exports.listCustomers = async (req, res, next) => {
  try {
    const { items, meta } = await customerService.listCustomers(req.query);
    return success(res, items, 'Customers fetched successfully', 200, meta);
  } catch (requestError) {
    return next(requestError);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, customer, 'Customer fetched successfully');
  } catch (requestError) {
    return next(requestError);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return success(res, customer, 'Customer created successfully', 201);
  } catch (requestError) {
    return next(requestError);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, customer, 'Customer updated successfully');
  } catch (requestError) {
    return next(requestError);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, null, 'Customer deleted successfully');
  } catch (requestError) {
    return next(requestError);
  }
};
