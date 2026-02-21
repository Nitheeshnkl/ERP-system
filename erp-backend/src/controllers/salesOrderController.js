const mongoose = require('mongoose');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

exports.getSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find().populate('customerId items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSalesOrder = async (req, res) => {
  try {
    const order = new SalesOrder(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSalesOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await SalesOrder.findById(req.params.id).session(session);
    if (!order) throw new Error('Order not found');
    
    const oldStatus = order.status;
    order.status = req.body.status || order.status;
    
    // Support other updates
    if (req.body.items) order.items = req.body.items;
    if (req.body.totalAmount) order.totalAmount = req.body.totalAmount;
    
    await order.save({ session });
    
    // If completing the order, decrement stock and generate invoice
    if (oldStatus !== 'Completed' && order.status === 'Completed') {
      for (let item of order.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stockQuantity < item.quantity) {
           throw new Error(`Insufficient stock for product ${product.name}`);
        }
        product.stockQuantity -= item.quantity;
        await product.save({ session });
      }
      
      // Generate Invoice
      const pdfPath = await generateInvoicePDF(order);
      const invoice = new Invoice({
        salesOrderId: order._id,
        amount: order.totalAmount,
        pdfPath
      });
      await invoice.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};