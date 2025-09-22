const { Order } = require("../models/Order");
const { Product } = require("../models/Product");
const { Category } = require("../models/Category");

const getAdminRevenue = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { mode } = req.query; 

    const categories = await Category.find({ admin: adminId }).select("_id");
    const categoryIds = categories.map((c) => c._id);

    const products = await Product.find({ category: { $in: categoryIds } }).select("_id");
    const productIds = products.map((p) => p._id);

    const orders = await Order.find({ "items.product": { $in: productIds } });

    let totalRevenue = 0;
    let groupedRevenue = {}; 

    orders.forEach((order) => {
      let orderTotal = 0;
      order.items.forEach((item) => {
        if (productIds.some((pid) => pid.toString() === item.product.toString())) {
          orderTotal += item.price * item.quantity;
        }
      });

      totalRevenue += orderTotal;

      if (mode === "daily") {
        const hour = new Date(order.createdAt).getHours(); 
        const hourLabel = `${hour}:00`;
        groupedRevenue[hourLabel] = (groupedRevenue[hourLabel] || 0) + orderTotal;
      } else {
        const date = new Date(order.createdAt).toISOString().split("T")[0];
        groupedRevenue[date] = (groupedRevenue[date] || 0) + orderTotal;
      }
    });

    const revenueArray = Object.entries(groupedRevenue)
      .sort(([a], [b]) => new Date(`1970-01-01T${a}:00`) - new Date(`1970-01-01T${b}:00`)) 
      .map(([key, value]) => ({ label: key, value }));

    res.json({ totalRevenue, ordersCount: orders.length, revenueData: revenueArray });
  } catch (err) {
    console.error("Revenue calculation error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



const getAdminStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    const categories = await Category.find({ admin: adminId }).select("_id");

    const products = await Product.find({ admin: { $in: adminId } }).select("_id");
    const productIds = products.map((p) => p._id);

    const totalProducts = productIds.length;
    const totalCategories = categories.length;

    const totalOrders = await Order.countDocuments({ "items.product": { $in: productIds } });

    res.json({ totalCategories, totalProducts, totalOrders });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const adminId = req.user.id;

    const categories = await Category.find({ admin: adminId }).select("_id");
    const categoryIds = categories.map((c) => c._id);

    const products = await Product.find({ category: { $in: categoryIds } }).select("_id");
    const productIds = products.map((p) => p._id);
    const orders = await Order.find({ "items.product": { $in: productIds } })
      .populate("user", "firstName lastName email"); 

    const customerSpendMap = {};

    orders.forEach((order) => {
      let orderTotal = 0;

      order.items.forEach((item) => {
        if (productIds.some((pid) => pid.toString() === item.product.toString())) {
          orderTotal += item.price * item.quantity;
        }
      });

      if (order.user) {
        const customerId = order.user._id.toString();

        if (!customerSpendMap[customerId]) {
          customerSpendMap[customerId] = {
            id: customerId,
            name: `${order.user.firstName} ${order.user.lastName}`,
            email: order.user.email,
            totalSpent: 0,
            orderCount: 0,
          };
        }

        customerSpendMap[customerId].totalSpent += orderTotal;
        customerSpendMap[customerId].orderCount += 1;
      }
    });

    const topCustomers = Object.values(customerSpendMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    res.json(topCustomers);
  } catch (err) {
    console.error("Top customers error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const adminId = req.user.id;
    const categories = await Category.find({ admin: adminId }).select("_id");
    const categoryIds = categories.map((c) => c._id.toString());
    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "title category admin price", 
      });

    const productSalesMap = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.product;
        
        if (!product) return; 
        if (product.admin.toString() !== adminId) return;
        if (!categoryIds.includes(product.category.toString())) return;

        const productId = product._id.toString();

        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            id: productId,
            title: product.title,
            quantitySold: 0,
            totalRevenue: 0,
          };
        }

        productSalesMap[productId].quantitySold += item.quantity;
        productSalesMap[productId].totalRevenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5); // return top 5

    res.json(topProducts);
  } catch (err) {
    console.error("Top products error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};




module.exports = { getAdminRevenue, getAdminStats, getTopCustomers, getTopProducts };

