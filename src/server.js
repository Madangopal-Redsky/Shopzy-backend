const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes")
const adminRoutes = require('./routes/adminRoutes')
const shopRoutes = require('./routes/shopRoutes')
const superAdminRoutes = require('./routes/superAdminRoutes')
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" , extended: true }));

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'))
);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes)
app.use('/api/admin',adminRoutes)
app.use("/api/shop", shopRoutes);
app.use("/api/super", superAdminRoutes);
app.use('/api/notifications', notificationRoutes);

const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
