const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const dotenv = require("dotenv");
const AppError = require("../errorHandler/appError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    return null;
  }
}

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

    const verifyToken = await promisify(jwt.verify)(
      token,
      process.env.SECRET_KEY
    );

    if (!verifyToken) {
      throw new AppError("Please log in...", 401);
    }

    const currentUser = await User.findById(verifyToken.id);

    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token no longer exist",
        401
      );
    }

    req.user = currentUser;

    next();
  } catch (error) {
    next(error);
  }
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to this route", 403));
    } else {
      next();
    }
  };

exports.googleAuth = (req, res) => {
  const redirectUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    }).toString();
  res.redirect(redirectUrl);
};

exports.googleCallback = async (req, res, next) => {
  try {
    const code = req.query.code;

    if (!code) {
      return next(new AppError("No code return from Google", 400));
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token, access_token } = tokenResponse.data;

    const googleUser = await verifyGoogleIdToken(id_token);

    if (!googleUser)
      return next(new AppError("Google ID Token verification failed"), 404);

    const [firstName, ...rest] = googleUser.name.split(" ");

    const lastName = rest.join(" ");

    let user = await User.findOne({
      email: googleUser.email,
    });

    if (!user) {
      user = await User.create({
        email: googleUser.email,
        googleId: googleUser.sub,
        firstName,
        lastName,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: process.env.EXPIRES_IN }
    );

    res.status(200).json({
      status: "success",
      message: "Google login successful",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
