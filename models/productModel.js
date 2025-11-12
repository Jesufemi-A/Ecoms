const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: [true, "Please, enter the product name"] },
  price: { type: Number, required: [true, "price must be a number"] },
  imageUrl: { type: String, required: [true, "product needs a product image"] },
});

const Products = mongoose.model("Products", productSchema);

module.exports = Products;
