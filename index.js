const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
require('dotenv').config()

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb://${process.env.USER_NAME}:${process.env.USER_PASS}@ac-o9yzcgk-shard-00-00.ymwhs5q.mongodb.net:27017,ac-o9yzcgk-shard-00-01.ymwhs5q.mongodb.net:27017,ac-o9yzcgk-shard-00-02.ymwhs5q.mongodb.net:27017/?ssl=true&replicaSet=atlas-xges0x-shard-0&authSource=admin&retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const usersCollection = client.db("NeighborServe").collection("User");
    
    app.get('/users', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Server Running')
  })
  
  app.listen(port, () => {
    console.log("hello.....");
  })