const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(express.json()); //express.json() is a built-in middleware provided by Express to parse JSON data from incoming requests.
app.use(cors());
mongoose
  .connect(
    "mongodb+srv://ajay_singh:ajay123@cluster0.gdntiox.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to Mongoo db");
  })
  .catch((error) => {
    console.log("Error", error);
  });
const userSchema = new mongoose.Schema({
  Fullname: String,
  email: String,
  mobile: Number,
  password: String,
});

const User = mongoose.model("User", userSchema);
const key = "123451234av";
// To get the user data

app.get("/getUser", async (req, res) => {
  try {
    const users = await User.find(); //Use the Mongoose model to find all users in the database
    res.json({
      msg: "Successfully",
      status: 200,
      data: users,
    });
  } catch (err) {
    console.log("Error", err);
    res.json({
      msg: "Internal Server Error",
      status: "500",
    });
  }
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let users = await User.find({ email });
  if (users.length != 0) {
    bcrypt.compare(password, users[0].password, function (err, result) {
      // result == false
      if (result) {
        let token = jwt.sign({ user: users[0] }, key);
        res.json({
          mssg: "login success",
          user: users[0],
          token: token,
          status: 200,
        });
      } else {
        res.json({
          mssg: "incorrect password",
          status: 400,
        });
      }
    });
  }
});
app.post("/createUser", async (req, res) => {
  const { Fullname, email, mobile, password } = req.body;
  if (!Fullname || !email || !mobile || !password) {
    return res.json({ msg: "All Fields Are Required", status: 400 });
  }

  bcrypt.hash(password, 10, async function (err, hash) {
    // Store hash in your password DB.
    if (err) {
      console.log("Password is not encrypted ", err);
    } else {
      const newUser = new User({ ...req.body, password: hash });

      try {
        const user = await newUser.save();
        console.log("User saved to the database:", user);
        res.json({
          msg: "Successfully Created",
          status: "201",
          data: user,
        });
      } catch (err) {
        console.error("Error", err);
        res.json({
          msg: "User is not Created",
          status: "400",
        });
      }
    }
  });
});

app.delete("/deleteUser/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const deletedUser = await User.findByIdAndRemove(userId);
    if (deletedUser) {
      res.json({
        msg: "User Deleted Successful",
        status: 200,
        data: deletedUser,
      });
    } else {
      res.json({
        msg: "User Not found",
        status: 404,
      });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({
      msg: "Internal Server Error",
      status: "500",
    });
  }
});

app.put("/updateUser/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { Fullname, email, mobile, password } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { Fullname, email, mobile, password },
      { new: true }
    );
    if (updatedUser) {
      res.json({
        msg: "User Updated Successfully",
        status: 200,
        data: updatedUser,
      });
    } else {
      res.json({
        msg: "User Not found",
        status: 404,
      });
    }
  } catch (err) {
    console.log("Error", err);
    res.status(500).json({
      msg: "Internal Server Error",
      status: "500",
    });
  }
});

//To Filter the User Data
app.get("/filterUsers", async (req, res) => {
  const { Fullname, email, mobile } = req.body;
  const filter = {};

  // Check if query parameters exist and build the filter object accordingly
  if (Fullname) {
    filter.Fullname = Fullname;
  }
  if (email) {
    filter.email = email;
  }
  if (mobile) {
    filter.mobile = mobile;
  }

  try {
    const filteredUsers = await User.find(filter); // Use the Mongoose model to find users based on the filter
    res.json({
      msg: "Filter Successful",
      status: 200,
      data: filteredUsers,
    });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({
      msg: "Internal Server Error",
      status: "500",
    });
  }
});

app.listen(port, (error) => {
  if (error) {
    return console.log("something went wrogn");
  }
  console.log(`Server is running on port ${port}`);
});
