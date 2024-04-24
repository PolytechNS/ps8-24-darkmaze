const parseCookies = require("../config/CookieParser");
const jwt = require("jsonwebtoken");
const authMW = require("../middlewear/authMW");
const GameStateModel = require("../models/GameStateModel");
const user = require("../models/UserModel");
const LeagueModel  = require("../models/LeagueModel");
const querystring = require("querystring");
let NotifIo ;
require("dotenv").config();
const userSockets = {};
function setIo(io){
  NotifIo = io;
  io.of('/api/user').on("connection", (socket) => {
    // Accessing cookies from the handshake query
    const cookies = socket.handshake.query.cookies;
    
    // Parsing cookies to retrieve username
    const cookiesList = parseCookies(cookies);
    const token = cookiesList.jwt;
    console.log(token);
    const decoded = jwt.verify(token, process.env.jwt_secret);
    
    console.log(`User ${decoded.username} connected to - /api/user -`);
    userSockets[decoded.username] = socket.id;


    socket.on('disconnect', () => {
      delete userSockets[decoded.username]; // Remove the user's socket ID when they disconnect
  });
  });
  
}
function emitFriendRequest(recipientUsername) {
  console.log("emiiiiiiting",recipientUsername);
  const recipientSocketId = userSockets[recipientUsername];
  if (recipientSocketId) {
    NotifIo.of('/api/user').to(recipientSocketId).emit('friend_request', { message: "You have a new friend request" });
  } else {
    console.log(`User ${recipientUsername} is not currently connected.`);
  }
}

async function userController(request, response, gamesTable) {
  let filePath = request.url.split("/").filter(function (elem) {
    return elem !== "..";
  }); 
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.jwt;
  const decoded = jwt.verify(token, process.env.jwt_secret);
  




  if (request.method === "GET" && filePath[2] === "user" && filePath[3] === "list") {
    const searchUsername = filePath[4]; // Assuming filePath[3] contains the username to search for

    user.find({ username: searchUsername })
        .then((users) => {
            // If users are found
            if (users.length > 0) {
                // Send the users array as JSON in the response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(users));
            } else {
                console.log("No users found for username:", searchUsername);

                // Send an empty array as JSON in the response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify([]));
            }
        })
        .catch((error) => {
            console.log("Error while finding users:", error);

            // Send an error message in the response
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Internal Server Error" }));
        });
}

else if (
  request.method === "GET" && filePath[2] === "user"&&
  filePath[3] === "AddFriend" 
) {
  const friendToAdd = filePath[4]; // Assuming filePath[3] contains the username to search for
  console.log(friendToAdd);
  try {
      // Find the friend's information
      const friendToAddInfo = await user.findOne({ username: friendToAdd });

      if (!friendToAddInfo) {
          // If the friend to add does not exist, handle the error
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Friend not found" }));
          return;
      }

      // Find the user's information

      // Update the user document to add the friend request
      await user.updateOne(
          { username: friendToAddInfo.username },
          { $addToSet: { friendRequests: decoded.id } }
      );

      
      // Send a success response
      emitFriendRequest(friendToAddInfo.username);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Friend request sent successfully" }));
  } catch (error) {
      // Handle any errors
      console.log("friend not found");
      console.log("Error while adding friend:", error);
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
else if (
  request.method === "GET" &&
  filePath[2] === "user" &&
  filePath[3] === "friendRequests" // Check if the request is for friend requests
) {
  try {
    console.log("Friend Requests ----");
    // Find the user's information from the decoded token
    const decoded = jwt.verify(token, process.env.jwt_secret);
    
    // Find the user's information
    const userInfo = await user.findOne({ username: decoded.username });
    
    if (!userInfo) {
      // If the user does not exist, handle the error
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "User not found" }));
      return;
    }
    
    // Retrieve friend requests for the user
    const friendRequests = await user.find({ _id: { $in: userInfo.friendRequests } });
    console.log(friendRequests);
    // Send the friend requests as a response
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(friendRequests)); 
  } catch (error) {
    // Handle any errors
    console.log("Error while retrieving friend requests:", error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
else if (
  request.method === "GET" &&
  filePath[2] === "user" &&
  filePath[3] === "whoami" // Check if the request is for getting user information
) {
  try {
    // Find the user's information from the decoded token
    const decoded = jwt.verify(token, process.env.jwt_secret);
    // Find the user's information
    console.log("fetching user info");
    var userInfo = await user.findOne({ username: decoded.username });
    const league = await LeagueModel.findById(userInfo.league);
    if (league) {
      console.log(league.name);
      
      userInfo = {"username":userInfo.username,"eloRanking":userInfo.eloRanking,"leagueName":league.name}
    }
    if (!userInfo) {
      // If the user does not exist, handle the error
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "User not found" }));
      return;
    }
    // Send the user's information as a response
    response.writeHead(200, { "Content-Type": "application/json" });;
    response.end(JSON.stringify(userInfo));
  } catch (error) {
    // Handle any errors
    console.error("Error while fetching user information:", error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}

else if (
  request.method === "GET" &&
  filePath[2] === "user" &&
  filePath[3] === "friends" // Check if the request is for getting friends
) {
  try {
    // Find the user's information from the decoded token
    const decoded = jwt.verify(token, process.env.jwt_secret);

    // Find the user's information
    const userInfo = await user.findOne({ username: decoded.username });

    if (!userInfo) {
      // If the user does not exist, handle the error
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    // Retrieve the user's friends
    const friends = await user.find({ _id: { $in: userInfo.friends } });

    // Extract relevant friend information
    const friendList = friends.map(friend => ({
      id: friend._id,
      username: friend.username
    }));

    // Send the list of friends as a response
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(friendList));
  } catch (error) {
    // Handle any errors
    console.error("Error while fetching friends:", error);
    response.writeHead(500, { "Content-Type": "application/json" }); 
    response.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
else if (
  request.method === "GET" &&
  filePath[2] === "user" &&
  filePath[3] === "friend_Requests" && // Check if the request is for friend requests // Check if requestId is provided
  filePath[5] === "accept" // Check if the request is for accepting a friend request
) {
  try {

    const requestId = filePath[4];

    
    // Find the user's information from the decoded token
    const decoded = jwt.verify(token, process.env.jwt_secret);
    
    // Find the user's information
    const userInfo = await user.findOne({ username: decoded.username });
    
    if (!userInfo) {
      // If the user does not exist, handle the error
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "User not found" }));
      return;
    }
 
    
    // Check if the friend request exists and belongs to the user
    const friendRequest = userInfo.friendRequests.find(req => req._id.toString() === requestId);
    
    if (!friendRequest) {

      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Friend request not found" }));
      return;
    }
    
    // Update the user's friend list to add the friend
    await user.updateOne(
      { username: decoded.username },
      { 
        $addToSet: { friends: requestId }, // Assuming senderId is stored in friendRequest object
        $pull: { friendRequests: requestId } // Remove the friend request from the user's friendRequests array
      }
    );
    
    // Update the sender's friend list to add the user
    await user.updateOne(
      { _id: requestId },
      { $addToSet: { friends: userInfo._id } }
    );
    
    // Send a success response
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Friend request accepted successfully" }));
  } catch (error) {
    // Handle any errors
    console.log("Error while accepting friend request:", error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}



}
exports.userController = userController;
exports.setIo = setIo; 