const parseCookies = require("../config/CookieParser");
const jwt = require("jsonwebtoken");
const Message = require("../models/MessageModel")
const User = require("../models/UserModel")
let NotifIo ;
require("dotenv").config();
const userSockets = {};
function setIo(io){
  NotifIo = io;
  io.of('/api/message').on("connection", (socket) => {
    // Accessing cookies from the handshake query
    const cookies = socket.handshake.query.cookies;
    
    // Parsing cookies to retrieve username
    const cookiesList = parseCookies(cookies);
    const token = cookiesList.jwt;
    const decoded = jwt.verify(token, process.env.jwt_secret);
    
    console.log(`User ${decoded.username} connected on messages ---------`);
    userSockets[decoded.username] = socket.id;

    socket.on('disconnect', () => {
      delete userSockets[decoded.username]; // Remove the user's socket ID when they disconnect
    });
  });
  
}
function emitFriendmessage(senderUsername,recipientUsername) {
  console.log("emiiiiiiting",recipientUsername);
  console.log(userSockets);
  const recipientSocketId = userSockets[recipientUsername];
  if (recipientSocketId) {
    console.log("sending notif to ",recipientSocketId);
    NotifIo.of('/api/message').to(recipientSocketId).emit('new_message', { message: `You have a new message from ${senderUsername}` });
  } else {
    console.log(`User ${recipientUsername} is not currently connected.`);
  }
}

async function messageController(request, response) {
  let filePath = request.url.split("/").filter(function (elem) {
    return elem !== "..";
  }); 
  console.log(filePath);
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.jwt;
  const decoded = jwt.verify(token, process.env.jwt_secret);
  if (request.method === "GET" && filePath[2] === "conversation" && filePath[3] === "messages") {
    // Assuming filePath[4] contains the IDs of the two players involved in the conversation
    console.log("inside the route");

    const player1Id = filePath[4];
    const player2Id = decoded.id;

    // Fetch messages for the conversation between player1Id and player2Id
    Message.find({
        $or: [
            { sender: player1Id, recipient: player2Id },
            { sender: player2Id, recipient: player1Id }
        ]
    })
    .then((messages) => {
        // If messages are found
        if (messages.length > 0) {
            // Send the messages array as JSON in the response
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(messages));
        } else {
            console.log("No messages found for the conversation between players:", player1Id, "and", player2Id);

            // Send an empty array as JSON in the response
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify([]));
        }
    })
    .catch((error) => {
        console.log("Error while finding messages for the conversation:", error);

        // Send an error message in the response
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Internal Server Error" }));
    });
}else if (
  request.method === "GET" &&
  filePath[2] === "user" &&
  filePath[3] === "friendsWithMessages" // Check if the request is for friends with messages
) {
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.jwt_secret);
    
    // Find the user's information
    const user = await User.findOne({ username: decoded.username });
    
    if (!user) {
      // If the user does not exist, handle the error
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "User not found" }));
      return;
    }
    
    // Find all messages where the user is the sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: user._id },
        { recipient: user._id }
      ]
    });

    // Extract unique user IDs from the messages
    const friendIds = messages.reduce((acc, message) => {
      if (message.sender.toString() !== user._id.toString()) {
        acc.add(message.sender.toString());
      }
      if (message.recipient.toString() !== user._id.toString()) {
        acc.add(message.recipient.toString());
      }
      return acc;
    }, new Set());

    // Find the corresponding users (friends)
    const friends = await User.find({ _id: { $in: Array.from(friendIds) } });

    // Extract relevant friend information
    const friendList = friends.map(friend => ({
      id: friend._id,
      username: friend.username
    }));

    // Send the list of friends with messages as a response
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(friendList)); 
  } catch (error) {
    // Handle any errors
    console.log("Error while retrieving friends with messages:", error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Internal Server Error" }));
  }
  }else if (request.method === "POST" && filePath[2] === "conversation" && filePath[3] === "send-message") {
    let requestBody = '';
    console.log("INSIDE SEND MESSAGE");
    // Accumulate request body chunks
    request.on('data', (chunk) => {
        requestBody += chunk.toString();
    });
    console.log("sending a message ");
    // Parse request body when complete
    request.on('end', async () => {
      try {
          console.log("msg ",requestBody);
            // Parse JSON request body
          const jsonData = JSON.parse(requestBody);

          // Initialize variables to store recipientId and content
          let recipientId = jsonData.recipientId;
          let content=jsonData.content;

          // Loop through each key-value pair


            // Create a new message document
            const newMessage = new Message({
                sender: decoded.id,
                recipient: recipientId,
                content: content
            });

            // Save the new message to the database
            await newMessage.save();
            const friend = await User.findOne({ _id: recipientId });
            console.log(friend);
            emitFriendmessage(decoded.username,friend.username);
            // Send success response
            response.writeHead(302, { 'Location': '/html/Profile.html' });
            response.end();
      } catch (error) {
          console.error("Error while creating message:", error);
          // Send an error response
          response.writeHead(500, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Internal Server Error" }));
      }
  });
}


}
exports.setIo = setIo ;       
exports.messageController = messageController ;       
