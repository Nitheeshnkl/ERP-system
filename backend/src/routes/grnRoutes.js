const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validation');
const grnController = require('../controllers/grnController');

router.use(checkAuth);

// View GRN: admin, purchase, inventory
router.get('/', checkRole('Admin', 'Purchase', 'Inventory'), grnController.getGRNs);
router.get('/:id', checkRole('Admin', 'Purchase', 'Inventory'), validate(objectIdSchema, 'params'), grnController.getGRN);

// Create GRN: admin, purchase, inventory
router.post('/', checkRole('Admin', 'Purchase', 'Inventory'), grnController.createGRN);

// Edit GRN: admin, inventory
router.put('/:id', checkRole('Admin', 'Inventory'), validate(objectIdSchema, 'params'), grnController.updateGRN);

// Delete GRN: admin only
router.delete('/:id', checkRole('Admin'), validate(objectIdSchema, 'params'), grnController.deleteGRN);

module.exports = router;
