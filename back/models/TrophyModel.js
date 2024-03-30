const mongoose = require('mongoose');

const trophySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    condition: {
        type: String,
        required: true
    }
});

const TrophyModel = mongoose.model('Trophy', trophySchema);

module.exports = TrophyModel;
