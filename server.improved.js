
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
const dreams = [];
// const middleware_get = (req,res,next)=> {
//     req.on("data", function () {
//
//     });
//     req.on("end", function () {
//         next();
//         });
// }
//
// app.use(middleware_get);
app.get('/result', (req, res) => {
    const currentYear = new Date().getFullYear();
    appdata.forEach(item => {
        item.age = currentYear - item.year;
    });
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(appdata))
});

app.post('/', (req, res) => {
    res.end('Hello World!');
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