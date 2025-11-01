const express = require("express");
const dotenv = require("dotenv");

const app = express();

const port = process.env.PORT

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("App is running...");
});
