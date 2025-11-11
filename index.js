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

    // update data api
    

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
