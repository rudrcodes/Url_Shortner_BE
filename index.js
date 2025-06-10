import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.get("/test", (req, res) => {
  res.send("Working fine ✅");
});
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
