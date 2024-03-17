// This function doesn't handle walls.
const darkMazeAi = require('../logic/Darkmaze')

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
function playAi(gameStateToBeModified,socket,id){
    darkMazeAi.nextMove(gameStateToBeModified.convertGameState())
    .then((move)=>{
      console.log(move);
      if(move['action']=='move'){
        const digits = Array.from(move['value'], Number);
        console.log('digits : ',digits);
        gameStateToBeModified.play(0,(digits[1]-1)*2,(digits[0]-1)*2);
        socket.emit(
          "updatedBoard",
          id,
          gameStateToBeModified.board,
          gameStateToBeModified.playersPosition,
          gameStateToBeModified.wallsPosition,
          false
        );
        if (
          gameStateToBeModified.is_Win(
            gameStateToBeModified.GameType["aiPlayer"]
          )
        ) {
          socket.emit("GameOver", "GameOver Player the Bot wins !!!");
          GamesTable = GamesTable.filter((game) => game.id !== id);
        }
    
      }
      else if(move['action'] == 'wall'){
        console.log("walllllllll");
        const digits = Array.from(move['value'][0], Number);
        console.log('digits : ',digits);
        let row = (digits[1]-1)*2;
        let col = (digits[0]-1)*2;
        let direction = move['value'][1];
        direction == 0 && row-- ;
        direction == 1 && col++ ;
        direction ==0 ?'horizontal':'vertical';
        if (
          gameStateToBeModified.placeWalls(direction, row, col, gameStateToBeModified.GameType['aiPlayer']) ==
          true
        )
          socket.emit(
            "UpdateWalls",
            id,
            gameStateToBeModified.board,
            gameStateToBeModified.playersPosition,
            gameStateToBeModified.wallsPositions,
            direction,
            row,
            col
          );
      }
    
    
    }).catch((error)=>{console.log(error);})

}

module.exports = playAi ;
