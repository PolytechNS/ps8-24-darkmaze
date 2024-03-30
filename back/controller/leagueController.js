
    const user = require("../models/UserModel");
    const trophy = require("../models/TrophyModel");
    const league = require("../models/LeagueModel");
async function leagueController(request, response, gamesTable, UserModel) {
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });
    if (request.method === "GET" && filePath[2] === "league" && filePath[3] === "list") {
        // Retrieve all leagues
        league.find()
            .then((leagues) => {
                // Send the leagues array as JSON in the response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(leagues));
            })
            .catch((error) => {
                console.log("Error while retrieving leagues:", error);
    
                // Send an error message in the response
                response.writeHead(500, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Internal Server Error" }));
            });
    }
    
    else if (request.method === "GET" && filePath[2] === "league" && filePath[3] === "users") {
        // Assuming filePath[4] contains the league ID
        const leagueId = filePath[4];
        console.log("league ",leagueId);
    
        // Retrieve users for the specified league
        user.find({ league: leagueId })
            .then((users) => {
                // Extract usernames and elo values from the users array
                const simplifiedUsers = users.map(user => ({
                    username: user.username,
                    elo: user.eloRanking
                }));
            
                console.log("leagues and users:", leagueId, simplifiedUsers);
                // Send the simplified users array as JSON in the response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(simplifiedUsers));
            })
            .catch((error) => {
                console.log("Error while retrieving users for league:", error);
    
                // Send an error message in the response
                response.writeHead(500, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Internal Server Error" }));
            });
    }
    else if (request.method === "GET" && filePath[2] === "league" && filePath[3] === "trophies") {
        // Retrieve all trophies
        trophy.find()
            .then((trophies) => {
                // Send the trophies array as JSON in the response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(trophies));
            })
            .catch((error) => {
                console.log("Error while retrieving trophies:", error);

                // Send an error message in the response
                response.writeHead(500, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Internal Server Error" }));
            });
    }

    else if (request.method === "GET" && filePath[2] === "league" && filePath[3] === "players") {
        // Retrieve all players ordered by Elo rating
        user.find().sort({ eloRanking: -1 })
            .then((players) => {
                // Send the players array as JSON in the response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(players));
            })
            .catch((error) => {
                console.log("Error while retrieving players:", error);

                // Send an error message in the response
                response.writeHead(500, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Internal Server Error" }));
            });
    }
}

exports.leagueController = leagueController;
