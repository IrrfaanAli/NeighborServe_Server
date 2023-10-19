const express = require('express');
const router = express.Router();
const  client = require('../database/db')

const usersCollection = client.db("NeighborServe").collection("User");
    
      router.get('/', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });


module.exports = router;
