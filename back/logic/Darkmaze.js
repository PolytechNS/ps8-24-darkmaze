// yourTeam.js

var ownPlayer;
var opponentPlayer;
// Function to set up the AI
exports.setup = function setup(AIplay) {
  return new Promise((resolve, reject) => {
    // Replace the following setTimeout with your AI setup logic
    ownPlayer = AIplay;
    opponentPlayer = AIplay === 1 ? 2 : 1;
    let col = getRandomNumber();
    let row = AIplay == 1 ? 1 : 9;
    let position = col.toString() + row.toString();
    resolve(position);
  });
};

// Function to determine the next move of the AI
exports.nextMove = function nextMove(gameState) {
  printCompactBoard(gameState);
  return new Promise((resolve, reject) => {
    let OwnPosition = getPlayerPosition(gameState, ownPlayer);
    let OpponentPostion = getPlayerPosition(gameState, opponentPlayer);
    if (OpponentPostion[0] == -1 && OpponentPostion[1] == -1) {
      //Applying Astar to find the shortest path to the goal because we can't find the opponent
      try{const moveNode =
        ownPlayer === 1
          ? astar(new Node(OwnPosition[0], OwnPosition[1]), 8, gameState).move
          : astar(new Node(OwnPosition[0], OwnPosition[1]), 0, gameState).move;

        resolve({
          action: "move",
          value: (moveNode.col + 1).toString() + (moveNode.row + 1).toString(),
        });}
        catch(e){
            resolve({ action: "idle" });

        }
    } else {
      //Applying Minimax to find the best move
      const move = PlayMinimax(gameState);
      if (move != null) {
        if (move.changedAttribute == "playerPosition") {
          let MoveCoordinations = move.newValue;
          resolve({
            action: "move",
            value:
              (MoveCoordinations[0] + 1).toString() +
              (MoveCoordinations[1] + 1).toString(),
          });
        } else if (
          move.changedAttribute == "ownWalls" ||
          move.changedAttribute == "opponentWalls"
        ) {
          resolve({ action: "wall", value: move.newValue });
        }
      } else {
        resolve({ action: "idle" });
      }
    }
  });
};

// Function to handle corrections
exports.correction = function correction(rightMove) {
  return new Promise((resolve, reject) => {
    // Replace the following setTimeout with your correction logic
    resolve(true);
  });
};
exports.updateBoard = function updateBoard(gameState) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //Ineed to compare the move i did with the new gameState
      resolve(true);
    }, 50);
  });
};

function getRandomNumber() {
  const numbers = [4, 5, 6];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  return numbers[randomIndex];
}

//################### Astar written by Bilal ############################

// the row is represented by j , and the column by i, the first index is the column
class Node {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = null;
  }

  calculateHeuristic(end) {
    return Math.abs(this.row - end);
  }

  isEqual(otherNode) {
    return this.row === otherNode.row && this.col === otherNode.col;
  }
}
//start, end are nodes
function astar(start, end, gameState) {
  let openSet = [];
  let closedSet = [];

  openSet.push(start);

  while (openSet.length > 0) {
    let currentNode = openSet[0];
    //select the best node regarding the f value
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < currentNode.f) {
        currentNode = openSet[i];
      }
    }

    if (currentNode.row == end) {
      let temp = currentNode;
      let child = temp;
      let pathLength = 0;
      while (temp !== null && temp.parent !== null) {
        child = temp;
        temp = temp.parent;
        pathLength++;
      }
      return { move: child, length: pathLength };
    }

    openSet = openSet.filter((node) => !node.isEqual(currentNode));
    closedSet.push(currentNode);

    let neighbors = [];
    let { col, row } = currentNode;

    if (isValidMove(col, row, col - 1, row, gameState))
      neighbors.push(new Node(col - 1, row));
    if (isValidMove(col, row, col + 1, row, gameState))
      neighbors.push(new Node(col + 1, row));
    if (isValidMove(col, row, col, row - 1, gameState))
      neighbors.push(new Node(col, row - 1));
    if (isValidMove(col, row, col, row + 1, gameState))
      neighbors.push(new Node(col, row + 1));
    for (let neighbor of neighbors) {
      if (!closedSet.some((node) => node.isEqual(neighbor))) {
        let tempG = currentNode.g + 1;
        if (openSet.some((node) => node.isEqual(neighbor))) {
          let existingNeighbor = openSet.find((node) => node.isEqual(neighbor));
          if (tempG < existingNeighbor.g) {
            existingNeighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          neighbor.h = neighbor.calculateHeuristic(end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;
          openSet.push(neighbor);
        }
      } else {
        // Node is already in closed set, but we've found a better path to it
        let existingClosedNode = closedSet.find((node) =>
          node.isEqual(neighbor)
        );
        let tempG = currentNode.g + 1;
        if (tempG < existingClosedNode.g) {
          // Update the g value and other relevant information
          existingClosedNode.g = tempG;
          existingClosedNode.f = existingClosedNode.g + existingClosedNode.h;
          existingClosedNode.parent = currentNode;

          // Since we've found a better path to this node, we need to move it back to the open set
          closedSet = closedSet.filter((node) => !node.isEqual(neighbor));
          openSet.push(existingClosedNode);
        }
      }
    }
  }
  return null;
}
//takes Row : x Column : y
function isValidMove(DepCol, DepRow, col, row, gameState) {
  if (
    col < 0 ||
    row < 0 ||
    col >= gameState.board.length ||
    row >= gameState.board[0].length
  ) {
    return false;
  }
  if (gameState.board[col][row] == 2 || gameState.board[col][row] == 1) {
    return false;
  }
  // Check for wall placements
  let walls = [...gameState.ownWalls, ...gameState.opponentWalls];
  for (let wall of walls) {
    if (wall[0] === undefined) continue;
    let [wallCol, wallRow] = parsePositionString(wall[0]);
    if (wall[1] === 0) {
      // Horizontal

      if (
        DepRow - row < 0 &&
        ((row === wallRow && col === wallCol) ||
          (row === wallRow && col === wallCol + 1))
      ) {
        return false;
      } else if (
        DepRow - row > 0 &&
        ((DepRow === wallRow && col === wallCol) ||
          (DepRow === wallRow && col === wallCol + 1))
      ) {
        return false;
      }
    } else {
      // Vertical wall
      if (
        DepCol - col < 0 &&
        ((row === wallRow && DepCol === wallCol) ||
          (row === wallRow - 1 && DepCol === wallCol))
      ) {
        return false;
      } else if (
        DepCol - col > 0 &&
        ((row === wallRow && col === wallCol) ||
          (row === wallRow - 1 && col === wallCol))
      ) {
        return false;
      }
    }
  }
  return true;
}

function parsePositionString(position) {
  let col = parseInt(position[0]) - 1; //
  let row = parseInt(position[1]) - 1; // Get numeric part of the position string
  return [col, row];
}

// Example usage:
// let gameState = {
//     opponentWalls: [],
//     ownWalls: [['22',0],['32',1]], // Example wall placement
//     board: [
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0],
//     ]
// };

// let startNode = new Node(2, 0);
// let path = astar(startNode, 8, gameState);
// if (path) {
//     console.log("next move ",path);

// } else {
//     console.log("No path found.");
// }
//console.log("is valid moooove ",isValidMove(2,1,3,1,gameState));
// Example test cases

//################### MiniMax written by Bilal ############################

function minimax(state, depth, maximizingPlayer) {
  if (depth === 0 || gameIsOver(state) == true) {
    if (gameIsOver(state) == true) {
      printCompactBoard(state);
    }
    return evaluatePosition(state, ownPlayer);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let successorState of generateSuccessorStates(
      state,
      maximizingPlayer ? ownPlayer : opponentPlayer
    )) {
      let eval = minimax(successorState, depth - 1, false);
      maxEval = Math.max(maxEval, eval);
    }
    if (maxEval == -Infinity) return Infinity;
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let successorState of generateSuccessorStates(
      state,
      maximizingPlayer ? ownPlayer : opponentPlayer
    )) {
      let eval = minimax(successorState, depth - 1, true);
      minEval = Math.min(minEval, eval);
    }
    if (minEval == Infinity) return -Infinity;
    return minEval;
  }
}

//PosX,PosY are my poistion on the board, gameState is the current state of the game
//Goal Coresspond to the Goal
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function generateSuccessorStates(gameState, player) {
  let successors = [];
  // Generate successors for moving the pawn
  let playerPosition = getPlayerPosition(gameState, player);
  if (player == 1 && playerPosition[1] == 8) return successors;
  if (player == 2 && playerPosition[1] == 0) return successors;
  const possibleMoves = getPossibleMoves(gameState, player);
  possibleMoves.forEach((move) => {
    let newGameState = deepCopy(gameState); // Deep copy of gameState
    makeMove(newGameState, player, move);
    successors.push(newGameState);
  });
  let opponent = player === 1 ? 2 : 1;
  let [opCol, opRow] = getPlayerPosition(gameState, opponent);

  opponent == 1 && opRow++;
  let columns = [-1, 0, 0];
  let direction = [1, 1, 0];
  for (let _ColIndex = 0; _ColIndex < columns.length; _ColIndex++) {
    let newColIndex = opCol + columns[_ColIndex];
    let newWallDirection = direction[_ColIndex];
    if (isValidWallPlacement(newColIndex, opRow, newWallDirection, gameState)) {
      let newGameState = deepCopy(gameState); // Deep copy of gameState

      player == ownPlayer
        ? newGameState.ownWalls.push([
            (newColIndex + 1).toString() + (opRow + 1).toString(),
            newWallDirection,
          ])
        : newGameState.opponentWalls.push([
            (newColIndex + 1).toString() + (opRow + 1).toString(),
            newWallDirection,
          ]); // Assume horizontal wall placement
      successors.push(newGameState);
    }
  }
  // Generate successors for placing walls
  // for (let i = 0; i < gameState.board.length; i++) {
  //     for (let j = 0; j < gameState.board[0].length; j++) {
  //         if (isValidWallPlacement(i, j, direction, gameState)) {
  //             let newGameState = gameState.clone(); // Assuming a clone method to create a deep copy of gameState
  //             newGameState.ownWalls.push([i, j]); // Assume horizontal wall placement
  //             successors.push(newGameState);
  //         }
  //     }
  // }

  return successors;
}

// it takes i from 2 to 8 and j from 1 to 7, real cell position
function isValidWallPlacement(col, row, direction, gameState) {
  // Check if wall placement is within bounds of the board

  if (row < 1 || col < 0 || row > 8 || col > 7) return false; // Invalid wall placemen

  // Check if wall overlaps with existing walls
  const walls = [...gameState.ownWalls, ...gameState.opponentWalls];
  for (const wall of walls) {
    const [wallCol, wallRow] = parsePositionString(wall[0]);
    if (wall[1] === 0) {
      // Horizontal wall
      if (direction === 0) {
        if (
          row === wallRow &&
          (col === wallCol || col === wallCol + 1 || col === wallCol - 1)
        ) {
          return false; // Overlapping wall
        }
      } else {
        // Vertical wall
        if (row === wallRow && col === wallCol) {
          return false; // Overlapping wall
        }
      }
    } else {
      // Vertical wall

      if (direction === 0) {
        if (col === wallCol && row === wallRow) {
          return false; // Overlapping wall
        }
      } else {
        // Horizontal wall
        if (
          col === wallCol &&
          (col === wallCol || col === wallCol + 1 || col === wallCol - 1)
        ) {
          return false; // Overlapping wall
        }
      }
    }
  }

  // All checks passed, wall placement is valid
  return true;
}
function gameIsOver(state, player) {
  // Check if the game is over
  getPlayerPosition(state, player);
  if (player == 1 && playerPosition[1] == 8) return true;
  if (player == 2 && playerPosition[1] == 0) return true;
  return false;
}

function evaluatePosition(gameState, player) {
  // Evaluation weights
  const WEIGHT_CENTER_CONTROL = 2;
  const WEIGHT_DISTANCE_TO_GOAL = 5;
  const WEIGHT_OPPONENT_DISTANCE_TO_GOAL = 5;
  const WEIGHT_WALL_ADVANTAGE = 1;

  // Retrieve game state information
  const ownPosition = getPlayerPosition(gameState, player);
  const opponentPosition = getPlayerPosition(gameState, player === 1 ? 2 : 1);
  const ownWalls = 10 - gameState.ownWalls.length;
  const opponentWalls = 10 - gameState.opponentWalls.length;
  // console.log("ownPosition ",ownPosition,"opo pos", opponentPosition,"own walls", ownWalls,"op walls", opponentWalls);

  // Calculate distances to goals

  let ownGoalDistance;
  try {
    ownGoalDistance =
      player === 1
        ? astar(new Node(ownPosition[0], ownPosition[1]), 8, gameState).length
        : astar(new Node(ownPosition[0], ownPosition[1]), 0, gameState).length;
  } catch (error) {
    ownGoalDistance = Infinity;
  }

  var opponentGoalDistance;
  try {
    opponentGoalDistance =
      player === 1
        ? astar(
            new Node(opponentPosition[0], opponentPosition[1]),
            0,
            gameState
          ).length
        : astar(
            new Node(opponentPosition[0], opponentPosition[1]),
            8,
            gameState
          ).length;
  } catch (error) {
    opponentGoalDistance = Infinity;
  }

  // console.log("ownGoalDistance", ownGoalDistance);
  // console.log("opponentGoalDistance", opponentGoalDistance);
  // Evaluate position based on various factors
  let score = 0;
  const centerDistance = Math.abs(4 - ownPosition[0]);
  if (player == ownPlayer) {
    score += WEIGHT_CENTER_CONTROL * (5 - centerDistance);
    score += WEIGHT_DISTANCE_TO_GOAL * (8 - ownGoalDistance);
    score -= WEIGHT_OPPONENT_DISTANCE_TO_GOAL * (8 - opponentGoalDistance);
    score += WEIGHT_WALL_ADVANTAGE * (ownWalls - opponentWalls);
  } else {
    score -= WEIGHT_CENTER_CONTROL * (5 - centerDistance);
    score -= WEIGHT_DISTANCE_TO_GOAL * (8 - ownGoalDistance);
    score += WEIGHT_OPPONENT_DISTANCE_TO_GOAL * (8 - opponentGoalDistance);
    score -= WEIGHT_WALL_ADVANTAGE * (ownWalls - opponentWalls);
  }

  return score;
}

function getPossibleMoves(gameState, player) {
  const [col, row] = getPlayerPosition(gameState, player);
  const moves = [];

  // Possible moves for the player (up, down, left, right)
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dx, dy] of directions) {
    const newCol = col + dx;
    const newRow = row + dy;
    if (isValidMove(col, row, newCol, newRow, gameState)) {
      moves.push([newCol, newRow]);
    }
  }

  return moves;
}

function makeMove(gameState, player, move) {
  const [newCol, newRow] = move;
  const [oldCol, oldRow] = getPlayerPosition(gameState, player);

  if (oldCol === -1 || oldRow === -1) return;
  gameState.board[oldCol][oldRow] = 0; // Clear old position
  gameState.board[newCol][newRow] = player; // Move player to new position
}

function getPlayerPosition(gameState, player) {
  for (let col = 0; col < gameState.board.length; col++) {
    for (let row = 0; row < gameState.board[0].length; row++) {
      if (gameState.board[col][row] === player) {
        return [col, row];
      }
    }
  }
  return [-1, -1]; // Player not found
}

// Example usage:
// let gameState = {
//   opponentWalls: [],
//   ownWalls: [], // Example wall placement
//   board: [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 2, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 1, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//   ],
// };
// let gameState2 = {
//   opponentWalls: [],
//   ownWalls: [[ '52', 0 ]], // Example wall placement
//   board: [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 2, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 1, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//   ],
// };

function printCompactBoard(gameState) {
  console.log("\n-------------------------\n");
  console.log(gameState.ownWalls, gameState.opponentWalls);
  gameState.board.forEach((row) => console.log(row.join(" ")));
  console.log("\n-------------------------\n");
}

function getMove(origGameState, modGameState, player) {
  //if not possible just return a random move so that 
  if(modGameState === undefined ||origGameState == undefined)    return {
    changedAttribute: "idle",
  };
  if (origGameState.ownWalls.length != modGameState.ownWalls.length) {
    return {
      changedAttribute: "ownWalls",
      newValue: modGameState.ownWalls[modGameState.ownWalls.length - 1],
    };
  } else if (
    origGameState.opponentWalls.length != modGameState.opponentWalls.length
  ) {
    console.log(origGameState.opponentWalls, modGameState.opponentWalls);
    return {
      changedAttribute: "opponentWalls",
      newValue:
        modGameState.opponentWalls[modGameState.opponentWalls.length - 1],
    };
  } else {
    return {
      changedAttribute: "playerPosition",
      newValue: getPlayerPosition(modGameState, player),
    };
  }
}

function PlayMinimax(gamestate) {
  let scores = [];
  let children = generateSuccessorStates(gamestate, ownPlayer);
  let childIndex = 0;
  for (let child of children) {
    scores[childIndex] = minimax(child, 4, false);
    childIndex++;
  }

  let maxScore = -Infinity;
  let maxIndex = -1;

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > maxScore) {
      maxScore = scores[i];
      maxIndex = i;
    }
  }

  return getMove(gamestate, children[maxIndex], ownPlayer);
}


