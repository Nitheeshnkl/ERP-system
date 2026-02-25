const mongoose = require('mongoose');
const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const { success, error } = require('../utils/response');

exports.getGRNs = async (req, res) => {
  try {
    const grns = await GRN.find().populate('purchaseOrderId');
    return success(res, grns, 'GRNs fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id).populate('purchaseOrderId items.productId');
    if (!grn) {
      return error(res, 'GRN not found', 404);
    }
    return success(res, grn, 'GRN fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.createGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { purchaseOrderId, items } = req.body;

    const grn = new GRN({ purchaseOrderId, items });
    await grn.save({ session });

    const po = await PurchaseOrder.findById(purchaseOrderId).session(session);
    if (!po) {
      throw new Error('Purchase Order not found');
    }
    po.status = 'Received';
    await po.save({ session });

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      product.stockQuantity += item.receivedQuantity;
      await product.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return success(res, grn, 'GRN created successfully', 201);
  } catch (requestError) {
    await session.abortTransaction();
    session.endSession();

    if (requestError.message.includes('Transaction')) {
      console.error('Transactions not supported on this MongoDB instance.');
      return error(
        res,
        'Transaction failed, MongoDB replica set required for full safety.',
        500,
        { reason: requestError.message }
      );
    }

    return error(res, requestError.message, 400);
  }
};

exports.updateGRN = async (req, res) => {
  try {
    const grn = await GRN.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grn) {
      return error(res, 'GRN not found', 404);
    }
    return success(res, grn, 'GRN updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
};

exports.deleteGRN = async (req, res) => {
  try {
    const grn = await GRN.findByIdAndDelete(req.params.id);
    if (!grn) {
      return error(res, 'GRN not found', 404);
    }
    return success(res, null, 'GRN deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};
