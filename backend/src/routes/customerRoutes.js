const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validation');
const {
  paginationQuerySchema,
  customerCreateSchema,
  customerUpdateSchema,
} = require('../validations/resourceSchemas');
const customerController = require('../controllers/customerController');

router.use(checkAuth);

router.get(
  '/',
  checkRole('Admin', 'Sales'),
  validate(paginationQuerySchema, 'query'),
  customerController.listCustomers
);

router.get(
  '/:id',
  checkRole('Admin', 'Sales'),
  validate(objectIdSchema, 'params'),
  customerController.getCustomer
);

router.post(
  '/',
  checkRole('Admin', 'Sales'),
  validate(customerCreateSchema),
  customerController.createCustomer
);

router.put(
  '/:id',
  checkRole('Admin', 'Sales'),
  validate(objectIdSchema, 'params'),
  validate(customerUpdateSchema),
  customerController.updateCustomer
);

router.delete(
  '/:id',
  checkRole('Admin'),
  validate(objectIdSchema, 'params'),
  customerController.deleteCustomer
);

module.exports = router;
