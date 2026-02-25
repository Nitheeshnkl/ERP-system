const Joi = require('joi');

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().trim().allow(''),
});

const productCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  sku: Joi.string().trim().min(1).required(),
  price: Joi.number().min(0).required(),
  stockQuantity: Joi.number().integer().min(0).default(0),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1),
  sku: Joi.string().trim().min(1),
  price: Joi.number().min(0),
  stockQuantity: Joi.number().integer().min(0),
}).min(1);

const customerCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
});

const customerUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().email(),
  phone: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
}).min(1);

const supplierCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
});

const supplierUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().email(),
  phone: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
}).min(1);

module.exports = {
  paginationQuerySchema,
  productCreateSchema,
  productUpdateSchema,
  customerCreateSchema,
  customerUpdateSchema,
  supplierCreateSchema,
  supplierUpdateSchema,
};
