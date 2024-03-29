const http = require( "http" ),
    fs   = require( "fs" ),
    mime = require( "mime" ),
    dir  = "public/",
    port = 3000

const appdata = [
    { "model": "toyota", "year": 1999, "mpg": 23 },
    { "model": "honda", "year": 2004, "mpg": 30 },
    { "model": "ford", "year": 1987, "mpg": 14}
]


const server = http.createServer( function( request,response ) {
    if( request.method === "GET" ) {
        handleGet( request, response )
    }else if( request.method === "POST" ){
        handlePost( request, response )
    }else if (request.method === "DELETE"){
        handleDelete( request, response)
    }else if (request.method === "PUT"){
        handlePut (request, response)
    }
})

const handlePut = function(request, response){
    let dataString = "";

    request.on("data", function (data) {
        dataString += data;
    });
    request.on('end', () => {
        const inputData = JSON.parse(dataString);
        const indexToUPdata= inputData.index;

        if (indexToUPdata>= 0 && indexToUPdata < appdata.length) {
            appdata[indexToUPdata] = inputData.data;
            const currentYear = new Date().getFullYear();
            appdata[indexToUPdata].age = currentYear - appdata[indexToUPdata].year;
        }
        })
}
const handleDelete = function( request, response ) {
    let dataString = "";

    request.on("data", function (data) {
        dataString += data;
    });
    request.on('end', () => {
        const deleteData = JSON.parse(dataString);
        const indexToDelete = deleteData.index;

        if (indexToDelete >= 0 && indexToDelete < appdata.length) {
            appdata.splice(indexToDelete, 1);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'Data deleted successfully'}));
        }
    })
}

const handleGet = function( request, response ) {

    const filename = dir + request.url.slice( 1 )

    if(request.url === '/public/index.html'){
        let dataString = "";

        request.on("data", function (data) {
            dataString += data;
        });
        request.on("end", function () {
            const currentYear = new Date().getFullYear();
            appdata.forEach(item => {
                item.age = currentYear - item.year;
            });
            response.writeHead(200, "OK", {"Content-Type": "text/plain"})
            response.end(JSON.stringify(appdata))})}
    else if( request.url === "/" ) {
        sendFile( response, "public/index.html" )
    }else{
        sendFile( response, filename )
    }
}

const handlePost = function( request, response ) {
    if (request.url === '/submit') {
        let dataString = ""

        request.on("data", function (data) {
            dataString += data
        })

        request.on("end", function () {
            console.log(JSON.parse(dataString))
            response.writeHead(200, "OK", {"Content-Type": "text/plain"})
            response.end("Succeed")
        })
    }else if(request.url === '/add'){
        let dataString = "";

        request.on("data", function (data) {
            dataString += data;
        });
        request.on('end', () => {
            const newData = JSON.parse(dataString);
            appdata.push(newData);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Data added successfully', data: newData }));
        });
    }
}
const sendFile = function( response, filename ) {
    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we"ve loaded the file successfully
        if( err === null ) {

            // status code: https://httpstatuses.com
            response.writeHeader( 200, { "Content-Type": type })
            response.end( content )

        }else{

            // file not found, error code 404
            response.writeHeader( 404 )
            response.end( "404 Error: File Not Found" )

        }
    })
}

server.listen( process.env.PORT || port )