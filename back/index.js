const http = require('http');
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');
const mongoose = require('./config/DbConnection.js');
const { Server } = require("socket.io");

// Importez la fonction de validation
//const { validateMove } = require('./gamestate.js');

const server = http.createServer(function (request, response) {
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        if (filePath[1] === "api") {
            console.log("API is called ...");
            apiQuery.manage(request, response);
        } else {
            fileQuery.manage(request, response);
        }
    } catch(error) {
        console.log(`Error while processing ${request.url}: ${error}`);
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
});

const io = new Server(server);
apiQuery.setIo(io);

let waitingPlayers = []; // Utilisez une liste pour gérer plusieurs joueurs en attente

io.on('connection', (socket) => {
    console.log(`New player connected: ${socket.id}`);

    socket.on('wantToPlay', () => {
        waitingPlayers.push(socket); // Ajoutez le joueur actuel à la liste des joueurs en attente
        console.log(`Player ${socket.id} added to waiting list. Total waiting: ${waitingPlayers.length}`);

        // Vérifiez s'il y a suffisamment de joueurs pour un match
        if (waitingPlayers.length >= 2) {
            const player1 = waitingPlayers.shift(); // Retirez le premier joueur de la liste
            const player2 = waitingPlayers.shift(); // Retirez le suivant

            const room = `game_${player1.id}_${player2.id}`;
            player1.join(room);
            player2.join(room);

            console.log(`Match found, creating room: ${room}`);
            io.to(room).emit('matchFound', { roomId: room });
        }
    });

    socket.on('playerMove', (data) => {
        console.log(`Movement received in room ${data.roomId}:`, data);
        // Vérifiez d'abord si le mouvement est valide en utilisant la fonction de validation
        const isMoveValid = validateMove(data);

        if (isMoveValid) {
            // Le mouvement est valide, continuez avec la logique du jeu
            io.to(data.roomId).emit('moveValidated', data);
        } else {
            // Le mouvement est invalide, envoyez un message d'erreur au client
            socket.emit('moveInvalid', { message: 'Invalid move' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        // Retirez le joueur déconnecté de la liste d'attente, s'il y est
        waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
        console.log(`Player ${socket.id} removed from waiting list. Total waiting: ${waitingPlayers.length}`);
    });
});

server.listen(8000, () => {
    console.log('Server listening on port 8000');
});
// Importez les modules nécessaires pour la gestion de la base de données
const fs = require('fs');
const path = require('path');

// Importez le modèle de données de la partie si nécessaire
//const Game = require('./models/Game');

// Déclarez un gestionnaire d'événements pour la fin de la partie
function handleGameEnd(data) {
    // Informez les utilisateurs des résultats
    io.to(data.roomId).emit('gameEnd', { message: 'The game has ended' });

    // Calculez les statistiques nécessaires (score, ELO, etc.)
    // Vous devrez probablement accéder aux données de la partie via `data` pour effectuer ces calculs

    // Stockez les informations dans la base de données
    const gameData = {
        // Insérez les données de la partie ici
    };

    // Exemple d'enregistrement des données dans la base de données MongoDB
    const game = new Game(gameData);
    game.save()
        .then(() => console.log('Game data saved to database'))
        .catch(err => console.error('Error saving game data:', err));

    // Libérez la salle de jeu en supprimant la référence à la salle
    // Cela peut également inclure la réinitialisation des données de la salle, selon vos besoins

    // Déconnectez les sockets si nécessaire
    // Cela dépendra de votre logique d'application et de savoir si vous avez besoin de garder les sockets connectés ou non
}

// Ajoutez un écouteur d'événements pour la fin de la partie
io.on('gameEnd', handleGameEnd);

