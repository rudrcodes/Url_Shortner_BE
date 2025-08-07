//all the DB settings will go here

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
console.log("URI: ", URI);

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(URI);
    console.log("conn: ", conn.connection.host);

    console.log("Successfully Connected to DB ✅");
  } catch (error) {
    console.log("db error: ", error);
  }
};

export default dbConnect;
