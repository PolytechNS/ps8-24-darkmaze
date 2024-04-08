
function launchGame() {
    var playAgainstAI = document.getElementById('playAgainstAI').value === 'true';
    if(playAgainstAI) 
      var aiFirst =  document.getElementById('aiFirst').value === 'true'?0 :1 ;
    else 
      var aiFirst = false;
    // Redirect to localhost:8000/html/index.html with query parameters
    var url = `http://localhost:8000/html/index.html?playAgainstAI=${playAgainstAI}&aiFirst=${aiFirst}`;
    window.location.href = url;
  }
  
function startOnlineGame(){
  var url = `http://localhost:8000/html/OnlineGame.html`;
  window.location.href = url;

}

function launchGame2() {
  var aiFirst = false;
  var playAgainstAI =false
  // Redirect to localhost:8000/html/index.html with query parameters
  var url = `http://localhost:8000/html/index.html?playAgainstAI=false&aiFirst=false`;
  window.location.href = url;
}
function PickFriend() {

    // Redirect to localhost:8000/html/index.html with query parameters
    var url = `http://localhost:8000/html/ChallengeAFriend.html`;
    window.location.href = url;
  }

  // Show/hide AI options based on user's choice
  window.onload = function() {
    document.getElementById('playAgainstAI').addEventListener('change', function() {
        var aiOptions = document.getElementById('aiOptions');
        aiOptions.style.display = this.value === 'true' ? 'block' : 'none';
      });
  }

  

  async function fetchSavedGames() {
    try {
      const response = await fetch('http://localhost:8000/api/game/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication token if needed
          // 'Authorization': 'Bearer ' + authToken
        }
      });
      const games = await response.json();

      // Display saved games in the table
      const savedGamesBody = document.getElementById('savedGamesBody');
      games.forEach(game => {
        const row = savedGamesBody.insertRow();
        row.insertCell(0).textContent = game.id;
        row.insertCell(1).textContent = new Date(game.createdAt).toLocaleString();
        const startButtonCell = row.insertCell(2);
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.addEventListener('click', function() {
          startGame(game.id);
        });
        startButtonCell.appendChild(startButton);
      });
    } catch (error) {
      console.error('Error fetching saved games:', error);
    }
  }

  async function startGame(gameId) {
    try {
      const response = await fetch('http://localhost:8000/api/game/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication token if needed
          // 'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ gameId: gameId })
      });
      console.log(response);
      window.location.href = response.url;
      // Handle response if needed
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }
  // Call fetchSavedGames() when the page loads
  fetchSavedGames();
