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
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');


//Database
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
    //await client.connect();
    collection = client.db('myDB').collection(collectionName);
    console.log("Switch Collection");
}

async function createCollection(collectionName){
    await client.connect();
    await client.db('myDB').createCollection(collectionName);
    console.log("Create New Collection "+ collectionName);
}


app.use( (req,res,next) => {
    if( collection !== null ) {
        next()
    }else{
        res.status( 503 ).send()
    }
})


//show data db
app.get('/result', async (req, res) => {
    const cursor = collection.find({}, {projection: {_id: 0, model: 1, year: 1, mpg: 1, age: 1}});
    const data = await cursor.toArray();
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(data))
});

//switch page
app.post('/popstate',async (req, res) => {
        await switchToAnotherCollection("myCollection0");
}
)
//________________________________________________________________________________________________
//passport
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));


app.use(passport.initialize());
app.use(passport.session());


passport.use(new GitHubStrategy({
    clientID: `${process.env.CLIENTID}`,
    clientSecret: `${process.env.SECRETS}`,
    callbackURL: 'http://localhost:3000/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
    if (accessToken) {
        return done(null, profile);
    } else {
        return done(new Error('Authentication failed'));
    }

    return done(null, profile);
}));


passport.serializeUser((user, done) => {
    done(null, user);
});


passport.deserializeUser((user, done) => {
    done(null, user);
});


app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),  async (req, res) => {
        if (!req.user) {
            return res.status(401).send('Authentication failed');
        }else {
            const user = await collection.findOne({githubID: req.user.id});
            const db = req.user.id + 'Data'
            if (!user) {
                const newData = {githubID: req.user.id, username: req.user.username, db: db};
                console.log(newData)
                const result = await collection.insertOne(newData);
                console.log(result)
                await createCollection(db);
                console.log("Create New User")
            }
            await switchToAnotherCollection(db)
            res.redirect('/index2.html');
        }
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


//________________________________________________________
const middleware_authenticate = async (req, res, next) => {
    const {username, password} = req.body;
    const user = await collection.findOne({Username: username, Password: password});
    if(user){
        await switchToAnotherCollection(user.db);
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

const middleware_signup = async (req, res, next) => {
    const {username, password} = req.body;
    const user = await collection.findOne({ Username: username});
    if(!user){
        await createCollection(username+'Data');
        const newData = ({ Username: username, Password:password, db: username+'Data' });
        const result = await collection.insertOne(newData);
        next();
    }else{
        res.status(401).send('Unauthorized');
    }
}


//login
app.post('/login', middleware_authenticate, (req, res) =>{
    res.send('Login successful!');
});

//sign up without OAuth
app.post('/signup',middleware_signup, (req, res) => {
        res.send('Sign up successful');
    });

app.use(express.json())
app.use(express.static('public'));

const middleware_add = async (req, res, next) => {
    const newData = req.body;
    const currentYear = new Date().getFullYear();
    newData.age = (currentYear - newData.year);
    const result = await collection.insertOne(newData);
    next();
}
// add data DB
app.post('/add',middleware_add, (req, res) => {
    res.send('Data added successful');
});


app.put('/update/:id', async (req, res) => {
    const indexToUPdate = Number(req.params.id);
    const inputData = req.body;
    const currentYear = new Date().getFullYear();

    const document = await collection.find({}).toArray()
    if (document.length === 0) {
        alert("No documents found in the database.");
    }
            if (indexToUPdate >= 0 && indexToUPdate < document.length) {
                const documentToUpdate = document[indexToUPdate]
                const newDocument = {
                    $set: {
                        model: inputData.model,
                        year: inputData.year,
                        mpg: inputData.mpg,
                        age: currentYear - inputData.year
                    }
                }
                await collection.updateOne({_id: documentToUpdate._id}, newDocument)
                return res.status(200).json({message: "Document Updated successfully"});
            } else {
                return res.status(404).json({error: "Document not found"});
            }
    });


        app.delete('/delete', async (req, res) => {
            const indexToDelete = req.body.index;
            const document = await collection.find({}).toArray();
            if (indexToDelete >= 0 && indexToDelete < document.length) {
                const documentToDelete = document[indexToDelete];
                const result = await collection.deleteOne({_id: documentToDelete._id});
                if (result.deletedCount === 1) {
                    return res.status(200).json({message: "Document deleted successfully"});
                } else {
                    return res.status(404).json({error: "Document not found"});
                }
            } else {
                return res.status(400).json({error: "Index out of bounds"});
            }
        });
app.listen(3000);

