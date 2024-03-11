console.log("cooookies ",document.cookie);
const socket = io("/api/user", {
    
  query: { 
    cookies: document.cookie
  }
});

// Add your listener here
socket.on('friend_request', (msg) => {
  console.log('Received friend request:', msg);
  // Handle the friend request notification here
});
