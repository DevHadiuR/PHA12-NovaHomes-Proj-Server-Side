const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { verify } = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// middleweare
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Nova Homes Server Site Activate!");
});

// Mongodb database start from here

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.vuymtad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // All Collections are here
    const userCollection = client.db("novaHomesDB").collection("users");
    const wishlistCollection = client.db("novaHomesDB").collection("wishlists");
    const propertyCollection = client
      .db("novaHomesDB")
      .collection("properties");

    // users collection
    app.post("/allUsers", async (req, res) => {
      const userInfo = req.body;
      console.log(userInfo);
      const email = userInfo.email;
      const query = { email: email };
      const isEmailExist = await userCollection.findOne(query);
      if (isEmailExist) {
        return res.send({ message: "Email Already Exist!" });
      }
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    });

    app.get("/allUsers", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // make user admin route
    app.patch("/allUsers/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // make user agent route
    app.patch("/allUsers/agent/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "agent",
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // make user fraud route
    app.patch("/allUsers/fraud/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "fraud",
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // handle user delete route
    app.delete("/allUsers/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // handle user role route
    app.get("/allUsers/userRole/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      let userRole = "";
      if (user) {
        userRole = user?.role;
      }

      res.send({ userRole });
    });

    // Property Collection
    app.get("/allProperties", async (req, res) => {
      const result = await propertyCollection.find().toArray();
      res.send(result);
    });

    app.post("/allProperties", async (req, res) => {
      const propertyItem = req.body;
      const result = await propertyCollection.insertOne(propertyItem);
      res.send(result);
    });

    app.get("/allProperties/:email", async (req, res) => {
      const email = req.params.email;
      const query = { agentEmail: email };
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/propertiesById/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    });

    app.patch("/allProperties/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const existingProperty = await propertyCollection.findOne(query);
      const updatedProperty = {
        $set: {
          ...existingProperty,
          ...body,
        },
      };
      const result = await propertyCollection.updateOne(query, updatedProperty);
      res.send(result);
    });

    app.delete("/allProperties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await propertyCollection.deleteOne(query);

      res.send(result);
    });

    app.patch("/allProperties/verified/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          verificationStatus: "Verified",
        },
      };

      const result = await propertyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/allProperties/reject/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          verificationStatus: "Rejected",
        },
      };

      const result = await propertyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/allAdminVerifiedProperites", async (req, res) => {
      const query = { verificationStatus: "Verified" };
      const result = await propertyCollection.find(query).toArray();
      res.send(result);
    });

    // wishlist collection from here
    app.post("/allWishlist", async (req, res) => {
      const wishlistInfo = req.body;
      const propertyId = wishlistInfo.propertyId;
      const query = { propertyId: propertyId };
      const isWishlistExist = await wishlistCollection.findOne(query);
      if (isWishlistExist) {
        return res.send({ message: "Property Already Exist in the Wishlist!" });
      }
      const result = await wishlistCollection.insertOne(wishlistInfo);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running on port : ", port);
});
