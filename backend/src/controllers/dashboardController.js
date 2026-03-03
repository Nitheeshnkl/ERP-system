const Product = require('../models/Product');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const { success, error } = require('../utils/response');

exports.getMetrics = async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find();
    const totalSales = salesOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = await SalesOrder.countDocuments({ status: 'Pending' });
    const lowStockAlerts = await Product.countDocuments({ stockQuantity: { $lt: 10 } });
    const activeCustomers = await Customer.countDocuments();

    const metrics = {
      totalSales: Math.round(totalSales * 100) / 100,
      pendingOrders,
      lowStockAlerts,
      activeCustomers,
    };

    return success(res, metrics, 'Dashboard metrics fetched successfully');
  } catch (_requestError) {
    return error(res, 'Failed to fetch metrics', 500);
  }
};

exports.getChartData = async (req, res) => {
  try {
    const chartData = await SalesOrder.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          monthNumber: '$_id.month',
          revenue: '$totalRevenue',
        },
      },
      {
        $sort: { monthNumber: 1 },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = chartData.map((item) => ({
      month: monthNames[Math.max(0, Math.min(11, (item.monthNumber || 1) - 1))],
      revenue: Number(item.revenue || 0),
    }));

    return success(res, result, 'Dashboard chart data fetched successfully');
  } catch (_requestError) {
    return error(res, 'Failed to fetch chart data', 500);
  }
};
