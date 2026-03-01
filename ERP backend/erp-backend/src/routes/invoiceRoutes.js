const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

router.use(checkAuth);

// View Invoices: admin, sales
router.get('/', checkRole('Admin', 'Sales'), invoiceController.getInvoices);
router.get('/:id', checkRole('Admin', 'Sales'), invoiceController.getInvoiceById);
router.patch('/:id/status', checkRole('Admin', 'Sales'), invoiceController.updateInvoiceStatus);
router.get('/:id/pdf', checkRole('Admin', 'Sales'), invoiceController.getInvoicePDF);

// Delete Invoice: admin only
router.delete('/:id', checkRole('Admin'), invoiceController.deleteInvoice);

module.exports = router;
