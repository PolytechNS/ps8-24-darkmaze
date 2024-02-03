// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const GameStateModel = require("../models/GameStateModel");
const user = require("../models/UserModel");
const GameState = require("../logic/GameState");
const querystring = require("querystring");
const socket = require("../config/socket.io");
const { devNull } = require("os");
let io;

function setIo(ioInstance) {
  io = ioInstance;
    
    //io.emit('updatedBoard',1);
    io.of("/api/game").on("connection", (socket) => {
      console.log("connected");
      socket.on("setup", async () => {
        console.log("joined api/game");
        const gameState = new GameState();
        // Create an instance of GameState
        const gameStateInstance = new GameStateModel(gameState);
   
       // // Save the instance to the database 
        await gameStateInstance
          .save() 
          .then((savedGame) => {
            console.log("GameState saved to the database _id",savedGame._id);
            socket.emit('updatedBoard',savedGame._id,savedGame.board,savedGame.playersPosition,savedGame.wallsPositions,true);
          })
         .catch((error) => {
          console.log("GameState saved to the database");
  
         });

      });
      socket.on("newMove",async(id,playerNumber,row,col)=>{
        var gameStateToBeModified = null ;
        await GameStateModel.findOne({ _id: id }).then( (gameState) => {
          if (gameState) {
            // The game state was found
            // Create a copy of the game state
            gameStateToBeModified = new GameState();
            gameStateToBeModified.board = gameState.board;
            gameStateToBeModified.playersPosition = gameState.playersPosition;
            gameStateToBeModified.wallsPositions =  gameState.wallsPositions ;
            gameStateToBeModified.play(playerNumber, row, col);
            //should return in case of error or not authorized movement
            // Update the game state in the database
          } else {
            // No game state found with the specified ID
            console.log('Game state not found');
          }
        }).catch((error) => {
          console.log("Error while finding game state:", error);
        });
        if(gameStateToBeModified ){    
            let updatedFields = {  
              board: gameStateToBeModified.board,
              playersPosition: gameStateToBeModified.playersPosition, // Fix the typo here (changed playersPostion to playersPosition)
              wallsPositions: gameStateToBeModified.wallsPosition
            }
          // Find the GameState instance by its id and update the specified fields
          await GameStateModel.updateOne({ _id: id }, { $set: updatedFields })          
          .then(() => {
            socket.emit('updatedBoard',id,gameStateToBeModified.board,gameStateToBeModified.playersPosition,gameStateToBeModified.wallsPosition,false);
          })
         .catch((error) => {
          console.log("GameState saved to the database");
  
         });;

      } 
   
    });
  })

  
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
        email:postData.email,
      };
      console.log("Data from /api/login POST request:", data);
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
        response.statusCode = 201;
        return response.end("saved successfully ...");
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
            `jwt=${token}; HttpOnly`,
            "connected=true",
          ]);

          response.statusCode = 200;
          return response.end(
            JSON.stringify({
              status: "OK",
              message: "Loged in successfully ..",
            })
          );
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
