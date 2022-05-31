const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const helmet = require("helmet");


//const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_USER_PASS}@cluster0.jxw9d.mongodb.net/myFirstDataBase?retryWrites=true&w=majority`;
mongoose.connect(uri)
    .then(() => {
        console.log("success");
    }) 
    .catch((error) => {
        console.log(error);
    }) 
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//client.connect(err => {
//    const collection = client.db("test").collection("devices");
//    console.log(err);
    // perform actions on the collection object
//    client.close();
//});

const app = express();

app.use(bodyParser.json());
//app.use(helmet());detection d'image de mon ordinateur blocage au niveau de la lecture pour la lecture de mes images en localhost
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);



module.exports = app;