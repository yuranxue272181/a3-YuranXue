
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