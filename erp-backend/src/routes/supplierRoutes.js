const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', async (req, res) => res.json(await Supplier.find()));
router.get('/:id', async (req, res) => res.json(await Supplier.findById(req.params.id)));
router.post('/', async (req, res) => res.status(201).json(await new Supplier(req.body).save()));
router.put('/:id', async (req, res) => res.json(await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;