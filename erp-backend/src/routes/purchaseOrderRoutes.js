const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', async (req, res) => res.json(await PurchaseOrder.find().populate('supplierId')));
router.get('/:id', async (req, res) => res.json(await PurchaseOrder.findById(req.params.id).populate('supplierId items.productId')));
router.post('/', async (req, res) => res.status(201).json(await new PurchaseOrder(req.body).save()));
router.put('/:id', async (req, res) => res.json(await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', async (req, res) => {
  await PurchaseOrder.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;