import express from "express";
import Users from "../models/user.js";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const router = express.Router();

const userAlreadyExists = async (username) => {
  try {
    const isUserExists = await Users.findOne({ username: username });
    console.log("isUserExists inside: ", isUserExists);
    return isUserExists;
  } catch (error) {
    // return new Error('Error in finding User')
    return false;
  }
};

router.post("/login", async (req, res) => {
  // Already existing user
  // Steps:
  // - Check if the user exists or not

  try {
    const body = req.body;
    const isUserExists = await userAlreadyExists(body.username);
    console.log("isUserExists Login: ", isUserExists);

    if (!isUserExists) {
      return res.status(400).json({
        data: null,
        message: "User Doesn't exists",
        status: 400,
      });
    }

    // If the user exists , find the user and then create a JWT for them for keeping track of the session

    let authToken = jwt.sign(
      // { body },
      { isUserExists },
      // { isUserExists },
      process.env.JWT_SECRET_KEY
    );
    console.log("authToken: ", authToken);

    return res.status(200).json({
      data: isUserExists,
      message: "Successfully Logged in",
      authToken: authToken,
      status: 200,
    });
  } catch (error) {
    console.log("error in Login: ", error);
    res.status(400).json({
      data: null,
      message: "Error in Logging in Second",
      status: 400,
    });
  }
});

router.post("/sign-up", async (req, res) => {
  // Creating new user

  //and then log that user in

  // Steps:
  // - Check if the user exists or not

  const body = req.body;

  try {
    const isUserExists = await userAlreadyExists(body.username);
    console.log("isUserExists Sign Up: ", isUserExists);

    if (isUserExists) {
      return res.status(200).json({
        data: isUserExists,
        message: "User Already Exists",
        status: 400,
      });
    }

    const saltRounds = 10;
    let hashedPass = bcrypt.hashSync(body.password, saltRounds);
    console.log("hashedPass: ", hashedPass);

    const newUser = await Users.create({
      username: body.username,
      password: hashedPass,
    });

    console.log("newUser: ", newUser);

    console.log("body SignUp:", body);

    //the response will vary on the db's response

    res.status(201).json({
      data: newUser,
      message: "User Created Successfully",
      status: 201,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json({
      data: null,
      message: "User doesn't exists",
      status: 400,
    });
  }
});

export default router;
