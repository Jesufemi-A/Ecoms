const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
const AppError = require("../errorHandler/appError");

const verifyPassword = async (passwordInput, passwordHash) => {
  return await bcrypt.compare(passwordInput, passwordHash);
};

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
      process.env.SECRET_KEY,
      { expiresIn: process.env.EXPIRES_IN }
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
    const { email, password } = req.body;
    const currentUser = await User.findOne({ email: email });
    // console.log(currentUser);
    if (currentUser && verifyPassword(password, currentUser.password)) {
      const token = jwt.sign({ id: currentUser.id }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRES_IN,
      });
      // console.log(currentUser.id);
      res.status(200).json({
        status: "Login Successful",
        data: {
          token,
          user: currentUser,
        },
      });
    } else {
      throw new AppError("Incorrect email or password", 404);
    }
  } catch (error) {
    next(error);
  }
};

exports.protectRoute = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) throw new AppError("You are not logged in. Please log in", 401);

    console.log("Token " + token);
    const verify = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    console.log("verifyy " + verify);
    if (!verify) {
      throw new AppError("Please log in...", 401);
    }
    next()
  } catch (error) {
    next(error);
  }
};
