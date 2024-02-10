const mongoose = require('mongoose');

// Define the schema for the GameState
const gameStateSchema = new mongoose.Schema({
    username: {
        // You may want to specify the schema for the board array elements
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Define methods or statics for the GameState model if needed

// Create the GameState model
const GameStateModel = mongoose.model('user', gameStateSchema);

module.exports = GameStateModel;
