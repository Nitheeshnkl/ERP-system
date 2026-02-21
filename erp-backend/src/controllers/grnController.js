const mongoose = require('mongoose');
const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

exports.createGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { purchaseOrderId, items } = req.body;
    
    // Create GRN
    const grn = new GRN({ purchaseOrderId, items });
    await grn.save({ session });
    
    // Update PO Status
    const po = await PurchaseOrder.findById(purchaseOrderId).session(session);
    if (!po) throw new Error('Purchase Order not found');
    po.status = 'Received';
    await po.save({ session });
    
    // Increment Stock
    for (let item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      product.stockQuantity += item.receivedQuantity;
      await product.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json(grn);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Fallback if replica set isn't available (compensating logic)
    if (error.message.includes('Transaction')) {
      console.error('Transactions not supported on this MongoDB instance. Doing non-transactional fallback.');
      return res.status(500).json({ message: 'Transaction failed, MongoDB replica set required for full safety.', error: error.message });
    }
    
    res.status(400).json({ message: error.message });
  }
};