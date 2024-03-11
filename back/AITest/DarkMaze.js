// yourTeam.js

// Function to determine initial placement
exports.setup = async function setup(AIplay) {
    // Randomly choose initial placement
    const initialPlacement = randomPlacement();
    return Promise.resolve(initialPlacement);
}

// Function to determine the next move
exports.nextMove = async function nextMove(gameState) {
    // Implement Minimax algorithm with alpha-beta pruning to select the next move
    const nextMove = minimaxAlphaBeta(gameState, 3, -Infinity, Infinity, true).move;
    return Promise.resolve(nextMove);
}

// Function to handle corrections
exports.correction = async function correction(rightMove) {
    // Handle correction by simply returning true
    return Promise.resolve(true);
}

// Function to update the board after a move
exports.updateBoard = async function updateBoard(gameState) {
    // Update the board by simply returning true
    return Promise.resolve(true);
}

// Helper function to generate random initial placement
function randomPlacement() {
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const randomColumn = columns[Math.floor(Math.random() * columns.length)];
    const randomRow = rows[Math.floor(Math.random() * rows.length)];

    return randomColumn + randomRow;
}

// Helper function to evaluate the board state
function evaluateBoard(gameState) {
    const player1Position = gameState.player1.position;
    const player2Position = gameState.player2.position;
    const goal1 = gameState.boardSize - 1;
    const goal2 = 0;
    const wallPenalty = 0.1;

    // Calculate distance from player 1 to goal 1
    const distanceToGoal1 = Math.abs(player1Position.row - goal1);

    // Calculate distance from player 2 to goal 2
    const distanceToGoal2 = Math.abs(player2Position.row - goal2);

    // Penalize positions blocked by walls
    let wallPenaltyScore = 0;
    for (let wall of gameState.walls) {
        if (wall.orientation === 0) { // Horizontal wall
            if (player1Position.row === wall.row && player1Position.column === wall.column) {
                wallPenaltyScore += wallPenalty;
            }
            if (player2Position.row === wall.row && player2Position.column === wall.column) {
                wallPenaltyScore += wallPenalty;
            }
        } else { // Vertical wall
            if (player1Position.row === wall.row && player1Position.column === wall.column) {
                wallPenaltyScore += wallPenalty;
            }
            if (player2Position.row === wall.row && player2Position.column === wall.column) {
                wallPenaltyScore += wallPenalty;
            }
        }
    }

    // Calculate the score based on the distances to goals and wall penalty
    const score = distanceToGoal1 - distanceToGoal2 - wallPenaltyScore;

    return score;
}


// Minimax algorithm with alpha-beta pruning
function minimaxAlphaBeta(gameState, depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || isGameOver(gameState)) {
        return { move: null, score: evaluateBoard(gameState) };
    }

    const legalMoves = getAllLegalMoves(gameState);

    if (maximizingPlayer) {
        let maxScore = -Infinity;
        let bestMove = null;
        for (let move of legalMoves) {
            const nextState = getNextState(gameState, move);
            const { score } = minimaxAlphaBeta(nextState, depth - 1, alpha, beta, false);
            if (score > maxScore) {
                maxScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, score);
            if (alpha >= beta) {
                break; // Beta cutoff
            }
        }
        return { move: bestMove, score: maxScore };
    } else {
        let minScore = Infinity;
        let bestMove = null;
        for (let move of legalMoves) {
            const nextState = getNextState(gameState, move);
            const { score } = minimaxAlphaBeta(nextState, depth - 1, alpha, beta, true);
            if (score < minScore) {
                minScore = score;
                bestMove = move;
            }
            beta = Math.min(beta, score);
            if (alpha >= beta) {
                break; // Alpha cutoff
            }
        }
        return { move: bestMove, score: minScore };
    }
}

// Function to check if the game is over
function isGameOver(gameState) {
    const player1Position = gameState.player1.position;
    const player2Position = gameState.player2.position;
    const goal1 = gameState.boardSize - 1; // Player 1's goal line
    const goal2 = 0; // Player 2's goal line

    // Check if player 1 reached their goal line
    if (player1Position.row === goal1) {
        return true; // Player 1 wins
    }

    // Check if player 2 reached their goal line
    if (player2Position.row === goal2) {
        return true; // Player 2 wins
    }

    // If neither player reached their goal line, the game is not over
    return false;
}


// Function to get all legal moves
function getAllLegalMoves(gameState) {
    const playerPosition = gameState.currentPlayer.position;
    const walls = gameState.walls;

    const legalMoves = [];

    // Generate legal moves for pawn movement
    const adjacentCells = getAdjacentCells(playerPosition);
    for (let cell of adjacentCells) {
        if (isValidMove(cell, walls)) {
            legalMoves.push({ action: "move", value: cell });
        }
    }

    // Generate legal moves for wall placement
    if (gameState.currentPlayer.walls > 0) {
        for (let row = 0; row < gameState.boardSize - 1; row++) {
            for (let column = 0; column < gameState.boardSize - 1; column++) {
                if (isValidWallPlacement(row, column, walls)) {
                    legalMoves.push({ action: "wall", value: [row, column, 0] }); // Horizontal wall
                    legalMoves.push({ action: "wall", value: [row, column, 1] }); // Vertical wall
                }
            }
        }
    }

    return legalMoves;
}

// Function to get adjacent cells to a given cell
function getAdjacentCells(cell) {
    const row = cell[0].charCodeAt(0) - 'A'.charCodeAt(0);
    const column = parseInt(cell[1]) - 1;

    const adjacentCells = [];

    // Check adjacent cells
    if (row > 0) adjacentCells.push(String.fromCharCode(row + 'A'.charCodeAt(0) - 1) + (column + 1)); // Up
    if (row < 8) adjacentCells.push(String.fromCharCode(row + 'A'.charCodeAt(0) + 1) + (column + 1)); // Down
    if (column > 0) adjacentCells.push(cell[0] + column); // Left
    if (column < 8) adjacentCells.push(cell[0] + (column + 2)); // Right

    return adjacentCells;
}

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

