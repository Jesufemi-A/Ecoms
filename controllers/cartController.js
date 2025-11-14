const AppError = require("../errorHandler/appError");
const Cart = require("./../models/cartModel");
const Product = require("./../models/productModel");

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      next(new AppError("Cart does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Cart retrieved",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(new AppError("Something went wrong", 500));
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],

        totalItems: 0,
        totalPrice: 0,
      });
    }

    let existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("Product does not exist", 404));
    }

    cart.totalPrice += product.price * quantity;

    await cart.save();

    res.status(201).json({
      status: "success",
      message: "Product added",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return next(new AppError("Quantity must be at least 1", 400));

    const productId = req.params.itemId;

    const userId = req.user._id;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return next(new AppError("Cart does not exist", 404));
    }

    const product = await Product.findById(productId);

    if (!product) return next(new AppError("Product does not exist", 404));

    let existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    console.log(existingItem);

    if (!existingItem) {
      return next(new AppError("Product does not exist in the Cart", 404));
    }

    const oldProductPrice = product.price * existingItem.quantity;
    const newProductPrice = product.price * quantity;

    existingItem.quantity = quantity;

    cart.totalPrice = cart.totalPrice - oldProductPrice + newProductPrice;

    cart.totalItems = cart.items.reduce((acc, item) => item.quantity + acc, 0);

    await cart.save();
    res.status(200).json({
      status: "success",
      message: "Product updated",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.itemId;

    const userId = req.user._id;

    const cart = await Cart.findOne({
      user: userId,
    });

    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product does not exist", 404));

    if (!cart) {
      return next(new AppError("Cart does not exist", 404));
    }

    const index = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) return next(new AppError("Product does not exist", 404));

    const existingItem = cart.items[index];

    const oldProductPrice = product.price * existingItem.quantity;

    cart.totalItems -= existingItem.quantity;

    cart.totalPrice -= oldProductPrice;

    cart.items.splice(index, 1);

    await cart.save();

    res.status(204).json({});
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
