import express from "express";

import jwt from "jsonwebtoken";
import AllShortenedUrls from "../models/shortenUrls.js";
import Users from "../models/user.js";

const router = express.Router();

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return { decoded, verified: true };
  } catch (error) {
    return { decoded: null, verified: false };
  }
};

async function checkIfRandomHashIsAlreadyPresent(randomHash) {
  const res = await AllShortenedUrls.findOne({
    shortUrl: randomHash,
    // shortUrl: generateRandomHash(),
  });
  console.log("res checkIfRandomHashIsAlreadyPresent: ", res);

  return res;
}

const generateRandomHash = async (userId) => {
  let flag = true;

  // let randomHash = Math.random().toString(36).substring(2, 9);

  // IMPORTANTPOINT:  if we have userId this means an account holder is shortening the url -> hence we will keep track of the url , else we just will generate a normal randomHash

  let randomHash = userId
    ? jwt.sign(
        // { body },
        { userId },
        // { isUserExists },
        process.env.JWT_SECRET_KEY
      )
    : Math.random().toString(36).substring(2, 9);

  while (flag) {
    if (!flag) return randomHash;
    const res = await checkIfRandomHashIsAlreadyPresent(randomHash);

    if (res) {
      //when two people will try to shorten the same url , we will serve them the same shortened url
      randomHash = userId
        ? jwt.sign(
            // { body },
            { userId },
            // { isUserExists },
            process.env.JWT_SECRET_KEY
          )
        : Math.random().toString(36).substring(2, 9);
    } else {
      flag = false;
    }
  }

  return randomHash;
};

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    console.log("post body:", body);
    //get the JWT token from the req header and verify it

    let reqAuthToken = req.headers.authorization;
    reqAuthToken = reqAuthToken?.split(" ")[1];

    //before generating we will check if the url already exists , if yes then will serve them the same url

    const isUrlExists = await AllShortenedUrls.findOne({
      originalUrl: body.url,
    });

    console.log("isUrlExists: ", isUrlExists);

    if (isUrlExists) {
      //save this url in the users array and

      const shortenedUrl =
        process.env.HASH_DOMAIN_NAME + "/redirectTo/" + isUrlExists?.shortUrl;

      if (reqAuthToken) {
        //then save in that particular user's list , else just save in the AllShortenedUrls list
        const { decoded, verified } = verifyToken(reqAuthToken);

        if (!verified) {
          console.log("not verified");
          return res.status(401).json({
            data: null,
            message: "UnAuthorised User",
            status: 401,
          });
        }

        const userData = decoded.isUserExists;

        //find the user

        const user = await Users.findByIdAndUpdate(
          userData?._id,
          {
            $push: {
              shortenedUrls: {
                url: shortenedUrl,
                clickCount: 0,
              },
            },
          },
          { new: true }
        );

        //have to get the user here using the reqAuthToken
        // how can I get the user from their token , token mein user ki details rkhni hongi ya toh?
      }

      //return them this shortUrl
      return res.status(200).json({
        data: shortenedUrl,
        message: "URL Shortened Successfully",
        status: 200,
      });
    }

    //don't check if they are verified or not just shorten the url first and then store it in there urls array if they want to save it in there db urls array

    // checking if the randomHash is already in the AllshortenUrls collection or not

    //if randomHash is already present we will create a new random hash

    const randomHash = await generateRandomHash();

    //save it to the db as it is unique

    await AllShortenedUrls.create({
      shortUrl: randomHash,
      originalUrl: body.url,
      clickCount: 0,
    });

    //we will not check the db if the url is already shortend or not

    // - create a random hash, hash will contain strings and numbers only
    // - hash will be of 7 chars long

    /*
    # .toString(36)
    - This converts a number to a base-36 string.
    - Base-36 uses digits 0–9 and letters a–z.
    */
    //will add my domain with the hash
    const shortenedUrl =
      process.env.HASH_DOMAIN_NAME + "/redirectTo/" + randomHash;

    //save this url into the db , using the JWT token which will be fetched from the req header
    // - if the user is not logged in, then we will not save the url into the db
    // - if the user is logged in, then we will save the url into the db
    // - we will use the JWT token to identify the user

    if (reqAuthToken) {
      //then save in that particular user's list , else just save in the AllShortenedUrls list
      const { decoded, verified } = verifyToken(reqAuthToken);

      if (!verified) {
        console.log("not verified");
        return res.status(401).json({
          data: null,
          message: "UnAuthorised User",
          status: 401,
        });
      }

      console.log("decoded : ", decoded);
      const userData = decoded.isUserExists;

      //find the user

      const user = await Users.findByIdAndUpdate(
        userData?._id,
        {
          $push: {
            shortenedUrls: {
              url: shortenedUrl,
              clickCount: 0,
            },
          },
        },
        { new: true }
      );
      console.log("user found : ", user);

      //have to get the user here using the reqAuthToken
      // how can I get the user from their token , token mein user ki details rkhni hongi ya toh?
    }

    res.status(200).json({
      data: shortenedUrl,
      message: "URL Shortened Successfully",
      status: 200,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json({
      data: null,
      message: "Error in shortening the url",
      status: 400,
    });
  }
});

router.get("/getLink", async (req, res) => {
  const { hashedUrl } = req.query;

  // console.log("getLink body: ", body);
  // console.log("getLink params: ", params);

  try {
    // const response = await AllShortenedUrls.findOne({
    //   shortUrl: hashedUrl,
    // });

    // if we get the authToken from the headers , then update the

    //to get the user details from the hashedUrl , we have to generate the hashedUrl using the user's db id , using JWT

    const response = await AllShortenedUrls.findOneAndUpdate(
      { shortUrl: hashedUrl },
      { $inc: { clickCount: 1 } },
      { new: true } // Return the updated document
    );

    //increase the clickCount of the url on click

    console.log("hashedUrl: ", hashedUrl);

    console.log("response: ", response);
    if (!response) {
      return res.status(404).json({
        data: null,
        message: "Cannot find the url",
        status: 404,
      });
    }

    return res.status(200).json({
      data: response.originalUrl,
      message: "URL Found",
      status: 200,
    });
  } catch (error) {
    console.log("error in getLink: ", error);
    return res.status(400).json({
      data: null,
      message: "Error in getting the url",
      status: 400,
    });
  }
});

export default router;
