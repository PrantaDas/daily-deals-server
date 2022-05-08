const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
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



        function verifyJWT(req, res, next) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).send({
                        message
                            : 'forbidden access'
                    })
                }
                console.log('decoded', decoded);
                req.decoded = decoded;
            })
            console.log('inside jwt',authHeader);
            next();
        }

        app.get('/myitems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            console.log(email);
            const items = { email: email };
                const cursor = productCollection.find(items);
                const result = await cursor.toArray();
                res.send(result);
            if (email === decodedEmail) {
                const items = { email: email };
                const cursor = productCollection.find(items);
                const result = await cursor.toArray();
                res.send(result);
            }
            else{
                res.status(403).send(({message:'forbidden access'}))
            }
            
            console.log(result);

        })


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

        // login api 

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // update quantity
        // update restock quantity

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

        // Delete a product

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // add a new product

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // search by query using email



        // app.get('/products', async (req, res) => {
        //     const items= { "name":"John" };
        //     const cursor = productCollection.find(items);
        //     const result = await cursor.toArray();
        //     res.send(result)
        // })



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