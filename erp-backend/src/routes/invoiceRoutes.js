const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

router.use(checkAuth);

router.get('/', invoiceController.getInvoices);
router.get('/:id/pdf', invoiceController.getInvoicePDF);

module.exports = router;