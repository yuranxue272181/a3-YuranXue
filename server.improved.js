//connect to the DB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://yxue:nIuX2jIKbDMJPq91@cluster0.eox0sof.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
//run().catch(console.dir);



const appdata = [
    { "model": "toyota", "year": 1999, "mpg": 23 },
    { "model": "honda", "year": 2004, "mpg": 30 },
    { "model": "ford", "year": 1987, "mpg": 14}
]

const express = require('express');
const bodyParser = require('body-parser');
const fs   = require( "fs" );
const dir  = "public/";
const app = express();
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



//show the table
app.get('/result', (req, res) => {
    const currentYear = new Date().getFullYear();
    appdata.forEach(item => {
        item.age = currentYear - item.year;
    });
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(appdata))
});

//Will use database to redo it
const names = [];

app.use(express.json())
app.use(express.static('public'));

///submit name
app.post('/submit', (req, res) => {
    let dataString = '';

    req.on('data', function (data) {
        dataString += data;
    })
    req.on('end', function () {
        const json = JSON.parse(dataString)
        names.push(json)
        req.json = JSON.stringify(names)
        res.writeHead(200, {'Content-Type': 'application/json'})
        console.log(names);
        res.end(req.json)
    });
});

//add data
app.post('/add',(req,res) => {
    const newData = req.body;
    appdata.push(newData);
    console.log(appdata);
    res.json({ message: 'Data added successfully', data: newData });
});


app.put('/update/:id', (req, res) => {
    const indexToUPdate = req.params.id;
    const inputData = req.body;
    console.log(req.params.id);
    console.log(req.body)
    if(indexToUPdate>= 0 && indexToUPdate < appdata.length) {
        appdata[indexToUPdate] = inputData;
        const currentYear = new Date().getFullYear();
        appdata[indexToUPdate].age = currentYear - appdata[indexToUPdate].year;
    }
});

app.delete('/delete', (req, res) => {
    const indexToDelete = req.body.index;
    if(indexToDelete>= 0 && indexToDelete < appdata.length) {
        appdata.splice(indexToDelete,1);
    }
});


app.listen(3000);