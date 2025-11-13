const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://dainty-heliotrope-2412ef.netlify.app",
    ],
  })
);

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cnv9fix.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("studyMatedb");
    const studentCollection = db.collection("students");
    const userConnectionCollection = db.collection("userConnections");

    app.get("/partners", async (req, res) => {
      const result = await studentCollection.find().toArray();
      res.send(result);
    });

    app.get("/my-connection", async (req, res) => {
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

    app.get("/latest-partners", async (req, res) => {
      const result = await studentCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    app.post("/partners", async (req, res) => {
      const data = req.body;
      const result = await studentCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    app.get("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentCollection.findOne(query);
      res.send({
        success: true,
        result,
      });
    });

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

    app.delete("/partners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentCollection.deleteOne(query);

      res.send({
        success: true,
        result,
      });
    });

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

    // Add a partner to user's connections
    app.post("/myConnections", async (req, res) => {
      const { userEmail, partnerId } = req.body;

      const exists = await userConnectionCollection.findOne({
        userEmail,
        partnerId: new ObjectId(partnerId),
      });

      const result = await userConnectionCollection.insertOne({
        userEmail,
        partnerId: new ObjectId(partnerId),
        createdAt: new Date(),
      });

      res.send({ success: true, result });
    });

    app.get("/myConnections", async (req, res) => {
      const { userEmail } = req.query;

      const connections = await userConnectionCollection
        .find({ userEmail })
        .toArray();
      const partnerIds = connections.map((c) => new ObjectId(c.partnerId));
      const partners = await studentCollection
        .find({ _id: { $in: partnerIds } })
        .toArray();

      res.send(partners);
    });

    app.delete("/myConnections/:partnerId", async (req, res) => {
      const { partnerId } = req.params;
      const { userEmail } = req.query;

      const result = await userConnectionCollection.deleteOne({
        userEmail,
        partnerId: new ObjectId(partnerId),
      });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .send({ success: false, message: "Connection not found" });
      }

      res.send({
        success: true,
        message: "Connection deleted successfully",
        result,
      });
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
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
