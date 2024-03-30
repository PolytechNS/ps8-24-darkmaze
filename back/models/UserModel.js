const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
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
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    eloRanking: {
        type: Number,
        default: 1000
    },
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        default: '66018bb709cc418bf1db83b0' 
    },
    trophies: [{
        trophy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trophy' },
        achievedAt: { type: Date, default: Date.now }
    }]
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
