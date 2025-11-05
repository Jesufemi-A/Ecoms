const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");

exports.signup = async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json({
      status: "success",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
