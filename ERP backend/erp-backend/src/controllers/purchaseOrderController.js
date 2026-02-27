const PurchaseOrder = require('../models/PurchaseOrder');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

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
    const order = new PurchaseOrder(req.body);
    await order.save();
    return success(res, order, 'Purchase order created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
