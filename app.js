const express = require("express");
const productsRouter = require("./routes/productsRouter");
const userRouter = require("./routes/userRouter");
const AppError = require("./errorHandler/appError");
const globalErrorHandler = require("./errorHandler/globalErrorHandler");
const cartRouter = require("./routes/cartRouter");

const app = express();

app.use(express.json());

/* Routes */
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/cart", cartRouter);

app.all("/{*any}", (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
