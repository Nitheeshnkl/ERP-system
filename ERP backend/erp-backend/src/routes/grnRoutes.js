const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const grnController = require('../controllers/grnController');

router.use(checkAuth);

// View GRN: admin, purchase, inventory
router.get('/', checkRole('Admin', 'Purchase', 'Inventory'), grnController.getGRNs);
router.get('/:id', checkRole('Admin', 'Purchase', 'Inventory'), grnController.getGRN);

// Create GRN: admin, purchase, inventory
router.post('/', checkRole('Admin', 'Purchase', 'Inventory'), grnController.createGRN);

// Edit GRN: admin, inventory
router.put('/:id', checkRole('Admin', 'Inventory'), grnController.updateGRN);

// Delete GRN: admin only
router.delete('/:id', checkRole('Admin'), grnController.deleteGRN);

module.exports = router;