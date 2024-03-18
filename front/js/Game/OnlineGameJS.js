const invisibleOverlay = document.getElementById('invisible-overlay');
const gameNamespace = io("/api/OnlineGame", {
    query: { 
      cookies: document.cookie
    }
  });
  
  gameNamespace.on("connect", () => {
    invisibleOverlay.style.display = 'none';
    console.log("turn off wiating .. Connected to the server");
  });
  
  gameNamespace.on("playerFound", () => {
    console.log("Player found!");
    document.getElementById('loading-overlay').style.display = 'none';
    //switchOverlay();
    // Show main content
  });
  
  gameNamespace.on("disconnect", () => {
    console.log("Disconnected from the server");
  }); 
  
  gameNamespace.on("error", (error) => {
    console.error("Socket error:", error);
  });
  
  // JavaScript to control the visibility of the overlay and manage the timer



// Function to show the overlay
function switchOverlay() {
    console.log("-------> switching");
    if(invisibleOverlay.style.display == 'block')
        invisibleOverlay.style.display = 'none';
    else
    invisibleOverlay.style.display = 'block'
}

