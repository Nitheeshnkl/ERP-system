const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validation');
const {
  paginationQuerySchema,
  supplierCreateSchema,
  supplierUpdateSchema,
} = require('../validations/resourceSchemas');
const supplierController = require('../controllers/supplierController');

router.use(checkAuth);

router.get(
  '/',
  checkRole('Admin', 'Purchase'),
  validate(paginationQuerySchema, 'query'),
  supplierController.listSuppliers
);

router.get(
  '/:id',
  checkRole('Admin', 'Purchase'),
  validate(objectIdSchema, 'params'),
  supplierController.getSupplier
);

router.post(
  '/',
  checkRole('Admin', 'Purchase'),
  validate(supplierCreateSchema),
  supplierController.createSupplier
);

router.put(
  '/:id',
  checkRole('Admin', 'Purchase'),
  validate(objectIdSchema, 'params'),
  validate(supplierUpdateSchema),
  supplierController.updateSupplier
);

router.delete(
  '/:id',
  checkRole('Admin'),
  validate(objectIdSchema, 'params'),
  supplierController.deleteSupplier
);

module.exports = router;
