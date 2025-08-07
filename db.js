//all the DB settings will go here

import mongoose from "mongoose";

const URI =
  process.env.MONGO_URI ??
  "mongodb+srv://aggarwalrudransh:KB9scBKgDxpwH6r3@cluster0.uzyhncf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
