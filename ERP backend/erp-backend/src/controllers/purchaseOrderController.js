const PurchaseOrder = require('../models/PurchaseOrder');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');
const { resolveSupplier, resolveProduct } = require('../utils/orderResolvers');

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
    const normalizedPayload = await normalizePurchaseOrderPayload(req.body);
    const order = new PurchaseOrder(normalizedPayload);
    await order.save();
    return success(res, order, 'Purchase order created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const existing = await PurchaseOrder.findById(req.params.id);
    if (!existing) {
      return error(res, 'Purchase Order not found', 404);
    }

    const hasItemsOrSupplierUpdate = Boolean(req.body.supplierId || req.body.supplierName || req.body.items);
    const normalizedPayload = hasItemsOrSupplierUpdate
      ? await normalizePurchaseOrderPayload({
        ...existing.toObject(),
        ...req.body,
      })
      : {
        ...req.body,
        totalAmount: req.body.totalAmount ? Number(req.body.totalAmount) : existing.totalAmount,
      };

    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, normalizedPayload, { new: true });
    if (!order) {
      return error(res, 'Purchase Order not found', 404);
    }
    return success(res, order, 'Purchase order updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 400);
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
