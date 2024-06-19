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

  console.log("\nPerforming healthcheck");

  if (matches) {
    res.json({
      message: "Working correctly",
    });
    console.log("Health check finished\n");
  } else {
    res.status(401);
    res.json({ message: "Forbidden" });
    console.log("Health check failed");
  }
});

const client = new MongoClient(process.env.MONGODB_URI);

app.post("/upsert", async (req, res) => {
  const auth = req.headers["authorization"];
  const matches = auth === process.env.USER_AUTH;

  console.log(`\nUpserting surf day matching filter: '${req.body.date}'`);

  if (matches) {
    try {
      console.log("Connecting to db");
      await client.connect();
      console.log("Upserting record");
      await client
        .db("surfdays")
        .collection("days")
        .findOneAndReplace({ date: req.body.date.toString() }, req.body, {
          upsert: true,
        });
      res.json({ message: "Upserted record", data: req.body });
      console.log(
        `Successfully upserted record '${JSON.stringify(req.body)}'\n`
      );
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

app.post("/delete", async (req, res) => {
  const auth = req.headers["authorization"];
  const matches = auth === process.env.USER_AUTH;

  console.log(
    `\nDeleting surf day(s) matching filter: '${JSON.stringify(req.body)}'`
  );

  if (matches) {
    try {
      console.log("Connecting to db");
      await client.connect();
      console.log("Deleting record(s)");
      await client.db("surfdays").collection("days").deleteMany(req.body);
      res.json({ message: "Deleted record", data: req.body });
      console.log(
        `Successfully deleted record(s) with filter: '${JSON.stringify(
          req.body
        )}'\n`
      );
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
