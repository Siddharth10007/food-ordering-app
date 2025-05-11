const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Order = require("./models/Order");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ✅ Main route for placing order from cart.html
app.post("/place-order", async (req, res) => {
  try {
    const { name, location, paymentMethod, items } = req.body;
    if (!name || !location || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ error: "Incomplete order details." });
    }

    const order = new Order({ name, location, paymentMethod, items });
    await order.save();

    res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ Get all orders
app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ placedAt: -1 });
  res.json(orders);
});

// ✅ Update an order
app.put("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { items },
      { new: true }
    );
    res.json({
      updatedOrder,
      message: "Order updated successfully (₹100 update fee applied)"
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ✅ Delete an order
app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order cancelled (₹100 cancel fee applied)" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
