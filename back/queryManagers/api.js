

// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const GameStateModel = require("../models/GameStateModel");
const user = require("../models/UserModel");
const GameState = require("../logic/GameState");
const querystring = require("querystring");
const aiPlayer = require("../logic/ai");
const GMController = require("../controller/gameController");
const USController = require("../controller/userController");
const LGController = require("../controller/leagueController");
const authMW = require("../middlewear/authMW");
const darkMazeAi = require('../logic/Darkmaze')
const MSGController = require('../controller/messageController')
 
let io;
let GamesTable = [];

// sets all the socket listeners

function setIo(ioInstance) {
  io = ioInstance;

  io.of("/api/game").on("connection", (socket) => {
    console.log("connected");
    socket.on("loadGame", async (id) => {
      console.log("loading game");
      var game = GamesTable.find((game) => game.id === id);
      if (game) {
        socket.emit(
          "updatedBoard",
          game.id,
          game.board,
          game.playersPosition,
          game.wallsPositions,
          false,
          game.playerNumber
        );
        socket.emit(
          "UpdateWalls",
          id,
          game.board,
          game.playersPosition,
          game.wallsPositions,
          null,
          null,
          null
        );
      } else socket.emit("ErrorPlaying", "Game not found! start a new game");
    });
    socket.on("setup", async (playAgainstAI, aiFirst) => {
      console.log("joined api/game");
      const gameState = new GameState();
      gameState.GameType["playAgainstAI"] = playAgainstAI;
      gameState.GameType["aiPlayer"] = aiFirst;
      GamesTable.push(gameState);

      // Create an instance of GameState 
      // // Save the instance to the database
      socket.emit(
        "updatedBoard",
        gameState.id,
        gameState.board,
        gameState.playersPosition,
        gameState.wallsPositions,
        true
      ); 
      if (playAgainstAI == "true" && gameState.GameType["aiPlayer"] == 0) {
        darkMazeAi.setup(1).then((pos)=>{
          const digits = Array.from(pos, Number);
          console.log('digits : ',digits);
          gameState.play(0,(digits[1]-1)*2,(digits[0]-1)*2);
          gameState.convertGameState();
          
          socket.emit(
            "updatedBoard",
            gameState.id,
            gameState.board,
            gameState.playersPosition,
            gameState.wallsPositions,
            false
          );
          
        }).catch((error)=>{
          socket.emit("ErrorPlaying", "cannot play move "+error);
        })

      }
    });

    socket.on("newMove", async (id, playerNumber, row, col) => {
      var gameStateToBeModified = GamesTable.find((game) => game.id === id);
      if (gameStateToBeModified) {
        if (gameStateToBeModified.play(playerNumber, row, col) == true) {
          socket.emit(
            "updatedBoard",
            id,
            gameStateToBeModified.board,
            gameStateToBeModified.playersPosition,
            gameStateToBeModified.wallsPosition,
            false
          );
          if (gameStateToBeModified.is_Win(playerNumber)) {
            socket.emit(
              "GameOver",
              "GameOver Player " + playerNumber + " wins !!!"
            );
            GamesTable = GamesTable.filter((game) => game.id !== id);
          }
          if (gameStateToBeModified.GameType["playAgainstAI"] == "true") 
            aiPlayer(gameStateToBeModified,socket,id);
 
          
        } else socket.emit("ErrorPlaying", "Move cannot be played");
      } else socket.emit("ErrorPlaying", "Game not found! start a new game");
    });
    socket.on("newWall", (id, direction, row, col, playerNumber) => {
      var gameStateToBeModified = GamesTable.find((game) => game.id === id);
      if (gameStateToBeModified) {
        if (
          gameStateToBeModified.placeWalls(direction, row, col, playerNumber) ==
          true
        ){
          socket.emit(
            "UpdateWalls",
            id,
            gameStateToBeModified.board,
            gameStateToBeModified.playersPosition,
            gameStateToBeModified.wallsPositions,
            direction,
            row,
            col
          );
          if (gameStateToBeModified.GameType["playAgainstAI"] == "true") 
            aiPlayer(gameStateToBeModified,socket,id);
            
        }
        else socket.emit("ErrorPlaying", "Wall cannot be placed");
      } else socket.emit("ErrorPlaying", "Game not found! start a new game");
    });
  });
}
 
async function manageRequest(request, response) {
  let filePath = request.url.split("/").filter(function (elem) {
    return elem !== "..";
  });
  if (request.method === "POST" && filePath[2] === "signup") {
    // Handle the specific route for POST request to /api/login
    console.log("Signing UP");
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    await request.on("end", async () => {
      // Parse the JSON data (assuming it's JSON)
      const postData = querystring.parse(body);
      const data = {
        username: postData.username,
        password: postData.password,
        email: postData.email,
      };
      if (data["password"].length < 6) {
        response.statusCode = 400;
        return response.end(
          JSON.stringify({
            status: "error",
            error: "Password must be more than 6",
          })
        );
      }
      const existingUser = await user.findOne({ username: data.username });

      if (existingUser) {
        response.statusCode = 400;
        return response.end(
          JSON.stringify({
            status: "error",
            error: "Username is already taken.",
          })
        );
      }

      const hashed_pwd = await bcrypt.hash(data["password"], 10);
      data["password"] = hashed_pwd;

      try {
        console.log(await user.create(data));
        response.statusCode = 200;
        response.writeHead(302, {
          Location: "/api/game",
        });

        return response.end();
      } catch (error) {
        console.log(error);
        response.statusCode = 400;
        return response.end("Bad Request...");
      }
    });
  } else if (request.method === "POST" && filePath[2] === "login") {
    // Handle the specific route for POST request to /api/login
    console.log("Login");
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    await request.on("end", async () => {
      const postData = querystring.parse(body);
      const data = {
        username: postData.username,
        password: postData.password,
      };

      console.log("Data from /api/login POST request:", data);
      const us = await user.findOne({ username: data.username }).lean();
      if (!us) {
        response.statusCode = 400;
        return response.end(
          JSON.stringify({
            status: "error",
            error: "Username or passwod incorrect ...",
          })
        );
      } else {
        if (await bcrypt.compare(data.password, us.password)) {
          const max_age = 3 * 24 * 60 * 60;
          const token = jwt.sign(
            {
              id: us._id,
              username: us.username,
            },
            process.env.jwt_secret,
            { expiresIn: max_age }
          );
          //,maxAge:max_age*1000
          response.setHeader("Set-Cookie", [
            `jwt=${token}; Secure; Path=/; Max-Age=${max_age}`,
          ]);

          response.statusCode = 200;
          response.writeHead(302, {
            Location: "/api/game",
          });

          return response.end();
        } else {
          response.statusCode = 400;
          return response.end(
            JSON.stringify({
              status: "error",
              error: "Username or passwod incorrect ...",
            })
          );
        }
      }
    });
  } else {
    authMW(request, response, (request, response) => {
      GMController.gameController(request, response, GamesTable);
      USController.userController(request, response, GamesTable);
      MSGController.messageController(request, response);
      LGController.leagueController(request,response);

    });
    
  }
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
 ** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
 ** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
 ** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
 ** are probably not the ones you will need. */
function addCors(response) {
  // Website you wish to allow to connect to your server.
  response.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent to the API.
  response.setHeader("Access-Control-Allow-Credentials", true);
}

exports.manage = manageRequest;
exports.setIo = setIo;
