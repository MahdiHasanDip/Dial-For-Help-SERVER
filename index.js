const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require("cors")
const app =express();
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

// port 
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

//Connect to DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ujchq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });









async function run(){
    try{
        await client.connect();
        console.log('db connected successfully');
        const database = client.db('dial_for_help')
        const ServiceCollection = database.collection('Service')
        const userCollection = database.collection('users')


    // post service - 
        app.post('/service', async(req,res)=>{
            const service = req.body
            console.log('post hit successfully',service);
            const result = await ServiceCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });
  
    // post user -
        app.post('/users', async(req,res)=>{
            const user = req.body
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
    
    // upsert user -
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });
    // make admin 
    app.put('/users/admin',  async (req, res) => {
        const user = req.body;       
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result);       
    })
    // get admin 
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    });

    // get service api-
        app.get('/service', async(req, res) =>{
           const cursor = ServiceCollection.find({});
           const service = await cursor.toArray();
           res.send(service);           
        });
    
  
    // get user api-
        app.get('/users', async(req, res) =>{
           const cursor = userCollection.find({});
           const user= await cursor.toArray();
           res.send(user);           
        });
   


    // delete service-
        app.delete('/service/:id' , async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}; 
            const result = await ServiceCollection.deleteOne(query);
            res.json(result);
            console.log("delete id",result);
        });
    }

    finally{
        // await client.close();
    };
};


run().catch(console.dir);



app.get('/',(req, res)=>{
    res.send("Server is running!!!")
});


app.listen(process.env.PORT || port, (req, res) => {
    console.log("listen to port",port);
});