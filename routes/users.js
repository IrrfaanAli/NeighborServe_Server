const express = require('express');
const router = express.Router();
const  client = require('../database/db')

const usersCollection = client.db("NeighborServe").collection("User");
    
      router.get('/', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });


      router.get('/service_history', async (req, res) => {
  try {
    const serviceCollection = client.db("NeighborServe").collection("serviceHistory");
    const serviceHistory = await serviceCollection.find({}).limit(10).toArray();
    res.json(serviceHistory);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

module.exports = router;
