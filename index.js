const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://cart-project-77889.web.app',
      ],
     credentials: true,
     optionalSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hmtao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
    
     const productsCollection = client.db("shopSlick").collection("products");
     const cartsCollection = client.db("shopSlick").collection("carts");

     //Get all products from db
     app.get('/products', async(req, res) => {
        const search = req.query.search || '';
        
        let query = {
            title: { $regex: search, $options: 'i'},
        }
        const result = await productsCollection.find(query).toArray();
        res.send(result);
     })
     
     //carts collection
     app.get('/carts', async (req, res) => {
       const email = req.query.email;
       const query = { email: email };
       const result = await cartsCollection.find(query).toArray();
       res.send(result);
     })


     app.post('/carts', async (req, res) => {
       const cartItem = req.body;
       const result = await cartsCollection.insertOne(cartItem);
       res.send(result);
     })
    
    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId (id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From ShopSlick Server')
})

app.listen(port, () => {
    console.log(`Shop Server is running on port: ${port}`);
})