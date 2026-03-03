const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');
const { resolveSupplier, resolveProduct } = require('../utils/orderResolvers');

const isClientError = (requestError) => {
  if (!requestError) return false;
  if (requestError.name === 'ValidationError' || requestError.name === 'CastError') return true;
  const message = String(requestError.message || '').toLowerCase();
  return [
    'required',
    'not found',
    'quantity',
    'invalid',
    'enum',
    'duplicate',
  ].some((marker) => message.includes(marker));
};

const normalizePurchaseOrderPayload = async (payload) => {
  const supplier = await resolveSupplier(payload.supplierId || payload.supplierName);
  const incomingItems = Array.isArray(payload.items) ? payload.items : [];
  if (incomingItems.length === 0) {
    throw new Error('At least one order item is required');
  }

  const normalizedItems = [];
  for (const item of incomingItems) {
    const product = await resolveProduct(item.productId || item.productName);
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice || product.price || 0);
    if (!quantity || quantity < 1) {
      throw new Error('Each item must include a quantity of at least 1');
    }

    normalizedItems.push({
      productId: product._id,
      legacy_productId: String(item.productId || item.productName || ''),
      productName: product.name,
      quantity,
      unitPrice,
    });
  }

  const totalAmount = Number(payload.totalAmount) || normalizedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return {
    supplierId: supplier._id,
    legacy_supplierId: String(payload.supplierId || payload.supplierName || ''),
    supplierName: supplier.name,
    items: normalizedItems,
    totalAmount,
    status: payload.status || 'Pending',
  };
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req.query);
    const filter = buildSearchFilter(search, ['supplierName', 'status']);
    const total = await PurchaseOrder.countDocuments(filter);
    const orders = await PurchaseOrder.find(filter)
      .populate({ path: 'supplierId', select: 'name email phone' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return success(res, orders, 'Purchase orders fetched successfully', 200, {
      ...buildMeta(total, page, limit),
      search,
    });
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate({ path: 'supplierId', select: 'name email phone' })
      .populate({ path: 'items.productId', select: 'name sku stockQuantity' });
    if (!order) {
      return error(res, 'Purchase Order not found', 404);
    }
    return success(res, order, 'Purchase order fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    console.log('[DEBUG CREATE] body:', req.body);
    const normalizedPayload = await normalizePurchaseOrderPayload(req.body);
    const order = new PurchaseOrder(normalizedPayload);
    await order.save();
    return success(res, order, 'Purchase order created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, isClientError(requestError) ? 400 : 500);
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('[DEBUG UPDATE] id:', req.params.id);
    // Debug: Log incoming request body
    console.log('[DEBUG TRANSACTION START] updatePurchaseOrder')
    console.log('[DEBUG UPDATE PAYLOAD] incoming:', JSON.stringify(req.body))

    // Validate Order ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      await session.abortTransaction();
      session.endSession();
      return error(res, 'Invalid Order ID', 400);
    }

    const existingOrder = await PurchaseOrder.findById(req.params.id).session(session);
    if (!existingOrder) {
      await session.abortTransaction();
      session.endSession();
      return error(res, 'Purchase Order not found', 404);
    }

    // Fix: Check for actual items array (even empty array is valid)
    const hasItemsArray = Array.isArray(req.body.items);
    const hasItemsOrSupplierUpdate = (
      req.body.supplierId !== undefined ||
      req.body.supplierName !== undefined ||
      hasItemsArray
    );

    console.log('[DEBUG] hasItemsArray:', hasItemsArray, 'hasItemsOrSupplierUpdate:', hasItemsOrSupplierUpdate);

    let order = existingOrder;
    let normalizedPayload;

    if (hasItemsOrSupplierUpdate) {
      // If items array is explicitly provided (even if empty), normalize it
      if (hasItemsArray) {
        // Allow empty array to clear items, or process items normally
        if (req.body.items.length > 0) {
          normalizedPayload = await normalizePurchaseOrderPayload({
            ...order.toObject(),
            ...req.body,
          });
        } else {
          // Empty items array - clear items but keep totals
          normalizedPayload = {
            ...order.toObject(),
            items: [],
            totalAmount: req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : 0,
          };
        }
      } else if (req.body.supplierId !== undefined || req.body.supplierName !== undefined) {
        // Only supplier changed, normalize with existing items
        normalizedPayload = await normalizePurchaseOrderPayload({
          ...order.toObject(),
          ...req.body,
        });
      }
    } else {
      // No items/supplier update, just update simple fields
      normalizedPayload = {
        ...req.body,
        totalAmount: req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : existingOrder.totalAmount,
      };
    }

    // Use findByIdAndUpdate with session for transaction safety
    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      normalizedPayload,
      { new: true, session }
    );

    if (!updatedOrder) {
      await session.abortTransaction();
      session.endSession();
      return error(res, 'Purchase Order not found', 404);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    console.log('[DEBUG TRANSACTION COMMIT] Purchase order updated:', updatedOrder._id)
    console.log('[DEBUG DB RESULT] items:', JSON.stringify(updatedOrder.items))

    // Fetch updated order with populated fields for response
    const populatedOrder = await PurchaseOrder.findById(updatedOrder._id)
      .populate({ path: 'supplierId', select: 'name email phone' })
      .populate({ path: 'items.productId', select: 'name sku stockQuantity' });

    return success(res, populatedOrder, 'Purchase order updated successfully');
  } catch (requestError) {
    await session.abortTransaction();
    session.endSession();
    console.error('[DEBUG] updatePurchaseOrder error:', requestError.message);
    return error(res, requestError.message, isClientError(requestError) ? 400 : 500);
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return error(res, 'Purchase Order not found', 404);
    }
    return success(res, null, 'Purchase order deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};
