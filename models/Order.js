const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: String,
  location: String,
  paymentMethod: String,
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
    }
  ],
  placedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);

