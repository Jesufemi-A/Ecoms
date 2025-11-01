const express = require("express");

const router = express.Router();

router.get("/products", (req, res, next) => {
  console.log("Hitting product");
  res.status(200).json("products page");


});

module.exports = router
