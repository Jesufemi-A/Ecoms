const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
const AppError = require("../errorHandler/appError");

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

exports.login = async (req, res, next) => {
  try {
    const currentUser = await User.findOne({ email: req.body.email });
    // console.log(currentUser);
    if (currentUser) {
      const token = jwt.sign(
        { id: currentUser.id, email: currentUser.email },
        process.env.SECRET_KEY
      );
      // console.log(currentUser.id);
      res.status(200).json({
        status: "Login Successful",
        data: {
          token,
          user: currentUser,
        },
      });
    } else if (!currentUser) {
      throw new AppError("Incorrect email or password", 404);
    }
  } catch (error) {
    next(error);
  }
};
