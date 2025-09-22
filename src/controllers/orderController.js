const { Auth } = require("../models/Auth");
const { Cart } = require("../models/Cart");
const { Order } = require("../models/Order");
const { Product } = require("../models/Product");
const { Shop } = require("../models/Shop");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Create PaymentIntent error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress, paymentMethod, paymentStatus } =
      req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items cannot be empty" });
    }

    if (paymentMethod === "CARD" && paymentStatus !== "SUCCESS") {
      return res.status(400).json({ message: "Payment not confirmed" });
    }

    let finalAddress = shippingAddress;
    if (!shippingAddress || !shippingAddress.street) {
      const user = await Auth.findById(req.user.id);
      finalAddress = user?.address || {};
    }

    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "_id admin"
    );

    const enrichedItems = items.map((i) => {
      const product = products.find(
        (p) => p._id.toString() === i.product.toString()
      );
      return {
        ...i,
        admin: product?.admin || null,
      };
    });
    const order = await Order.create({
      user: req.user.id,
      items: enrichedItems,
      totalPrice,
      shippingAddress: finalAddress,
      paymentMethod,
      status: paymentMethod === "CARD" ? "Processing" : "Pending",
    });

    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = cart.items.filter(
        (cartItem) =>
          !items.some(
            (orderItem) =>
              orderItem.product.toString() === cartItem.product.toString()
          )
      );
      await cart.save();
    }

    const admins = await Auth.find({ role: "admin", fcmToken: { $ne: "" } });
    admins.forEach((admin) => {
      sendNotification(
        admin.fcmToken,
        "New Order Placed",
        `Order #${order._id} has been placed by ${req.user.id}`,
        { type: "NEW_ORDER", orderId: order._id.toString() }
      );
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ admin: req.user.id });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("items.product");

    const filteredOrders = orders
      .map((order) => {
        const filteredItems = order.items.filter(
          (item) => item.product.admin?.toString() === req.user.id
        );

        if (filteredItems.length === 0) return null;
        return {
          ...order.toObject(),
          items: filteredItems,
          totalPrice: filteredItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          ),
        };
      })
      .filter(Boolean);
    res.status(200).json(filteredOrders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);


    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    const user = await Auth.findById(order.user);
    if (user?.fcmToken) {
      sendNotification(
        user.fcmToken,
        "Order Status Updated",
        `Your order #${order._id} is now ${order.status}`,
        { type: "ORDER_STATUS", orderId: order._id.toString() }
      );
    }


    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
