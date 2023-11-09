const { MongoClient, ServerApiVersion  } = require('mongodb');

const uri = "mongodb+srv://neighborServe:9lraD8JqrISpGfNq@cluster0.ymwhs5q.mongodb.net/"


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
 await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);

module.exports = client;