const sendErrorDev = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res, next) => {
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res, next);
  else sendErrorProd(err, req, res, next);
};
