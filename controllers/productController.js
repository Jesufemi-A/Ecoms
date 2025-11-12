const Product = require("./../models/productModel");
const cloudinary = require("./../cloudinaryConfig");
const AppError = require("../errorHandler/appError");
const { findById } = require("../models/userModel");

const uploadStreamToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecoms/products/temp",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

exports.getProducts = (req, res, next) => {
  console.log("Hitting product");
  res.status(200).json("products page");
};

exports.createProduct = async (req, res, next) => {
  console.log(process.env.CLOUDINARY_API_KEY);
  try {
    if (!req.file || !req.file.buffer) {
      console.log("request file ---  " + req.file);
      // console.log("request body ---  " + req.body);
      return next(new AppError("No Image provided", 404));
    }

    const uploadResult = await uploadStreamToCloudinary(
      req.file.buffer,
      "ecoms/products/temp"
    );

    const imageUrl = uploadResult.secure_url;
    const tempPublicId = uploadResult.public_id;

    const newProduct = await Product.create({
      name: req.body.name,
      price: req.body.price,
      imageUrl: imageUrl,
      cloudinaryId: tempPublicId,
    });

    const newFolder = `ecoms/products/${newProduct._id}`;
    const newPublicId = `${newFolder}/${newProduct._id}_image`;

    await cloudinary.uploader.rename(tempPublicId, newPublicId, {
      overwrite: true,
    });
    console.log("--------   " + tempPublicId, newPublicId);

    await Product.findByIdAndUpdate(newProduct._id, {
      cloudinaryId: `${newFolder}/${newProduct._id}_image`,
    });

    res.status(201).json({
      status: "success",
      message: "Product and Image created succesfully",
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    console.log(productId);
    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("product does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      message: "product retrieved succesufully",
      data: {
        data: product,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    console.log(deletedProduct);

    if (!deletedProduct) {
      return next(new AppError("product does not exist", 404));
    }

    res.status(204).json({});
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
