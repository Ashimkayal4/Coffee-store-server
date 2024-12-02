
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xvswz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffee')
        const userCollection = client.db('userDB').collection('users')

        // user related
        // No:1 => get a new user and save into db
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        // No:2 => find user and show into server via api
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // No:3 => Update existing login user info using patch
        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const update = {
                $set: {
                    lastSignInTime:req.body?.lastSignInTime
                }
            }
            const result = await userCollection.updateOne(filter, update);
            res.send(result);
        })

        // No:4 => delete user from database(mongodb)
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })




        // product related
        // No:1 => get new data from the client site and save in database(mongodb).
        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result)
        })
    
        // No:2 => find from the data from database(mongodb) and show in server site as an array .
        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //No:3.1 => find specific data from database(mongodb).
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query)
            res.send(result);
        })

        //No:3.2 => after find update a specific data in database(mongodb)
        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;

            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                }
            };
            const result = await coffeeCollection.updateOne(filter, coffee, options);
            res.send(result);
        })

        //No:4 => delete from the server site and also in database(mongodb)
        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const result = await coffeeCollection.deleteOne(query);
            res.send(result)
        })


        // Send a ping to confirm a successful connection

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('coffee server is running! ')
})

app.listen(port, () => {
    console.log(`coffee server is running in ${port}`);
})