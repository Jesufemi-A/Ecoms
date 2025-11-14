const express = require("express");
const cartController = require("./../controllers/cartController");
const authController = require("./../controllers/authController");

const router = express.Router();

// router.route("/").get();

router
  .route("/items")
  .post(
    authController.protectRoute,
    authController.restrictTo("user"),
    cartController.addProduct
  );

module.exports = router;
