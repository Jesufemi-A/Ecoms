const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  review: { type: String, required: false },
  productImage: {
    type: String,
    required: false,
  },
});

const Products = mongoose.model("Products", productSchema);
