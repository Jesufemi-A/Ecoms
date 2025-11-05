const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

exports.signup = async (req, res, next) => {
  try {
    const newUser = new User(req.body);

    newUser.password = await bcrypt.hash(
      newUser.password,
      parseInt(process.env.SALT)
    );
    newUser.confirmPassword = undefined;
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser.userId, userEmail: newUser.userEmail },
      process.env.SECRET_KEY
    );

    res.status(201).json({
      status: "sign up successful",
      data: {
        token,
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
