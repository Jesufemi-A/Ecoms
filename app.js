const express = require("express");
const productsRouter = require("./routes/productsRouter");

const app = express();

/* Routes */

app.use("/api/v1", productsRouter);

module.exports = app;
