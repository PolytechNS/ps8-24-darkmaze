const invisibleOverlay = document.getElementById('invisible-overlay');
var Mute = false ;
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
    var url = 'http://15.188.201.4:8000/html/ChallengeAFriend.html';
    window.location.href = url;

})
  gameNamespace.on("recieveMessage",(username,message)=>{
    if(Mute==false){
      console.log("hhhhh0",Mute);
      window.alert(username+" : "+message)
  var audio = document.getElementById("audio");
        audio.play();

    }
    });
  function sendMessage() {
    var message = document.getElementById("messageInput").value;
    gameNamespace.emit("sendMessage",message);
    document.getElementById("messageInput").value="";
}
var muteButton = document.querySelector('.send-button');
muteButton.addEventListener('click', function() {
  if (!Mute) {
    muteButton.style.backgroundColor = '#2bff00';//green
  } else {
    muteButton.style.backgroundColor = '#d400ff';
  }})
function MuteMessages(){
    Mute=Mute==true?false:true;
    console.log("Mute",Mute);
  };

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

