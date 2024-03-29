
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

///submit name
const names = [];
const middleware_post = (req, res, next ) => {
    let dataString = '';

    req.on('data', function(data){
        dataString += data;
    })
    req.on('end', function (){
        const json = JSON.parse(dataString)
        names.push(json)
        req.json = JSON.stringify(names)
        next();
    })
}

app.use(middleware_post);

app.post('/submit', (req, res) => {
    res.writeHead( 200, { 'Content-Type': 'application/json'})
    res.end( req.json )
    console.log(names);
});

app.put('/', (req, res) => {
    res.send('Hello World!');
});
app.delete('/', (req, res) => {
    res.send('Hello World!');
});
app.patch('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000);