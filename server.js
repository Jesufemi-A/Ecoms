const express = require("express");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const app = require("./app");

const port = process.env.PORT || 3000;

dotenv.config({
  path: "./config.env",
});

// const app = require("./app");
async function runGetStarted() {
  // Replace the uri string with your connection string
  const uri = process.env.DATABASE_LOCAL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB! Database is running");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
runGetStarted();

app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});
