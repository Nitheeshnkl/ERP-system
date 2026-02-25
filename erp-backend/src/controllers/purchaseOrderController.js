const PurchaseOrder = require('../models/PurchaseOrder');
const { success, error } = require('../utils/response');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate({ path: 'supplierId', select: 'name email phone' });
    return success(res, orders, 'Purchase orders fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate({ path: 'supplierId', select: 'name email phone' }).populate({ path: 'items.productId', select: 'name sku stockQuantity' });
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
