require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs   = require( "fs" );
const dir  = "public/";
const app = express();
const path = require('path')
app.use(express.static("public") )
app.use(express.json() )
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//connect to the DB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let collection = null

async function run() {
    await client.connect();
    collection = client.db('myDB').collection('myCollection0');

    app.get("/docs", async (req, res) => {
        if (collection !== null) {
            const docs = await collection.find({}).toArray()
            res.json(docs)
        }
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run();

async function switchToAnotherCollection(collectionName) {
    await client.connect();
    console.log("Switch Collection");
    const collection = client.db('myDB').collection(collectionName);
    app.get("/docs", async (req, res) => {
        if (collection !== null) {
            const docs = await collection.find({}).toArray()
            res.json(docs)
        }
    })
}


app.use( (req,res,next) => {
    if( collection !== null ) {
        next()
    }else{
        res.status( 503 ).send()
    }
})

const appdata = [
    { "model": "toyota", "year": 1999, "mpg": 23 },
    { "model": "honda", "year": 2004, "mpg": 30 },
    { "model": "ford", "year": 1987, "mpg": 14}
]





//show the table
app.get('/result', (req, res) => {
    const currentYear = new Date().getFullYear();
    appdata.forEach(item => {
        item.age = currentYear - item.year;
    });
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(appdata))
});

app.post('/login', async (req, res) =>{
    const{username, password} = req.body;
    const user = await collection.findOne({ Username: username, Password:password });
    if(user){
        res.send('Login successful!');
    } else {
        res.status(401).send('Unauthorized');
    }
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

// add data DB
app.post('/add',async (req, res) => {
    const newData = req.body;
    const currentYear = new Date().getFullYear();
    newData.age = (currentYear - newData.year);
    const result = await collection.insertOne(newData);
    res.json({message: 'Data added successfully', data: newData});
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

