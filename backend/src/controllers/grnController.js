const mongoose = require('mongoose');
const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const { success, error } = require('../utils/response');

const isTransactionNotSupportedError = (requestError) => {
  const message = String(requestError?.message || '');
  return message.includes('Transaction numbers are only allowed on a replica set member or mongos')
    || message.toLowerCase().includes('replica set');
};

const persistGRN = async (payload, session) => {
  const { purchaseOrderId, items } = payload;

  if (!purchaseOrderId) {
    throw new Error('purchaseOrderId is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one GRN item is required');
  }

  const poQuery = PurchaseOrder.findById(purchaseOrderId);
  const po = session ? await poQuery.session(session) : await poQuery;
  if (!po) {
    throw new Error('Purchase Order not found');
  }

  for (const item of items) {
    const receivedQuantity = Number(item.receivedQuantity);
    if (!item.productId || !receivedQuantity || receivedQuantity < 1) {
      throw new Error('Each GRN item must include productId and receivedQuantity >= 1');
    }

    const productUpdate = Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stockQuantity: receivedQuantity } },
      { new: true }
    );
    const updatedProduct = session ? await productUpdate.session(session) : await productUpdate;
    if (!updatedProduct) {
      throw new Error(`Product not found: ${item.productId}`);
    }
  }

  po.status = 'Received';
  if (session) {
    await po.save({ session });
  } else {
    await po.save();
  }

  const grn = new GRN({ purchaseOrderId, items });
  if (session) {
    await grn.save({ session });
  } else {
    await grn.save();
  }

  return grn;
};

exports.getGRNs = async (req, res) => {
  try {
    const grns = await GRN.find().populate({ path: 'purchaseOrderId', select: 'supplierId supplierName status totalAmount createdAt' });
    return success(res, grns, 'GRNs fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id).populate({ path: 'purchaseOrderId', select: 'supplierId supplierName status totalAmount createdAt' }).populate({ path: 'items.productId', select: 'name sku stockQuantity' });
    if (!grn) {
      return error(res, 'GRN not found', 404);
    }
    return success(res, grn, 'GRN fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.createGRN = async (req, res) => {
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const grn = await persistGRN(req.body, session);

    await session.commitTransaction();
    return success(res, grn, 'GRN created successfully', 201);
  } catch (requestError) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_abortError) {
        // Ignore abort errors and continue error fallback path
      }
    }

    if (isTransactionNotSupportedError(requestError)) {
      try {
        const grn = await persistGRN(req.body);
        return success(res, grn, 'GRN created successfully', 201, {
          transactionFallback: true,
        });
      } catch (fallbackError) {
        return error(res, fallbackError.message, 400);
      }
    }

    return error(res, requestError.message, 400);
  } finally {
    if (session) {
      session.endSession();
    }
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
