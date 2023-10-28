const express = require("express");
const router = express.Router();
const client = require("../database/db");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const usersCollection = client.db("NeighborServe").collection("User");

router.get("/", async (req, res) => {
  const result = await usersCollection.find().limit(5).toArray();
  res.send(result);
});

router.get("/provider", async (req, res) => {
  const query = { user_type: "Service Provider" };

  const result = await usersCollection.find(query).limit(8).toArray();
  res.send(result);
});

router.get("/provider/:type", async (req, res) => {
  const type = req.params.type;

  const query = { user_category: type };

  const result = await usersCollection.find(query).limit(12).toArray();
  res.send(result);
});
router.get("/provider/details/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.findOne(query);
  res.send(result);
});

router.post("/signup", async (req, res) => {
  const { name, email, role, password, phone } = req.body;

  const query = { email };
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    name,
    email,
    role,
    password: hashedPassword,
    phone,
  };
  const result = await usersCollection.insertOne(newUser);
  res.send(result);
});
router.post("/providersignup", async (req, res) => {
  const { name, email, role, password, phone, location, category } = req.body;
  console.log(req.body);

  const query = { email };
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    name,
    email,
    role,
    password: hashedPassword,
    phone,
    location,
    category,
  };
  const result = await usersCollection.insertOne(newUser);
  res.send(result);
});

router.post("/users/googlelogin", async (req, res) => {
  const user = req.body;

  const query = { email: user.email };
  const existingUser = await usersCollection.findOne(query);

  if (existingUser) {
    return res.send({ message: "user already exists" });
  }

  const result = await usersCollection.insertOne(user);
  res.send(result);
});

router.get("/admin/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };

  const user = await usersCollection.findOne(query);

  const result = { admin: user?.role === "admin" };

  res.send(result);
});
router.get("/provider/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };

  const user = await usersCollection.findOne(query);

  const result = { provider: user?.role === "provider" };

  res.send(result);
});
router.get("/user/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };

  const user = await usersCollection.findOne(query);

  const result = { User: user?.role === "user" };

  res.send(result);
});

module.exports = router;
