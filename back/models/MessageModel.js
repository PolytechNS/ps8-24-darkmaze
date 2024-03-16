const { ObjectId } = require('mongodb'); // Import MongoDB ObjectId


const mongoose = require('mongoose');

// Define the schema for the User
const messageSchema = new mongoose.Schema({
  sender: { type: ObjectId, required: true },
  recipient: { type: ObjectId, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create the User model
const messageModel = mongoose.model('Message', messageSchema);

module.exports = messageModel;

