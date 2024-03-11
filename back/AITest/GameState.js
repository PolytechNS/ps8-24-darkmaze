//gamestate
// Function to get the next state after making a move
function getNextState(gameState, move) {
    // Clone the current game state to avoid mutation
    const nextState = JSON.parse(JSON.stringify(gameState));

    // Update the game state based on the move
    if (move.action === "move") {
        // Move the current player to the specified cell
        nextState.currentPlayer.position = move.value;
    } else if (move.action === "wall") {
        // Place a wall on the board at the specified position and orientation
        const row = move.value[0];
        const column = move.value[1];
        const orientation = move.value[2];
        nextState.walls.push({ row, column, orientation });
        // Decrease the number of walls remaining for the current player
        nextState.currentPlayer.walls--;
    }

    // Switch the current player
    nextState.currentPlayer = (nextState.currentPlayer === nextState.player1) ? nextState.player2 : nextState.player1;

    return nextState;
}

// Sample gameState object (for illustration purposes)
const gameState = {
    currentPlayer: {}, // Object representing the current player
    player1: { position: "E1", walls: 10 }, // Object representing player 1
    player2: { position: "E9", walls: 10 }, // Object representing player 2
    boardSize: 9, // Size of the game board (assuming a 9x9 board)
    walls: [], // Array of objects representing the walls on the board
    // Any other relevant information about the game state
};

// Sample move object (for illustration purposes)
const move = { action: "move", value: "E2" };

// Example usage of getNextState function
const nextState = getNextState(gameState, move);
console.log(nextState);
