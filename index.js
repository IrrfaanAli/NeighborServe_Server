const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
require('dotenv').config()
const users = require('./routes/users')


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users',users);


app.get('/',(req,res)=>{
  res.send("hello");
})


  
  app.listen(port, () => {
    console.log("hello from port 5000");
  })