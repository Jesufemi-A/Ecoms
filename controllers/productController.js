const Product = require("./../models/productModel");
const cloudinary = require("./../cloudinaryConfig");
const AppError = require("../errorHandler/appError");

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

    // Update the database with the new, correct public ID (optional but clean)
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
