const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
const AppError = require("../errorHandler/appError");

const verifyPassword = async (passwordInput, passwordHash) => {
  return bcrypt.compare(passwordInput, passwordHash);
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.password,
      phoneNumber: req.body.phoneNumber,
    });

    newUser.password = await bcrypt.hash(
      newUser.password,
      parseInt(process.env.SALT)
    );
    newUser.confirmPassword = undefined;
    const currentUser = await newUser.save();

    console.log(currentUser);

    const token = jwt.sign({ userId: currentUser.id }, process.env.SECRET_KEY, {
      expiresIn: process.env.EXPIRES_IN,
    });

    res.status(201).json({
      status: "sign up successful",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    let token;
    const { email, password } = req.body;
    const userAuth = await User.findOne({ email: email }).select("+password");
    // console.log(userAuth, userAuth.password);
    if (userAuth && (await verifyPassword(password, userAuth.password))) {
      const currentUser = await User.findById(userAuth._id);
      // console.log("current user    " + currentUser);

      token = jwt.sign({ id: currentUser._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRES_IN,
      });
      // console.log(currentUser.id);
      res.status(200).json({
        status: "Login Successful",
        token,
        data: {
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
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) throw new AppError("You are not logged in. Please log in", 401);

    // console.log("Token " + token);
    const verifyToken = await promisify(jwt.verify)(
      token,
      process.env.SECRET_KEY
    );

    // console.log("verify ------------" + verifyToken);
    if (!verifyToken) {
      throw new AppError("Please log in...", 401);
    }

    const currentUser = await User.findById(verifyToken.id);
    // console.log(
    //   "currentUser -----" + currentUser,
    //   "verifyToken -----" + verifyToken
    // );
    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token no longer exist",
        401
      );
    }

    req.user = currentUser;
    // console.log("current User -------" + currentUser);

    next();
  } catch (error) {
    next(error);
  }
};

// const fn = (role) => async(req, res, next);

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to this route", 403));
    } else {
      next();
    }
  };
