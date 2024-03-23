const parseCookies = require("../config/CookieParser");
const jwt = require("jsonwebtoken");
const authMW = require("../middlewear/authMW");
const GameStateModel = require("../models/GameStateModel");
const user = require("../models/UserModel");
const querystring = require("querystring");
const GameState = require("../logic/GameState");
const { set } = require("mongoose");
const { stripVTControlCharacters } = require("util");

require("dotenv").config(); 
var GamesTable = [];
var RoomsQueue = [];
var onlineGames = {};
var onlineGamesTimers = {}
var userSockets = {};
function setIo(io){
  NotifIo = io;
  io.of('/api/OnlineGame').on("connection", (socket) => {
    // Accessing cookies from the handshake query 
    const cookies = socket.handshake.query.cookies;
    
    // Parsing cookies to retrieve username
    const cookiesList = parseCookies(cookies);
    const token = cookiesList.jwt;
    
    const decoded = jwt.verify(token, process.env.jwt_secret);
    userSockets[decoded.username] = socket.id;

    
    socket.on('joinGame',(is_friendGame,friendGame)=>{
      console.log("joining the game",friendGame,is_friendGame);
      if(!is_friendGame){
        if(RoomsQueue.length == 0){
          RoomsQueue.push(decoded.username);
          socket.join((decoded.username).toString());
          onlineGames[decoded.username]=decoded.username;
    
        }
        else{
          const roomToJoin = RoomsQueue.pop(); 
          socket.join(roomToJoin.toString());
          onlineGames[decoded.username]=roomToJoin;
          io.of('/api/OnlineGame').to(roomToJoin.toString()).emit("playerFound");
        }
      }
      else if(is_friendGame && friendGame == null){
        socket.join(decoded.username);
        onlineGames[decoded.username]=decoded.username;  

      }
      else if (is_friendGame && friendGame != null){
        socket.join(friendGame);
        onlineGames[decoded.username]=friendGame;        
        console.log("join game friend name + online games : ",friendGame,decoded.username,onlineGames[decoded.username]);    

      }
    })
 
    socket.on("ChallengeGame",(opponentUsername,callback)=>{

      socket.join((decoded.username).toString());
      onlineGames[decoded.username]=(decoded.username).toString();
    
      if (!(opponentUsername in userSockets)) {
          socket.emit("userNotConnected");
          
          callback("failure");
      }  
      else{
        io.of('/api/OnlineGame').to(userSockets[opponentUsername]).emit("challengeRecieved",(decoded.username).toString());
        console.log("userSockets[opponentUsername]",userSockets[opponentUsername]);
        callback("success") 
      }
    })
    socket.on("challengeRejected",(challengerUsername)=>{
      io.of('/api/OnlineGame').to(userSockets[challengerUsername]).emit("challengeNotAccepted");
      console.log("ONLINE GAMES inside CHALLENGE REJECTED  event ",onlineGames);
      delete onlineGamesTimers[onlineGames[challengerUsername]]
      delete onlineGames[challengerUsername]
      delete userSockets[challengerUsername]
      console.log("ONLINE GAMES inside CHALLENGE REJECTED  event ",onlineGames);

    })




    socket.on("setup", async () => {
      console.log("joined api/OnlineGame");
      const gameState = new GameState();
      GamesTable.push(gameState);

      // Create an instance of GameState 
      // // Save the instance to the database
      console.log(decoded.username,"ONLINE GAMES inside SETUP event ",onlineGames); 
      if(decoded.username==onlineGames[decoded.username])
        console.log("first player");
      socket.emit(
        "updatedBoard",
        gameState.id,
        gameState.board,
        gameState.playersPosition,
        gameState.wallsPositions,
        true,
        true
      );
      if(onlineGames[decoded.username]!=decoded.username){
        console.log("second player");
        startCountDown(io,decoded,gameState.id);
        socket.emit(
          "player2Setup",
          gameState.id,
          gameState.board,
          gameState.playersPosition,
          gameState.wallsPositions
        );
        socket.emit("playerFound");
        io.of('/api/OnlineGame')
              .to(userSockets[getOpponentUserName(decoded.username)])
                .emit("playerFound");  
        
      }

      });
          

    socket.on("newMove", async (id, playerNumber, row, col) => {
      console.log("newMove --- ",playerNumber,row,col);
      var gameStateToBeModified = GamesTable.find((game) => game.id === id);
      if (gameStateToBeModified) {
      if((gameStateToBeModified.playTurn==1 && decoded.username == onlineGames[decoded.username]) ||
      (gameStateToBeModified.playTurn==2 && decoded.username != onlineGames[decoded.username])){

        const oldpostions = gameStateToBeModified.playersPosition[playerNumber];
          if (gameStateToBeModified.play(playerNumber, row, col) == true) {
            gameStateToBeModified.playTurn = gameStateToBeModified.playTurn==1?2:1;
            clearInterval(onlineGamesTimers[onlineGames[decoded.username]])
            socket.emit(
              "updatedBoard",
              id,
              gameStateToBeModified.board,
              gameStateToBeModified.playersPosition,
              gameStateToBeModified.wallsPosition,
              false,
              true
  
            );
            socket.emit(
              "updatedBoard",
              id,
              gameStateToBeModified.board,
              gameStateToBeModified.playersPosition,
              gameStateToBeModified.wallsPosition,
              false,
              false
  
            );
            console.log("##### Opponent Uername : ",getOpponentUserName(decoded.username));
            io.of('/api/OnlineGame')
              .to(userSockets[getOpponentUserName(decoded.username)])
                .emit(
                  "updatedBoard",
                  id,
                  gameStateToBeModified.board,
                  gameStateToBeModified.playersPosition,
                  gameStateToBeModified.wallsPosition,
                  false,
                  true
  
                );  
            io.of('/api/OnlineGame')
              .to(userSockets[getOpponentUserName(decoded.username)])
                .emit(
                  "specialUpdatedBoard",
                  id,
                  gameStateToBeModified.board,
                  gameStateToBeModified.playersPosition,
                  gameStateToBeModified.wallsPosition,
                  oldpostions[0],
                  oldpostions[1],
                  false,
  
                );
  
            if (gameStateToBeModified.is_Win(playerNumber)) {
              socket.emit(
                "GameOver",
                "YOU WIN !!!"
              );
              io.of('/api/OnlineGame')
              .to(userSockets[getOpponentUserName(decoded.username)])
              .emit(
                "GameOver",
                "YOU LOST !!!"
              );
              GamesTable = GamesTable.filter((game) => game.id !== id);
            }
            startCountDown(io,decoded,id);
            
          } else {
            socket.emit("ErrorPlaying", "Move cannot be played");
            }
          }else
            socket.emit("ErrorPlaying", "Not your turn !!!")
        } else {
          socket.emit("ErrorPlaying", "Game not found! start a new game")
          io.of('/api/OnlineGame')
          .to(userSockets[getOpponentUserName(decoded.username)])
          .emit("ErrorPlaying", "Game not found! start a new game");
        };
    });



    socket.on("newWall", (id, direction, row, col, playerNumber) => {
      var gameStateToBeModified = GamesTable.find((game) => game.id === id);
      if (gameStateToBeModified) {
        if((gameStateToBeModified.playTurn==1 && decoded.username == onlineGames[decoded.username]) ||
        (gameStateToBeModified.playTurn==2 && decoded.username != onlineGames[decoded.username])){
           
          if (
            gameStateToBeModified.placeWalls(direction, row, col, playerNumber) ==
            true
          ){
            gameStateToBeModified.playTurn = gameStateToBeModified.playTurn==1?2:1;
            clearInterval(onlineGamesTimers[onlineGames[decoded.username]])
            io.of('/api/OnlineGame').to(onlineGames[decoded.username].toString()).emit(
              "UpdateWalls",
              id,
              gameStateToBeModified.board,
              gameStateToBeModified.playersPosition,
              gameStateToBeModified.wallsPositions,
              direction,
              row,
              col,
              true
              );
              io.of('/api/OnlineGame').to(onlineGames[decoded.username].toString()).emit(
                "UpdateWalls",
              id,
              gameStateToBeModified.board,
              gameStateToBeModified.playersPosition,
              gameStateToBeModified.wallsPositions,
              direction,
              row,
              col,
              false
              );
            startCountDown(io,decoded,id);
              
          }
          else socket.emit("ErrorPlaying", "Wall cannot be placed");
        }
        else
          socket.emit("ErrorPlaying", "Not your turn !!!")

      } else io.of('/api/OnlineGame').to(onlineGames[decoded.username].toString()).emit("ErrorPlaying", "Game not found! start a new game");
    });

    socket.on("sendMessage",(message)=>{
      io.of('/api/OnlineGame').to(onlineGames[decoded.username].toString()).emit("recieveMessage", decoded.username,message);
    })
    
    


    socket.on('disconnect', () => {
      //delete userSockets[decoded.username]; // Remove the user's socket ID when they disconnect
      console.log("disconnected");
      delete onlineGamesTimers[onlineGames[decoded.username]]
      delete onlineGames[decoded.username]
      delete userSockets[decoded.username]
  });
  });
  
}  
function getOpponentUserName(playerUserName){
  const room = onlineGames[playerUserName];

  for(let username in onlineGames ){
    if(onlineGames[username]==room && room==playerUserName && username != room)
      return username;
    if(onlineGames[username]==room && room!=playerUserName && username == room)
      return username;
  }
}
function startCountDown(io,decoded,id){


  onlineGamesTimers[onlineGames[decoded.username]]=setTimeout(()=>{
    console.log("executed ",decoded.username);
    io.of('/api/OnlineGame')
    .to(userSockets[decoded.username])
    .emit(
        "GameOver",
        winninnMsg
        
      );
      io.of('/api/OnlineGame')
      .to(userSockets[getOpponentUserName(decoded.username)])
      .emit(
        "GameOver",
        losingMsg
       
      );
      GamesTable = GamesTable.filter((game) => game.id !== id);
  },3000)
}
async function gameController(request, response, gamesTable) {
  let filePath = request.url.split("/").filter(function (elem) {
    return elem !== "..";
  });
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.jwt;
  const decoded = jwt.verify(token, process.env.jwt_secret);
  


  if (
    request.method === "POST" &&
    filePath[2] === "game" &&
    filePath[3] === "save"
  ) {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    await request.on("end", async () => {
      body = JSON.parse(body);

      let gameToSave = gamesTable.find((game) => game.id == body.gameId);

      gameToSave && (gameToSave.playerNumber = body.playerNumber);
      const existingGameState = await GameStateModel.findOne({
        id: gameToSave.id,
      });

      if (existingGameState) {
        // If a game state with the same ID exists, update it
        existingGameState.board = gameToSave.board;
        existingGameState.playersPosition = gameToSave.playersPosition;
        existingGameState.wallsPositions = gameToSave.wallsPositions;
        existingGameState.playerNumber = gameToSave.playerNumber;

        await existingGameState.save();
        console.log(
          "GameState updated in the database _id",
          existingGameState._id
        );
      } else {
        const userInstance = await user.findById(decoded.id);
        if (!userInstance) {
          throw new Error("User not found");
        }
        gameToSave.user = userInstance._id;
        console.log("userInstance ", userInstance._id);
        const gameStateInstance = new GameStateModel(gameToSave);
        // // Save the instance to the database
        await gameStateInstance
          .save()
          .then((savedGame) => {
            console.log("GameState saved to the database _id", savedGame._id);
          })
          .catch((error) => {
            console.log("GameState saved to the database");
          });
      }
    });
  } else if (
    request.method === "GET" &&
    filePath[2] === "game" &&
    filePath[3] === "all"
  ) {
    var UserGames = [];
    await GameStateModel.find({ user: decoded.id })
      .then((gameStates) => {
        // If game states are found
        if (gameStates.length > 0) {
          // Process each game state
          gameStates.forEach((gameState) => {
            // Create a new game state instance and populate it

            // Push the game state instance to the array
            UserGames.push(gameState);
          });

          // Send the UserGames array as JSON in the response
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(UserGames));
        } else {
          console.log("No game states found for the user");

          // Send an empty array as JSON in the response
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify([]));
        }
      })
      .catch((error) => {
        console.log("Error while finding game states:", error);

        // Send an error message in the response
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Internal Server Error" }));
      });
  } else if (
    request.method === "POST" &&
    filePath[2] === "game" &&
    filePath[3] === "load"
  ) {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    await request.on("end", async () => {
      body = JSON.parse(body);
      console.log("body ", body);

      const existingGameState = await GameStateModel.findOne({
        id: body.gameId,
      });

      if (existingGameState) {
        var loadedGame = new GameState();
        loadedGame.id = existingGameState.id;
        loadedGame.board = existingGameState.board;
        loadedGame.playersPosition = existingGameState.playersPosition;
        loadedGame.wallsPositions = existingGameState.wallsPositions;
        loadedGame.playerNumber = existingGameState.playerNumber;
        gamesTable.push(loadedGame);
        response.writeHead(302, {
          Location: `http://localhost:8000/html/index.html?gameId=${existingGameState.id}`,
        });
        return response.end();
      }
    });
  } else if (request.method === "GET" && filePath[2] === "game") {
    response.writeHead(302, {
      Location: "http://localhost:8000/html/GameSetup.html",
    });
    return response.end();
  }
}
exports.setIo = setIo;
exports.gameController = gameController;
