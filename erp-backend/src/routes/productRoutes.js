const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', async (req, res) => res.json(await Product.find()));
router.get('/:id', async (req, res) => res.json(await Product.findById(req.params.id)));
router.post('/', async (req, res) => res.status(201).json(await new Product(req.body).save()));
router.put('/:id', async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;