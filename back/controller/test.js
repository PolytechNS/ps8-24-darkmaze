const user = require("../models/UserModel");
const trophy = require("../models/TrophyModel");
const league = require("../models/LeagueModel");

async function updateUsersState(winnerUsername, loserUsername) {
    try {
        // Fetch data of the winner and loser by their usernames
        let winner = await user.findOne({ username: winnerUsername });
        let loser = await user.findOne({ username: loserUsername });
        const winnerLeague = await league.findOne({ _id: winner.league });
        const loserLeague = await league.findOne({ _id: loser.league });
        console.log("leagues ", winnerLeague, loserLeague);

        if (!winner || !loser) {
            throw new Error("Player not found");
        }


        // Return updated player data
        return true;
    } catch (error) {
        console.error("Error updating users state:", error);
        throw error;
    }
}


updateUsersState('bilal','karim').then((data)=>{
    console.log(data)
});
