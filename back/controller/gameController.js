const parseCookies = require("../config/CookieParser");
const jwt = require("jsonwebtoken");
const authMW = require("../middlewear/authMW");
const GameStateModel = require("../models/GameStateModel");
const user = require("../models/UserModel");
const querystring = require("querystring");
const GameState = require("../logic/GameState");

require("dotenv").config();
async function gameController(request, response, gamesTable) {
  let filePath = request.url.split("/").filter(function (elem) {
    return elem !== "..";
  });
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.jwt;
  const decoded = jwt.verify(token, process.env.jwt_secret);
  
  console.log("gameController");
  console.log("decoded ", decoded);
  console.log("filePath ", filePath);

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
      console.log(body);

      let gameToSave = gamesTable.find((game) => game.id == body.gameId);
      gameToSave && (gameToSave.playerNumber = body.playerNumber);
      const existingGameState = await GameStateModel.findOne({
        id: gameToSave.id,
      });
      console.log("existingGameState ", existingGameState);

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
module.exports = gameController;
