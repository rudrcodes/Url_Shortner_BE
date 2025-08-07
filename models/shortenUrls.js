//create schema and modal for storing all the urls that have been shortened  by any user

import { model, Schema } from "mongoose";

const shortenUrlSchema = Schema({
  shortUrl: String,
  originalUrl: String,
  clickCount: { type: Number, default: 0 },
});

const AllShortenedUrls = model("AllShortenedUrls", shortenUrlSchema);

export default AllShortenedUrls;
