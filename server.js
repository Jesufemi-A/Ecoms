const express = require("express");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({
  path: "./config.env",
});

const port = process.env.PORT || 3000;
const uri = process.env.DATABASE_LOCAL;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log("Connected successfully to MongoDB! Database is running");
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});
