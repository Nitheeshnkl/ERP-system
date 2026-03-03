const mongoose = require('mongoose');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');
const { resolveCustomerById, resolveProduct } = require('../utils/orderResolvers');

const isClientError = (requestError) => {
  if (!requestError) return false;
  if (requestError.name === 'ValidationError' || requestError.name === 'CastError') return true;
  const message = String(requestError.message || '').toLowerCase();
  return [
    'required',
    'not found',
    'quantity',
    'insufficient stock',
    'invalid',
    'enum',
    'duplicate',
  ].some((marker) => message.includes(marker));
};

const toPlainIdentifier = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (typeof value === 'object') {
    if (typeof value.toHexString === 'function') return value.toHexString();
    if (value._id && value._id !== value) return toPlainIdentifier(value._id);
    if (value.id && value.id !== value) return toPlainIdentifier(value.id);
  }
  return String(value).trim();
};

const normalizeSalesOrderPayload = async (payload) => {
  const customerInput = toPlainIdentifier(payload.customerId);
  const customer = await resolveCustomerById(customerInput);
  const incomingItems = Array.isArray(payload.items) ? payload.items : [];
  if (incomingItems.length === 0) {
    throw new Error('At least one order item is required');
  }

  const normalizedItems = [];
  for (const item of incomingItems) {
    const productInput = toPlainIdentifier(item.productId || item.productName);
    const product = await resolveProduct(productInput);
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice || product.price || 0);
    if (!quantity || quantity < 1) {
      throw new Error('Each item must include a quantity of at least 1');
    }

    normalizedItems.push({
      productId: product._id,
      legacy_productId: productInput,
      productName: product.name,
      quantity,
      unitPrice,
    });
  }

  const totalAmount = Number(payload.totalAmount) || normalizedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return {
    customerId: customer._id,
    legacy_customerId: customerInput,
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
    console.log('[DEBUG CREATE] body:', req.body);
    const normalizedPayload = await normalizeSalesOrderPayload(req.body);
    const order = new SalesOrder(normalizedPayload);
    await order.save();
    return success(res, order, 'Sales order created successfully', 201);
  } catch (requestError) {
    return error(res, requestError.message, isClientError(requestError) ? 400 : 500);
  }
};

exports.updateSalesOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('[DEBUG SO UPDATE ENTRY]');
    console.log('[DEBUG UPDATE] id:', req.params.id);
    // Debug: Log incoming request body
    console.log('[DEBUG TRANSACTION START] updateSalesOrder')
    console.log('[DEBUG UPDATE PAYLOAD] incoming:', JSON.stringify(req.body))

    // Validate Order ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      await session.abortTransaction();
      session.endSession();
      return error(res, 'Invalid Order ID', 400);
    }

    const existingOrder = await SalesOrder.findById(req.params.id).session(session);
    if (!existingOrder) {
      await session.abortTransaction();
      session.endSession();
      return error(res, 'Order not found', 404);
    }

    // Fix: Check for actual items array (even empty array is valid)
    const hasItemsArray = Array.isArray(req.body.items);
    const hasItemsOrCustomerUpdate = (
      req.body.customerId !== undefined ||
      req.body.customerName !== undefined ||
      hasItemsArray
    );

    console.log('[DEBUG] hasItemsArray:', hasItemsArray, 'hasItemsOrCustomerUpdate:', hasItemsOrCustomerUpdate);

    if (existingOrder.status === 'Completed' && hasItemsOrCustomerUpdate) {
      await session.abortTransaction();
      session.endSession();
      return error(res, 'Completed orders cannot be edited', 400);
    }

    let order = existingOrder;

    if (hasItemsOrCustomerUpdate) {
      // If items array is explicitly provided (even if empty), normalize it
      if (hasItemsArray) {
        // Allow empty array to clear items, or process items normally
        if (req.body.items.length > 0) {
          const normalizedPayload = await normalizeSalesOrderPayload({
            customerId: req.body.customerId !== undefined ? req.body.customerId : order.customerId,
            items: req.body.items,
            totalAmount: req.body.totalAmount !== undefined ? req.body.totalAmount : order.totalAmount,
            status: req.body.status !== undefined ? req.body.status : order.status,
          });
          order.customerId = normalizedPayload.customerId;
          order.legacy_customerId = normalizedPayload.legacy_customerId;
          order.customerName = normalizedPayload.customerName;
          order.items = normalizedPayload.items;
          order.totalAmount = normalizedPayload.totalAmount;
        } else {
          // Empty items array - clear items but keep totals
          order.items = [];
          order.totalAmount = req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : 0;
        }
      } else if (req.body.customerId !== undefined || req.body.customerName !== undefined) {
        // Only customer changed, normalize with existing items
        const normalizedPayload = await normalizeSalesOrderPayload({
          customerId: req.body.customerId !== undefined ? req.body.customerId : order.customerId,
          items: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          totalAmount: req.body.totalAmount !== undefined ? req.body.totalAmount : order.totalAmount,
          status: req.body.status !== undefined ? req.body.status : order.status,
        });
        order.customerId = normalizedPayload.customerId;
        order.legacy_customerId = normalizedPayload.legacy_customerId;
        order.customerName = normalizedPayload.customerName;
      }
    }

    const oldStatus = order.status;
    const nextStatus = req.body.status !== undefined ? req.body.status : order.status;
    const buildUpdateData = (statusOverride = nextStatus) => ({
      customerId: order.customerId,
      legacy_customerId: order.legacy_customerId,
      customerName: order.customerName,
      items: order.items,
      totalAmount: order.totalAmount,
      status: statusOverride,
    });
    let persistedOrder;

    if (req.body.totalAmount !== undefined && !hasItemsOrCustomerUpdate) {
      order.totalAmount = Number(req.body.totalAmount);
    }

    if (oldStatus !== 'Completed' && nextStatus === 'Completed') {
      const decrementedItems = [];

      try {
        for (const item of order.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.productId, stockQuantity: { $gte: item.quantity } },
            { $inc: { stockQuantity: -item.quantity } },
            { new: true, session }
          );

          if (!updatedProduct) {
            const product = await Product.findById(item.productId).select('name');
            const productName = product?.name || String(item.productId);
            throw new Error(`Insufficient stock for product ${productName}`);
          }

          decrementedItems.push({ productId: item.productId, quantity: item.quantity });
        }

        persistedOrder = await SalesOrder.findByIdAndUpdate(
          req.params.id,
          buildUpdateData(nextStatus),
          { new: true, runValidators: true, session }
        );

        const pdfPath = await generateInvoicePDF(persistedOrder);
        await Invoice.findOneAndUpdate(
          { salesOrderId: persistedOrder._id },
          {
            salesOrderId: persistedOrder._id,
            amount: persistedOrder.totalAmount,
            pdfPath,
            legacy_salesOrderId: String(persistedOrder._id),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true, session }
        );
      } catch (requestError) {
        for (const item of decrementedItems) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stockQuantity: item.quantity } },
            { session }
          );
        }
        await SalesOrder.findByIdAndUpdate(
          req.params.id,
          { status: oldStatus },
          { session }
        );
        throw requestError;
      }
    } else {
      persistedOrder = await SalesOrder.findByIdAndUpdate(
        req.params.id,
        buildUpdateData(nextStatus),
        { new: true, runValidators: true, session }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    if (!persistedOrder) {
      return error(res, 'Order not found', 404);
    }

    console.log('[DEBUG TRANSACTION COMMIT] Sales order updated:', persistedOrder._id)
    console.log('[DEBUG DB RESULT] items:', JSON.stringify(persistedOrder.items))

    // Fetch updated order with populated fields for response
    const updatedOrder = await SalesOrder.findById(persistedOrder._id)
      .populate({ path: 'customerId', select: 'name email' })
      .populate({ path: 'items.productId', select: 'name sku stockQuantity' })
      .lean();

    return success(res, updatedOrder, 'Sales order updated successfully');
  } catch (requestError) {
    await session.abortTransaction();
    session.endSession();
    console.error('[DEBUG] updateSalesOrder error:', requestError.message);
    return error(res, requestError.message, isClientError(requestError) ? 400 : 500);
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
