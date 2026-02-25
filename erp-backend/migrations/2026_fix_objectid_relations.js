#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../src/models/Customer');
const Supplier = require('../src/models/Supplier');
const Product = require('../src/models/Product');
const SalesOrder = require('../src/models/SalesOrder');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const GRN = require('../src/models/GRN');
const Invoice = require('../src/models/Invoice');

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');

const stats = {
  scanned: 0,
  updatesPlanned: 0,
  updatesApplied: 0,
  ambiguous: [],
};

const asObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

const resolveByIdOrName = async ({ rawValue, model, nameValue, label, docId }) => {
  const oid = asObjectId(rawValue);
  if (oid) {
    const exists = await model.exists({ _id: oid });
    if (exists) {
      return { value: oid, source: 'objectid' };
    }
  }

  const lookupName = (nameValue || rawValue || '').toString().trim();
  if (!lookupName) {
    stats.ambiguous.push(`${label} on ${docId}: missing value and no fallback name`);
    return null;
  }

  const matches = await model.find({ name: new RegExp(`^${lookupName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).select('_id').lean();
  if (matches.length === 1) {
    return { value: matches[0]._id, source: 'name' };
  }
  if (matches.length === 0) {
    stats.ambiguous.push(`${label} on ${docId}: no match for name '${lookupName}'`);
  } else {
    stats.ambiguous.push(`${label} on ${docId}: multiple matches for name '${lookupName}'`);
  }
  return null;
};

const planSalesOrderUpdates = async () => {
  const plans = [];
  const docs = await SalesOrder.find().lean();

  for (const doc of docs) {
    stats.scanned += 1;
    const set = {};
    const customerResolution = await resolveByIdOrName({
      rawValue: doc.customerId,
      model: Customer,
      nameValue: doc.customerName,
      label: 'salesOrder.customerId',
      docId: doc._id,
    });

    if (!customerResolution) continue;

    set.customerId = customerResolution.value;
    if (typeof doc.customerId === 'string') {
      set.legacy_customerId = doc.customerId;
    }

    const updatedItems = [];
    let itemsValid = true;
    for (const item of doc.items || []) {
      const resolution = await resolveByIdOrName({
        rawValue: item.productId,
        model: Product,
        nameValue: item.productName,
        label: 'salesOrder.items.productId',
        docId: doc._id,
      });
      if (!resolution) {
        itemsValid = false;
        break;
      }
      updatedItems.push({
        ...item,
        productId: resolution.value,
        legacy_productId: typeof item.productId === 'string' ? item.productId : item.legacy_productId || null,
      });
    }

    if (!itemsValid) continue;

    set.items = updatedItems;
    plans.push({ collection: 'salesorders', id: doc._id, set });
  }

  return plans;
};

const planPurchaseOrderUpdates = async () => {
  const plans = [];
  const docs = await PurchaseOrder.find().lean();

  for (const doc of docs) {
    stats.scanned += 1;
    const set = {};
    const supplierResolution = await resolveByIdOrName({
      rawValue: doc.supplierId,
      model: Supplier,
      nameValue: doc.supplierName,
      label: 'purchaseOrder.supplierId',
      docId: doc._id,
    });

    if (!supplierResolution) continue;

    set.supplierId = supplierResolution.value;
    if (typeof doc.supplierId === 'string') {
      set.legacy_supplierId = doc.supplierId;
    }

    const updatedItems = [];
    let itemsValid = true;
    for (const item of doc.items || []) {
      const resolution = await resolveByIdOrName({
        rawValue: item.productId,
        model: Product,
        nameValue: item.productName,
        label: 'purchaseOrder.items.productId',
        docId: doc._id,
      });
      if (!resolution) {
        itemsValid = false;
        break;
      }
      updatedItems.push({
        ...item,
        productId: resolution.value,
        legacy_productId: typeof item.productId === 'string' ? item.productId : item.legacy_productId || null,
      });
    }

    if (!itemsValid) continue;

    set.items = updatedItems;
    plans.push({ collection: 'purchaseorders', id: doc._id, set });
  }

  return plans;
};

const planGrnUpdates = async () => {
  const plans = [];
  const docs = await GRN.find().lean();

  for (const doc of docs) {
    stats.scanned += 1;
    const set = {};

    const poId = asObjectId(doc.purchaseOrderId);
    if (poId) {
      set.purchaseOrderId = poId;
      if (typeof doc.purchaseOrderId === 'string') set.legacy_purchaseOrderId = doc.purchaseOrderId;
    } else if (doc.purchaseOrderId) {
      stats.ambiguous.push(`grn.purchaseOrderId on ${doc._id}: non-objectid value '${doc.purchaseOrderId}'`);
      continue;
    }

    const updatedItems = [];
    let itemsValid = true;
    for (const item of doc.items || []) {
      const prodId = asObjectId(item.productId);
      if (!prodId) {
        stats.ambiguous.push(`grn.items.productId on ${doc._id}: non-objectid value '${item.productId}'`);
        itemsValid = false;
        break;
      }
      updatedItems.push({
        ...item,
        productId: prodId,
        legacy_productId: typeof item.productId === 'string' ? item.productId : item.legacy_productId || null,
      });
    }

    if (!itemsValid) continue;
    if (updatedItems.length > 0) set.items = updatedItems;

    plans.push({ collection: 'grns', id: doc._id, set });
  }

  return plans;
};

const planInvoiceUpdates = async () => {
  const plans = [];
  const docs = await Invoice.find().lean();

  for (const doc of docs) {
    stats.scanned += 1;
    const set = {};
    const soId = asObjectId(doc.salesOrderId);
    if (!soId) {
      stats.ambiguous.push(`invoice.salesOrderId on ${doc._id}: non-objectid value '${doc.salesOrderId}'`);
      continue;
    }
    set.salesOrderId = soId;
    if (typeof doc.salesOrderId === 'string') set.legacy_salesOrderId = doc.salesOrderId;
    plans.push({ collection: 'invoices', id: doc._id, set });
  }

  return plans;
};

const applyPlans = async (plans) => {
  for (const plan of plans) {
    await mongoose.connection.collection(plan.collection).updateOne(
      { _id: plan.id },
      { $set: plan.set }
    );
    stats.updatesApplied += 1;
  }
};

const main = async () => {
  const dbUri = process.env.MONGODB_URI || process.env.DB_URI;
  if (!dbUri) {
    throw new Error('MONGODB_URI or DB_URI is required');
  }

  await mongoose.connect(dbUri);

  const plans = [
    ...(await planSalesOrderUpdates()),
    ...(await planPurchaseOrderUpdates()),
    ...(await planGrnUpdates()),
    ...(await planInvoiceUpdates()),
  ];

  stats.updatesPlanned = plans.length;

  console.log(`Mode: ${isDryRun ? 'dry-run' : 'apply'}`);
  console.log(`Documents scanned: ${stats.scanned}`);
  console.log(`Updates planned: ${stats.updatesPlanned}`);

  if (stats.ambiguous.length > 0) {
    console.error('Ambiguous mappings detected. Migration aborted.');
    stats.ambiguous.slice(0, 50).forEach((entry) => console.error(`- ${entry}`));
    if (stats.ambiguous.length > 50) {
      console.error(`- ...and ${stats.ambiguous.length - 50} more`);
    }
    await mongoose.disconnect();
    process.exit(1);
  }

  if (!isDryRun) {
    await applyPlans(plans);
    console.log(`Updates applied: ${stats.updatesApplied}`);
  } else {
    console.log('Dry-run only, no writes applied.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

main().catch(async (runError) => {
  console.error('Migration failed:', runError.message);
  try {
    await mongoose.disconnect();
  } catch (_ignore) {}
  process.exit(1);
});
