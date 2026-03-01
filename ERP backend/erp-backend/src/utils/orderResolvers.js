const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || '').trim());

const resolveCustomer = async (value) => {
  const input = String(value || '').trim();
  if (!input) {
    throw new Error('Customer is required');
  }

  if (isObjectId(input)) {
    const customer = await Customer.findById(input).select('_id name email');
    if (customer) return customer;
  }

  const exactPattern = new RegExp(`^${escapeRegex(input)}$`, 'i');
  const customer = await Customer.findOne({
    $or: [{ name: exactPattern }, { email: exactPattern }],
  }).select('_id name email');

  if (!customer) {
    throw new Error(`Customer not found for "${input}"`);
  }

  return customer;
};

const resolveSupplier = async (value) => {
  const input = String(value || '').trim();
  if (!input) {
    throw new Error('Supplier is required');
  }

  if (isObjectId(input)) {
    const supplier = await Supplier.findById(input).select('_id name email');
    if (supplier) return supplier;
  }

  const exactPattern = new RegExp(`^${escapeRegex(input)}$`, 'i');
  const supplier = await Supplier.findOne({
    $or: [{ name: exactPattern }, { email: exactPattern }],
  }).select('_id name email');

  if (!supplier) {
    throw new Error(`Supplier not found for "${input}"`);
  }

  return supplier;
};

const resolveProduct = async (value) => {
  const input = String(value || '').trim();
  if (!input) {
    throw new Error('Product is required');
  }

  if (isObjectId(input)) {
    const product = await Product.findById(input).select('_id name sku price stockQuantity');
    if (product) return product;
  }

  const exactPattern = new RegExp(`^${escapeRegex(input)}$`, 'i');
  const product = await Product.findOne({
    $or: [{ name: exactPattern }, { sku: exactPattern }],
  }).select('_id name sku price stockQuantity');

  if (!product) {
    throw new Error(`Product not found for "${input}"`);
  }

  return product;
};

module.exports = {
  resolveCustomer,
  resolveSupplier,
  resolveProduct,
};
