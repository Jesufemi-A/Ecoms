const express = require("express");
const productController = require("./../controllers/productController");
const authcontroller = require("./../controllers/authController");
const uploadSingle = require("./../middleware/multerMiddleware");

const router = express.Router();

router
  .route("/")
  .get(
    authcontroller.protectRoute,
    authcontroller.restrictTo(["admin", "user"]),
    productController.getProducts
  )
  .post(
    authcontroller.protectRoute,
    authcontroller.restrictTo("admin"),
    uploadSingle,
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .delete(
    authcontroller.protectRoute,
    authcontroller.restrictTo("admin"),
    productController.deleteProduct
  )
  .patch(
    authcontroller.protectRoute,
    authcontroller.restrictTo("admin"),
    productController.updateProduct
  );

module.exports = router;
