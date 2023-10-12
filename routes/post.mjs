import express from "express";
import { nanoid } from "nanoid";
import { client } from "./../mongodb.mjs";
import { ObjectId } from "mongodb";
import "dotenv/config";
import OpenAI from "openai";

const db = client.db("dbcrud"); // create database  // document base database
const col = db.collection("posts"); // create collection

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let router = express.Router();


// search : /api/v1/search?q=car
router.get('/search', async (req, res, next) => {

  try {
      const response = await openaiClient.embeddings.create({
          model: "text-embedding-ada-002",
          input: req.query.q,
      });
      const vector = response?.data[0]?.embedding
      console.log("vector: ", vector);
      // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

      // Query for similar documents.
      const documents = await col.aggregate([
          {
              "$search": {
                  "index": "vectorIndex",
                  "knnBeta": {
                      "vector": vector,
                      "path": "embedding",
                      "k": 20 // number of documents
                  },
                  "scoreDetails": true

              }
          },
          {
              "$project": {
                  "embedding": 0,
                  "score": { "$meta": "searchScore" },
                  "scoreDetails": { "$meta": "searchScoreDetails" }
              }
          }
      ]).toArray();
      
      console.log(`${documents.length} records found `);
      documents.map(eachMatch => {
          console.log(`score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(eachMatch)}\n\n`);
      })

    res.send(documents);

  } catch (e) {
      console.log("error getting data mongodb: ", e);
      res.status(500).send('server error, please try later');
  }

})


// POST    /api/v1/post
router.post("/post", async (req, res, next) => {
  console.log("this is signup!", new Date());

  if (!req.body.title || !req.body.text) {
    res.status(403);
    res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
    return;
  }

  try {
    const insertResponse = await col.insertOne({
        // _id: "7864972364724b4h2b4jhgh42",
        title: req.body.title,
        text: req.body.text,
        createdOn: new Date()
    });

    console.log("insertResponse : ", insertResponse);

    res.send("post created");
  } catch (err) {
    console.log(" error inserting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});
// GET     /api/v1/posts
router.get("/posts", async (req, res, next) => {

  const cursor = col.find({})
  .sort({ _id: -1 })
  .limit(100);


  try {
    let results = await cursor.toArray();
    console.log("results: ", results);
    res.send(results);
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// GET     /api/v1/post/:postId
router.get("/post/:postId", async (req, res, next) => {

    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

  try {
        let result = await col.findOne({ _id: new ObjectId(req.params.postId) });
        console.log("result: ", result); // [{...}] []
        res.send(result);
    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }

  res.send("post not found with id " + req.params.postId);
});

router.put("/post/:postId", async(req, res, next) => {

    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

    if (!req.body.text && !req.body.title) {
        res.status(403).send(`required parameter missing, atleast one key is required.
            example put body: 
            PUT     /api/v1/post/:postId
            {
                title: "updated title",
                text: "updated text"
            }
        `);
    }

    let dataToBeUpdated = {};

    if(req.body.title){dataToBeUpdated.title = req.body.title};
    if(req.body.text){dataToBeUpdated.text = req.body.text};

    try {
        const updateResponse = await col.updateOne({
            _id: new ObjectId(req.params.postId)
        },
            {
                $set: dataToBeUpdated
            });

        console.log("updateResponse : ", updateResponse);
    
        res.send("post updated");
      } catch (err) {
        console.log(" error inserting mongodb : ", err);
        res.status(500).send("server error, please try later..");
      }
});

// DELETE  /api/v1/post/:userId/:postId
router.delete("/post/:postId", async(req, res, next) => {

  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
}

  try {
    const deleteResponse = await col.deleteOne({ _id: new ObjectId(req.params.postId) });
    console.log("deleteResponse : ", deleteResponse);

    res.send("post delete");
  } catch (err) {
    console.log(" error deleting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }

});

export default router;
