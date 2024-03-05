const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login_tut");

//check database connected or not
connect
  .then(() => {
    console.log("Database connected Successfully");
  })
  .catch(() => {
    console.log("Database cannot be connected");
  });

//Create a schema
const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//collection Part
const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;

-----------------------------------------------------------------------------------

  const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config"); // MongoDB collection
const { cp } = require("fs");

const app = express();

// convert data into json format
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use EJS as the view engine
app.set("view engine", "ejs");

// static file
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.user_name,
    password: req.body.user_password,
  };

  // check if the user already exists in the database
  const existingUser = await collection.findOne({ name: data.name });

  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    // hash the password using bcrypt
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword; // Replace the original password with the hashed password

    const userdata = await collection.insertMany(data);
    console.log(userdata);
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.user_name }); // Corrected key name from "username" to "user_name"
    if (!check) {
      res.send("User name not found");
    }

    // compare the hashed password from the database with the plain text password
    const isPasswordMatch = await bcrypt.compare(
      req.body.user_password,
      check.password
    ); // Corrected key name from "password" to "user_password"
    if (isPasswordMatch) {
      res.render("home");
    } else {
      res.send("Wrong password");
    }
  } catch (error) {
    // Added 'error' parameter to catch block
    res.send("Error: " + error.message); // Send error message if any exception occurs
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
// nodemon src/index.js 라고 터미널에 입력 후 localhost:5000 에 접속하면 login, signup, mongoDB확인 가능
