const { MongoClient } = require("mongodb");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = 3001;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  const auth = req.headers["authorization"];
  const matches = auth === process.env.USER_AUTH;

  if (matches) {
    res.json({
      message: "Working correctly",
    });
  } else {
    res.status(401);
    res.json({ message: "Forbidden" });
  }
});

const client = new MongoClient(process.env.MONGODB_URI);

app.post("/add", async (req, res) => {
  const auth = req.headers["authorization"];
  const matches = auth === process.env.USER_AUTH;

  if (matches) {
    try {
      await client.connect();
      await client.db("surfdays").collection("days").insertOne(req.body);
      res.json(req.body);
    } catch (err) {
      console.error(err);
    } finally {
      client.close();
    }
  } else {
    res.status(401);
    res.json({ message: "Forbidden" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
