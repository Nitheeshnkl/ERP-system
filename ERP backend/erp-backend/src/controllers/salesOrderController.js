const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');
const { resolveCustomer, resolveProduct } = require('../utils/orderResolvers');

const normalizeSalesOrderPayload = async (payload) => {
  const customer = await resolveCustomer(payload.customerId || payload.customerName);
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
    customerId: customer._id,
    legacy_customerId: String(payload.customerId || payload.customerName || ''),
    customerName: customer.name,
    items: normalizedItems,
    totalAmount,
    status: payload.status || 'Pending',
  };
};

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
    const normalizedPayload = await normalizeSalesOrderPayload(req.body);
    const order = new SalesOrder(normalizedPayload);
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

    const hasItemsOrCustomerUpdate = Boolean(req.body.customerId || req.body.customerName || req.body.items);
    if (order.status === 'Completed' && hasItemsOrCustomerUpdate) {
      return error(res, 'Completed orders cannot be edited', 400);
    }

    if (hasItemsOrCustomerUpdate) {
      const normalizedPayload = await normalizeSalesOrderPayload({
        ...order.toObject(),
        ...req.body,
      });
      order.customerId = normalizedPayload.customerId;
      order.legacy_customerId = normalizedPayload.legacy_customerId;
      order.customerName = normalizedPayload.customerName;
      order.items = normalizedPayload.items;
      order.totalAmount = normalizedPayload.totalAmount;
    }

    const oldStatus = order.status;
    const nextStatus = req.body.status || order.status;

    if (req.body.totalAmount && !hasItemsOrCustomerUpdate) {
      order.totalAmount = Number(req.body.totalAmount);
    }

    if (oldStatus !== 'Completed' && nextStatus === 'Completed') {
      const decrementedItems = [];

      try {
        for (const item of order.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.productId, stockQuantity: { $gte: item.quantity } },
            { $inc: { stockQuantity: -item.quantity } },
            { new: true }
          );

          if (!updatedProduct) {
            const product = await Product.findById(item.productId).select('name');
            const productName = product?.name || String(item.productId);
            throw new Error(`Insufficient stock for product ${productName}`);
          }

          decrementedItems.push({ productId: item.productId, quantity: item.quantity });
        }

        order.status = nextStatus;
        await order.save();

        const pdfPath = await generateInvoicePDF(order);
        await Invoice.findOneAndUpdate(
          { salesOrderId: order._id },
          {
            salesOrderId: order._id,
            amount: order.totalAmount,
            pdfPath,
            legacy_salesOrderId: String(order._id),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (requestError) {
        for (const item of decrementedItems) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
        }
        order.status = oldStatus;
        await order.save();
        throw requestError;
      }
    } else {
      order.status = nextStatus;
      await order.save();
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
