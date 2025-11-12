const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://studyMate:acRoIV10oIB7lLj8@cluster0.cnv9fix.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // All api will go here
    const db = client.db("studyMatedb");
    const studentCollection = db.collection("students");

    // get method
    app.get("/partners", async (req, res) => {
      const result = await studentCollection.find().toArray();
      res.send(result);
    });

    // my connection api
    app.get("/my-conncetion", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email };
      }
      const result = await studentCollection.find(query).toArray();
      console.log(result);
      res.send({
        success: true,
        result,
      });
    });

    // top rated data
    app.get("/latest-partners", async (req, res) => {
      const result = await studentCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .toArray();
      res.send(result);
      console.log(result);
    });

    // post method here
    app.post("/partners", async (req, res) => {
      const data = req.body;
      const result = await studentCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // getting single data
    app.get("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentCollection.findOne(query);
      res.send({
        success: true,
        result,
      });
    });

    // update api

    app.put("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const updateData = { $set: data };
      const result = await studentCollection.updateOne(query, updateData);
      res.send({
        success: true,
        result,
      });
    });

    // delete api
    app.delete("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentCollection.deleteOne(query);

      res.send({
        success: true,
        result,
      });
    });

    // count update api

    app.patch("/partners/:id/increment", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const update = { $inc: { partnerCont: 1 } };

      const result = await studentCollection.updateOne(query, update);

      res.send({
        success: true,
        result,
      });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDBsss!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
