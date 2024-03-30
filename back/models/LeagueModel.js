const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    eloRange: {
        type: [Number], // Change type to an array of numbers
        required: true
    }
});

const LeagueModel = mongoose.model('League', leagueSchema);

module.exports = LeagueModel;
