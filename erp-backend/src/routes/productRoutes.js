const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validation');
const {
  paginationQuerySchema,
  productCreateSchema,
  productUpdateSchema,
} = require('../validations/resourceSchemas');
const productController = require('../controllers/productController');

router.use(checkAuth);

router.get(
  '/',
  checkRole('Admin', 'Sales', 'Purchase', 'Inventory'),
  validate(paginationQuerySchema, 'query'),
  productController.listProducts
);

router.get(
  '/:id',
  checkRole('Admin', 'Sales', 'Purchase', 'Inventory'),
  validate(objectIdSchema, 'params'),
  productController.getProduct
);

router.post(
  '/',
  checkRole('Admin', 'Inventory'),
  validate(productCreateSchema),
  productController.createProduct
);

router.put(
  '/:id',
  checkRole('Admin', 'Inventory'),
  validate(objectIdSchema, 'params'),
  validate(productUpdateSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  checkRole('Admin'),
  validate(objectIdSchema, 'params'),
  productController.deleteProduct
);

module.exports = router;
