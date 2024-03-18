const yourTeam = require('./DarkMaze.js');

// Test setup function
(async () => {
    try {
        // Simulate starting the game as player 1
        const playerNumber = 1;

        // Call the setup function
        const position = await yourTeam.setup(playerNumber);

        // Display the position returned by the setup function
        console.log("Initial position:", position);
    } catch (error) {
        console.error("Error:", error);
    }
})();
