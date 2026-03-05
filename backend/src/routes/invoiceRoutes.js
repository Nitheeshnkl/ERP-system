const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validation');
const invoiceController = require('../controllers/invoiceController');

router.use(checkAuth);

// View Invoices: admin, sales, purchase
router.get('/', checkRole('Admin', 'Sales', 'Purchase'), invoiceController.getInvoices);
router.get('/:id', checkRole('Admin', 'Sales', 'Purchase'), validate(objectIdSchema, 'params'), invoiceController.getInvoiceById);
router.patch('/:id/status', checkRole('Admin', 'Sales'), validate(objectIdSchema, 'params'), invoiceController.updateInvoiceStatus);
router.get('/:id/pdf', checkRole('Admin', 'Sales', 'Purchase'), validate(objectIdSchema, 'params'), invoiceController.getInvoicePDF);

// Delete Invoice: admin only
router.delete('/:id', checkRole('Admin'), validate(objectIdSchema, 'params'), invoiceController.deleteInvoice);

module.exports = router;
