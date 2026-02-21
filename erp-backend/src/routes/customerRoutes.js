const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', async (req, res) => res.json(await Customer.find()));
router.get('/:id', async (req, res) => res.json(await Customer.findById(req.params.id)));
router.post('/', async (req, res) => res.status(201).json(await new Customer(req.body).save()));
router.put('/:id', async (req, res) => res.json(await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;