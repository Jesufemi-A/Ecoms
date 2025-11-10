const express = require("express");
const authController = require("./../controllers/authController");
const validate = require("./../middleware/validate");
const userSchema = require("./../validation/userSchema");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

module.exports = router;
