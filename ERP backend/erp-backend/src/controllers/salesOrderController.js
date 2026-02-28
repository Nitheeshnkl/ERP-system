const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

exports.getSalesOrders = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req.query);
    const filter = buildSearchFilter(search, ['customerName', 'status']);
    const total = await SalesOrder.countDocuments(filter);
    const orders = await SalesOrder.find(filter)
      .populate({ path: 'customerId', select: 'name email' })
      .populate({ path: 'items.productId', select: 'name sku stockQuantity' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return success(res, orders, 'Sales orders fetched successfully', 200, {
      ...buildMeta(total, page, limit),
      search,
    });
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getSalesOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id)
      .populate({ path: 'customerId', select: 'name email' })
      .populate({ path: 'items.productId', select: 'name sku stockQuantity' });
    if (!order) {
      return error(res, 'Sales Order not found', 404);
    }
    return success(res, order, 'Sales order fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.createSalesOrder = async (req, res) => {
  try {
    const order = new SalesOrder(req.body);
    await order.save();
    return success(res, order, 'Sales order created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
};

exports.updateSalesOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = req.body.status || order.status;

    if (req.body.items) order.items = req.body.items;
    if (req.body.totalAmount) order.totalAmount = req.body.totalAmount;

    await order.save();

    if (oldStatus !== 'Completed' && order.status === 'Completed') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        product.stockQuantity -= item.quantity;
        await product.save();
      }

      const pdfPath = await generateInvoicePDF(order);
      const invoice = new Invoice({
        salesOrderId: order._id,
        amount: order.totalAmount,
        pdfPath
      });
      await invoice.save();
    }

    return success(res, order, 'Sales order updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 400);
  }
};

exports.deleteSalesOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return error(res, 'Sales Order not found', 404);
    }
    return success(res, null, 'Sales order deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};
