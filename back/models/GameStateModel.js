const mongoose = require('mongoose');

// Define the schema for the GameState
const gameStateSchema = new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    board: {
        // You may want to specify the schema for the board array elements
        type: Array,
        required: true, 
    },
    playersPosition: {
        type: Array,
        required: true,
    },
    wallsPositions: {
        type: Array,
        required: true,
    },
    playerNumber:{
        type:Number,
        required:true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to the User model
    createdAt: {
        type: Date,
        default: Date.now // Set the default value to the current date and time
    }

});

// Define methods or statics for the GameState model if needed

// Create the GameState model
const GameStateModel = mongoose.model('GameState', gameStateSchema);

module.exports = GameStateModel;
