class GameState {
  constructor(id,board,playersPosition,wallsPositions) {
    this.id=id;
    this.board = board;
    this.playersPosition = playersPosition;
    this.wallsPositions = wallsPositions; // ADD BY SARRA TO STORE THE WALLS POSITIONS
  }
}
