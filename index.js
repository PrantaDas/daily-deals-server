const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nt1tx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        console.log('db is connected')

        const productCollection = client.db('dailydeals').collection('products');

        // load all products

        app.get('/products', async (req, res) => {
            const query = {};
            const cursonr = productCollection.find(query);
            const result = await cursonr.toArray();
            res.send(result);
        })

        // sigle item by id 

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        // update quantity

        app.put('/products/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            console.log(item);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: item.quantity
                }
            }

            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
    }
    finally {

    }
}




// test api endpoint
app.get('/', (req, res) => {
    res.send('Hello World from server');
})


app.listen(port, () => {
    console.log('listenin to the port', port);
})

run().catch(console.dir);