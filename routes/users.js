const express = require("express")
const router = express.Router()
const client = require("../database/db")
const { ObjectId } = require("mongodb")
const bcrypt = require("bcrypt")

const usersCollection = client.db("NeighborServe").collection("UsersData")

router.get("/", async (req, res) => {
  const result = await usersCollection.find().limit(5).toArray()
  res.send(result)
})

router.get("/provider", async (req, res) => {
  const query = { user_type: "Service Provider" }

  const result = await usersCollection.find(query).limit(8).toArray()
  res.send(result)
})

router.get("/alluser", async (req, res) => {
  const query = { user_type: "user" }

  const result = await usersCollection.find(query).toArray()
  res.send(result)
})
router.get("/allprovider", async (req, res) => {
  const query = { user_type: "provider" }

  const result = await usersCollection.find(query).toArray()
  res.send(result)
})

router.get("/provider/:type", async (req, res) => {
  const type = req.params.type

  const query = { user_category: type }

  const result = await usersCollection.find(query).limit(12).toArray()
  res.send(result)
})
router.get("/provider/details/:id", async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await usersCollection.findOne(query)
  res.send(result)
})

router.post("/signup", async (req, res) => {
  const {
    user_fullname,
    user_email,
    user_pass,
    user_dob,
    user_gender,
    user_type,
    user_status,
    user_location,
    user_lat,
    user_lon,
    user_phone,
    user_regYear,
  } = req.body

  const query = { user_email }
  const existingUser = await usersCollection.findOne(query)
  if (existingUser) {
    return res.send({ message: "user already exists" })
  }
  const hashedPassword = await bcrypt.hash(user_pass, 10)
  const newUser = {
    user_fullname,
    user_email,
    user_pass: hashedPassword,
    user_dob,
    user_gender,
    user_type,
    user_status,
    user_location,
    user_lat,
    user_lon,
    user_phone,
    user_regYear,
  }
  const result = await usersCollection.insertOne(newUser)
  res.send(result)
})
router.post("/providersignup", async (req, res) => {
  const { user_fullname,
    user_email,
    user_pass,
    user_dob,
    user_gender,
    user_type,
    user_category,
    user_status,
    user_location,
    user_lat,
    user_lon,
    user_phone,
    user_regYear,
    user_hireCount,
    user_verficationStatus,
    user_serviceDetails,
    user_respondTime
  } = req.body
  console.log(req.body)

  const query = { user_email }
  const existingUser = await usersCollection.findOne(query)
  if (existingUser) {
    return res.send({ message: "user already exists" })
  }
  const hashedPassword = await bcrypt.hash(user_pass, 10)
  const newUser = {
    user_fullname,
    user_email,
    user_pass: hashedPassword,
    user_dob,
    user_gender,
    user_type,
    user_category,
    user_status,
    user_location,
    user_lat,
    user_lon,
    user_phone,
    user_regYear,
    user_hireCount,
    user_verficationStatus,
    user_serviceDetails,
    user_respondTime
  }
  const result = await usersCollection.insertOne(newUser)
  res.send(result)
})

router.post("/users/googlelogin", async (req, res) => {
  const user = req.body

  const query = { email: user.email }
  const existingUser = await usersCollection.findOne(query)

  if (existingUser) {
    return res.send({ message: "user already exists" })
  }

  const result = await usersCollection.insertOne(user)
  res.send(result)
})

router.get("/admin/:email", async (req, res) => {
  const email = req.params.email

  const query = { user_email: email }

  const user = await usersCollection.findOne(query)

  const result = { admin: user?.user_type === "admin" }

  res.send(result)
})
router.get("/provider/:email", async (req, res) => {
  const email = req.params.email

  const query = { user_email: email }

  const user = await usersCollection.findOne(query)

  const result = { provider: user?.user_type === "provider" }

  res.send(result)
})
router.get("/user/:email", async (req, res) => {
  const email = req.params.email

  const query = { user_email : email }

  const user = await usersCollection.findOne(query)

  const result = { User: user?.user_type === "user" }

  res.send(result)
  
})




module.exports = router
