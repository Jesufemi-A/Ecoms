const express = require("express");
const productController = require("./../controllers/productController");
const authcontroller = require("./../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(
    authcontroller.protectRoute,
    authcontroller.restrictTo("user"),
    productController.getProducts
  )
  .post(
    authcontroller.protectRoute,
    authcontroller.restrictTo("admin"),
    productController.createProduct
  );

// router.route("/:productId").patch(productController.updateProduct);

module.exports = router;
