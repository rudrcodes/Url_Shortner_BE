import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

//importin all routers here
import authRouter from "./Routes/auth.api.js";
import shortItRouter, { verifyToken } from "./Routes/shortIt.api.js";
import dbConnect from "./db.js";
import bodyParser from "body-parser";
import Users from "./models/user.js";

// setup
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get("/test", (req, res) => {
  res.send("Working fine ✅");
});

//Routes
app.use("/auth/", authRouter);
app.use("/shortIt/", shortItRouter);

//get the shorten urls for that particular user
app.get("/getAllLinks", async (req, res) => {
  try {
    let authToken = req.headers.authorization;
    authToken = authToken?.split(" ")[1];

    //verify the token
    const { decoded, verified } = verifyToken(authToken);

    if (!verified) {
      console.log("Not verified");
    }

    const userData = decoded.isUserExists;

    const userDb = await Users.findById(userData?._id);
    console.log('userDb: ',userDb)

    console.log("authToken getAllLinks: ", authToken);
    console.log("decoded getAllLinks: ", decoded);
    return res.status(200).json({
      data: userDb.shortenedUrls ?? [],
      message: "Fetched all Links",
      status: 200,
    });
  } catch (error) {
    console.error("Error in getAllLinks: ", error);
  }
});

//connecting to DB
dbConnect();
app.listen(PORT, () => {
  console.log(
    `Server running on PORT: ${PORT} , open this link to check: `,
    `http://localhost:${PORT}/test`
  );
});
