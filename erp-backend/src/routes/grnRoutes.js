const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const grnController = require('../controllers/grnController');

router.use(checkAuth);
router.post('/', grnController.createGRN);

module.exports = router;