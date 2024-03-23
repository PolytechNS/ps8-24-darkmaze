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
  gameNamespace.on("challengeNotAccepted",()=>{
    console.log("your challenge is rejected");
    window.alert("challenge rejected");
    var url = 'http://localhost:8000/html/ChallengeAFriend.html';
    window.location.href = url;

})
  gameNamespace.on("recieveMessage",(username,message)=>{console.log(username+" : "+message)});
  function sendMessage() {
    var message = document.getElementById("messageInput").value;
    gameNamespace.emit("sendMessage",message);
    document.getElementById("messageInput").value="";
}
  // JavaScript to control the visibility of the overlay and manage the timer



// Function to show the overlay
var interval
function switchOverlay() { 
    console.log("-------> switching");
    if(invisibleOverlay.style.display == 'block'){
      invisibleOverlay.style.display = 'none';
      document.getElementById('timer').textContent="1:30"
      clearInterval(interval);

    }
    else{
      invisibleOverlay.style.display = 'block'
      var timerElement = document.getElementById('timer');
        var totalTime = 90; // 1 minute 30 seconds in seconds
        interval = setInterval(function() {
          console.log("total timer",totalTime);        
            var minutes = Math.floor(totalTime / 60);
            var seconds = totalTime % 60;
            timerElement.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            if (totalTime <= 0) {
                clearInterval(interval);
                // Timer reaches zero, do something here if needed
            } else {
                totalTime--;
            }
        }, 1000); // Update every second
    }
}

