import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  authToken: String,
  shortenedUrls: [
    {
      url: { type: String, required: true },
      clickCount: { type: Number, default: 0 },
    },
  ],
});

const Users = mongoose.model("Users", userSchema);

export default Users;
