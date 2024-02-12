// This function doesn't handle walls.
function computeMove(gameState,playerNumber) {
    let pos = gameState.playersPosition[playerNumber];
    let possibleMoves = [];
    // Check if moving left is possible.
    if (pos[1] > 0) possibleMoves.push([pos[0],pos[1]-2]);
    // Check if moving right is possible.
    if (pos[1] < 16) possibleMoves.push([pos[0],pos[1]+2]);
    // Check if moving down is possible.
    if (pos[0] < 16) possibleMoves.push([pos[0]+2,pos[1]]);
    // Check if moving up is possible.
    if (pos[0] >0) possibleMoves.push([pos[0]-2,pos[1]]);

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random()*possibleMoves.length);
    return possibleMoves[moveIndex];
}

module.exports = computeMove ;

function computeMove2(gameState,playerNumber) {
    let pos = gameState.playersPosition[playerNumber];
    let possibleMoves = [];
    // Check if moving left is possible.
    if (pos[1] > 0) possibleMoves.push([pos[0],pos[1]-2]);
    // Check if moving right is possible.
    if (pos[1] < 16) possibleMoves.push([pos[0],pos[1]+2]);
    // Check if moving down is possible.
    if (pos[0] < 16) possibleMoves.push([pos[0]+2,pos[1]]);
    // Check if moving up is possible.
    if (pos[0] >0) possibleMoves.push([pos[0]-2,pos[1]]);

    if(playerNumber=0){
        const path =astar(gameState.getBoard(),new Node(pos),new Node(16,16));
        return path[0]
    }
    if(playerNumber=1){
        const path = astar(gameState.getBoard(),new Node(pos),new Node(0,0));
        return path[0]
    }
    return possibleMoves[moveIndex];
}