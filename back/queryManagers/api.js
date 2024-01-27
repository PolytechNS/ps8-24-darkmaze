const http = require('http');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');

const server = http.createServer(function (request, response) {
    // ... (votre logique actuelle)
});

const io = socketIo(server);


io.on('connection', function (socket) {
    console.log('Client connected:', socket.id);

    socket.on('setup', function (data) {
        handleSetup(socket, data);
    });

    // ... (autres gestionnaires d'événements en temps réel)
});


// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {


     // Ajoutez les en-têtes CORS si nécessaire
     addCors(response);

     // Vérifiez le type de requête (GET, POST, etc.) et appelez la fonction appropriée en fonction de l'URL
     if (request.method === 'POST' && request.url === '/api/signup') {
         handleSignup(request, response);
     } else if (request.method === 'POST' && request.url === '/api/login') {
         handleLogin(request, response);
     } else if (request.method === 'GET' && request.url === '/api/game') {
         handleGame(request, response);
     } else {
         // Gestion des autres cas
         response.statusCode = 404;
         response.end('Not Found');
     }
   
}

// Fonction pour gérer les requêtes d'inscription
function handleSignup(request, response) {
    bodyParser.json()(request, response, () => {
        const { mail, username, password } = request.body;
        const token = jwt.sign({ mail, username }, 'votre-cle-secrete');
        response.json({ token });
    });
}

function handleLogin(request, response) {
    bodyParser.json()(request, response, () => {
        const { mail, username, password } = request.body;
        const token = jwt.sign({ mail, username }, 'votre-cle-secrete');
        response.json({ token });
    });
}

// Fonction pour gérer les requêtes de jeu avec l'IA
function handleGame(request, response) {
    response.end('Game logic goes here');
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

exports.manage = manageRequest;
server.listen(8000, () => {
    console.log('Server is running on port 8000');
});