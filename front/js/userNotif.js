console.log("cooookies ",document.cookie);  
const socket = io("/api/user", {
    
  query: { 
    cookies: document.cookie
  }
}); 
const socket2 = io("/api/message", {
    
  query: { 
    cookies: document.cookie
  }
}); 

socket2.on('new_message', (msg) => {
  console.log('Recieved a message : ', msg);
  // Handle the friend request notification here
});
console.log("userNotif.js");

// Add your listener here
socket.on('friend_request', (msg) => {
  console.log('Received friend request:', msg);
  // Handle the friend request notification here
});
