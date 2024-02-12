const uuid = require('uuid');

class GameState {
  constructor() {
    this.id=uuid.v4();
    this.GameType = {}
    this.board = this.#createMatrix();
    this.playersPosition = [];
    this.wallsPositions = []; // ADD BY SARRA TO STORE THE WALLS POSITIONS
    this.playersPosition.push([0, 8]);
    this.playersPosition.push([16, 8]);
    this.change_Visib_Piece(0, "increase");
    this.change_Visib_Piece(1, "increase");
  }


  #createMatrix() {
    const matrix = [];
    for (let i = 0; i < 8; i++) { 
      matrix.push(Array(17).fill(-1));
    }

    matrix.push(Array(17).fill(0));

    for (let i = 0; i < 8; i++) {
      matrix.push(Array(17).fill(1));
    }

    return matrix;
  }

  getBoard(){
    return this.board
  }

  CreateWallsPlacement() {
    for (let i = 0; i < 17; i++)
      for (let j = 0; j < 17; j++)
        if (j % 2 != 0 || i % 2 != 0) this.board[i][j] = 0;
  }

  printGameState() {
    for (let i = 0; i < 17; i++) {
      let rowString = "";
      for (let j = 0; j < 17; j++) {
        if (i % 2 === 0 && j % 2 === 1) {
          // Odd rows and columns represent walls
          if (this.board[i][j] == BoardPieceStatus.OCCUPIED_WALL)
            rowString += " | ";
          else rowString += "   ";
        } else if (i % 2 === 0 && j % 2 === 0) {
          rowString += this.board[i][j];
        } else if (
          i % 2 === 1 &&
          j % 2 === 0 &&
          this.board[i][j] == BoardPieceStatus.OCCUPIED_WALL
        ) {
          rowString += "_ ";
        } else {
          rowString += "  ";
        }
      }
      console.log(rowString);
    }
  }

  change_Visib_Piece(playerNumber, action) {
    if (action == "increase")
      var Visib_Added_Value = playerNumber == 0 ? -2 : 2;
    else var Visib_Added_Value = playerNumber == 0 ? 2 : -2;

    var playerPostion = this.playersPosition[playerNumber];
    var P_Row = playerPostion[0];
    var P_Col = playerPostion[1];
    this.board[P_Row][P_Col] += Visib_Added_Value;
    if (P_Col + 2 <= 16) this.board[P_Row][P_Col + 2] += Visib_Added_Value;
    if (P_Col - 2 >= 0) this.board[P_Row][P_Col - 2] += Visib_Added_Value;
    if (P_Row + 2 <= 16) this.board[P_Row + 2][P_Col] += Visib_Added_Value;
    if (P_Row - 2 >= 0) this.board[P_Row - 2][P_Col] += Visib_Added_Value;
  }

  play(playerNumber, row, col) {
    console.log("play is called");
    if (row % 2 == 1 && col % 2 == 1) {
      console.log("not a valid input");
      return false;
    }
    //player number 1 2 3 4 we need to put -1 to get playerpostion array index
    else if (this.is_move_possible(playerNumber, row, col)) {
      //player number is 1 - 2
      console.log("inside move is pos");
      this.change_Visib_Piece(playerNumber, "decrease");

      this.playersPosition[playerNumber] = [parseInt(row), parseInt(col)];
      console.log(this.playersPosition[playerNumber]);
      this.change_Visib_Piece(playerNumber, "increase");
      return true;
    }
  }

  is_move_possible(playerNumber, MoveRow, MoveCol) {
    var playerPostion = this.playersPosition[playerNumber];
    var oponentPosition =
      playerNumber == 1 ? this.playersPosition[0] : this.playersPosition[1];
    //la postion actuel ou la position d'adversaire
    if (
      (playerPostion[0] == MoveRow && playerPostion[1] == MoveCol) ||
      (oponentPosition[0] == MoveRow && oponentPosition[1] == MoveCol)
    )
      return false;
    else if (playerPostion[0] == MoveRow) {
      if (
        Math.abs(MoveCol - playerPostion[1]) != 2 ||
        MoveCol < 0 ||
        MoveCol > 16 ||
        MoveCol % 2 == 1
      )
        return false;
      let Wall_y =
        MoveCol > playerPostion[1]
          ? playerPostion[1] + 1
          : playerPostion[1] - 1;
      return !this.wallsPositions.some(
        (obj) => obj.wallRow === MoveRow && obj.wallCol === Wall_y
      );
    } else if (playerPostion[1] == MoveCol) {
      if (
        Math.abs(MoveRow - playerPostion[0]) != 2 ||
        MoveRow < 0 ||
        MoveRow > 16 ||
        MoveRow % 2 == 1
      )
        return false;
      let Wall_x =
        MoveRow > playerPostion[0]
          ? playerPostion[0] + 1
          : playerPostion[0] - 1;

      return !this.wallsPositions.some(
        (obj) => obj.wallRow === Wall_x && obj.wallCol === MoveCol
      );
    } else return false;
  }

  //ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ  BELOW LINES ARE ADDED BY SARRA ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
  // --------------------------------------         Walls Management        -----------------------------------------------
  //ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ

  isWallPositionOccuped(wallDirection, rowSearch, colSearch) {
    // CHECK OUT IF THE POSITION IS AVAILABLE TO ADD A WALL
    for (var i = 0; i < this.wallsPositions.length; i++) {
      var lig = this.wallsPositions[i];

      if (wallDirection === "horizontal") {
        if (
          (lig.wallCol === colSearch && lig.wallRow === rowSearch) ||
          (lig.wallCol === colSearch + 1 && lig.wallRow === rowSearch) ||
          (lig.wallCol === colSearch + 2 && lig.wallRow === rowSearch)
        ) {
          return lig;
        }
      }
      if (wallDirection === "vertical") {
        if (
          (lig.wallRow === rowSearch && lig.wallCol === colSearch) ||
          (lig.wallRow === rowSearch + 1 && lig.wallCol === colSearch) ||
          (lig.wallRow === rowSearch + 2 && lig.wallCol === colSearch)
        ) {
          return lig;
        }
      }
    }
    // IF NOT FOUND RETURN null
    return null;
  }

  isMaxWallPlayerPlaced(player) {
    // CHECK OUT IF THE PLAYER HAS PLACED THE MAX NUMBER OF WALLS (10 Walls for each player)
    var Counter = 0;
    for (var i = 0; i < this.wallsPositions.length; i++) {
      var lig = this.wallsPositions[i];
      if (lig.numplayer === player) {
        Counter++;
      }
    }
    if (Counter <= 27) {
      // EACH WALL OCCUPIES 3 CELLS SO THE MAXIMUM OF CELLS FOR EACH PLAYER WILL BE 30
      return true;
    } else {
      return false;
    }
  }

  addWall(wallRow, wallCol, numplayer) {
    // ADD A WALL TO THE TABLE OF THE WALLS
    var newWall = { wallRow: wallRow, wallCol: wallCol, numplayer: numplayer };
    this.wallsPositions.push(newWall);
  }

  placeWalls(wallDirection, wallRow, wallCol, player) {
    // IF IT IS POSSIBLE TO PLACE A WALL, RETURN TRUE AND ADD THE WALL TO THE TABLE OF THE WALLS

    if (wallDirection == "vertical" && wallCol % 2 == 1 && wallRow % 2 == 0) {
      // Vertical Wall
      let newWalls = [...this.wallsPositions];
      newWalls.push(
        { wallRow: wallRow, wallCol: wallCol },
        { wallRow: wallRow + 1, wallCol: wallCol },
        { wallRow: wallRow + 2, wallCol: wallCol }
      );
      if (
        this.isWallPositionOccuped("vertical", wallRow, wallCol) == null &&
        this.isMaxWallPlayerPlaced(player) &&
        this.hasPathDFS(newWalls)
      ) {
        console.log("in ver");
        // Fonction pour ajouter un mur vertical de deux cellules
        this.addWall(wallRow, wallCol, player);
        this.addWall(wallRow + 1, wallCol, player);
        this.addWall(wallRow + 2, wallCol, player);
        this.ChangeVisiblityForWall(player, wallRow, wallCol, wallDirection);
        return true;
      } else {
        console.log(
          "IMPOSSIBLE TO ADD A VERTICAL WALL FOR THE PLAYER: ",
          player
        );
        return false;
      }
    }

    if (wallDirection == "horizontal" && wallRow % 2 == 1 && wallCol % 2 == 0) {
      // Horizontal Wall
      let newWalls = [...this.wallsPositions];
      newWalls.push(
        { wallRow: wallRow, wallCol: wallCol },
        { wallRow: wallRow, wallCol: wallCol + 1 },
        { wallRow: wallRow, wallCol: wallCol + 2 }
      );
      console.log(        this.isWallPositionOccuped("horizontal", wallRow, wallCol) == null ,
      this.isMaxWallPlayerPlaced(player) ,
      this.hasPathDFS(newWalls));
      if (
        this.isWallPositionOccuped("horizontal", wallRow, wallCol) == null &&
        this.isMaxWallPlayerPlaced(player) &&
        this.hasPathDFS(newWalls)
      ) {
        console.log("in hor");
        // Fonction pour ajouter un mur horizontal de deux cellules
        this.addWall(wallRow, wallCol, player);
        this.addWall(wallRow, wallCol + 1, player);
        this.addWall(wallRow, wallCol + 2, player);
        this.ChangeVisiblityForWall(player, wallRow, wallCol, wallDirection);
        return true;
      } else {
        console.log(
          "IMPOSSIBLE TO ADD A HORIZONTAL WALL FOR THE PLAYER: ",
          player
        );
        return false;
      }
    }
  }

  //ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ  END OF THE WALLS MANAGEMENT    ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
  // --------------------------------------                                 -----------------------------------------------
  //ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ

  is_Win(playerNumber) {
    if (playerNumber == 0 && this.playersPosition[0][0] == 16) return true;
    else if (playerNumber == 1 && this.playersPosition[1][0] == 0) return true;
    else return false;
  }

  ChangeVisiblityForWall(playerNumber, row, col, direction) {
    var Visib_Added_Value = playerNumber == 0 ? -1 : 1;

    var matrix = [];
    for (var i = 0; i < 7; i++) {
      matrix.push(Array(7).fill(Visib_Added_Value));
    }
    // reducing edges
    matrix[0][0] -= Visib_Added_Value;
    matrix[0][6] -= Visib_Added_Value;
    matrix[6][0] -= Visib_Added_Value;
    matrix[6][6] -= Visib_Added_Value;
    // changing core
    matrix[2][2] += Visib_Added_Value;
    matrix[2][4] += Visib_Added_Value;
    matrix[4][2] += Visib_Added_Value;
    matrix[4][4] += Visib_Added_Value;

    var rowIndex;
    var colIndex;
    if (direction == "vertical") {
      if (row - 2 >= 0) rowIndex = row - 2;
      else rowIndex = row;
      if (col - 3 >= 0) colIndex = col - 3;
      else colIndex = col;
    }
    if (direction == "horizontal") {
      if (row - 3 >= 0) rowIndex = row - 3;
      else rowIndex = row;
      if (col - 2 >= 0) colIndex = col - 2;
      else colIndex = col;
    }
    console.log(rowIndex, colIndex);

    for (let i = 0; i < 7; i++) {
      if (i % 2 == 1 || rowIndex > 16 || colIndex > 16) continue;
      for (let j = 0; j < 7; j++) {
        if (i % 2 === 0 && j % 2 === 0) {
          this.board[rowIndex][colIndex] += matrix[i][j];
        }
        colIndex++;
      }
      colIndex -= 7;
      rowIndex += 2;
    }
  }
  // Algorithmic logic for deteremining is there a path or no
  hasPathDFS(newWalls) {

    let target = 16;
    let status1 = false;
    let status2 = false;
    for (let index = 0; index < 2; index++) {
      const startNode = this.playersPosition[index];

      const stack = [];
      const visited = new Set();

      stack.push(startNode);

      while (stack.length > 0) {
        const currentNode = stack.pop();
        if (currentNode[0] === target) {
          index == 0 ? (status1 = true) : (status2 = true);
          break;
        }

        visited.add(JSON.stringify(currentNode));

        const neighbors = this.GetNeighbors(
          currentNode[0],
          currentNode[1],
          newWalls
        );
        for (const neighbor of neighbors) {
          if (!visited.has(JSON.stringify(neighbor))) {
            stack.push(neighbor);
          }
        }
      }
      target = 0;
    }
    console.log("stat1 ", status1, "stat2", status2);
    return status1 && status2;
  }

  GetNeighbors(Row, Col, newWalls) {
    var P_Row = Row;
    var P_Col = Col;
    var neighbors = [];
    if (
      P_Col + 2 <= 16 &&
      !this.IsThereWall(P_Row, P_Col, P_Row, P_Col + 2, newWalls)
    )
      neighbors.push([P_Row, P_Col + 2]);
    if (
      P_Col - 2 >= 0 &&
      !this.IsThereWall(P_Row, P_Col, P_Row, P_Col - 2, newWalls)
    )
      neighbors.push([P_Row, P_Col - 2]);
    if (
      P_Row + 2 <= 16 &&
      !this.IsThereWall(P_Row, P_Col, P_Row + 2, P_Col, newWalls)
    )
      neighbors.push([P_Row + 2, P_Col]);
    if (
      P_Row - 2 >= 0 &&
      !this.IsThereWall(P_Row, P_Col, P_Row - 2, P_Col, newWalls)
    )
      neighbors.push([P_Row - 2, P_Col]);
    return neighbors;
  }
  IsThereWall(sourceRow, sourceCol, arrivalRow, arrivalCol, newWalls) {
    var wallRow;
    var wallCol;
    if (sourceRow == arrivalRow + 2) {
      wallRow = sourceRow - 1;
      wallCol = sourceCol;
    } else if (sourceRow == arrivalRow - 2) {
      wallRow = sourceRow + 1;
      wallCol = sourceCol;
    } else if (sourceCol == arrivalCol + 2) {
      wallCol = sourceCol - 1;
      wallRow = sourceRow;
    } else if (sourceCol == arrivalCol - 2) {
      wallCol = sourceCol + 1;
      wallRow = sourceRow;
    } else return null;
    for (var i = 0; i < newWalls.length; i++) {
      if (
        newWalls[i]["wallRow"] == wallRow &&
        newWalls[i]["wallCol"] == wallCol
      ) {
        return true;
      }
    }
    return false;
  }
}
class BoardPieceStatus {
  static FREE_WALL = 6;
  static OCCUPIED_WALL = 7;
}
class Player {
  static Player_Number_1 = 0;
  static Player_Number_2 = 1;
}

//const gameState = new GameState();
//gameState.printGameState();
// console.log("dec ",gameState.hasPathDFS(0));
// gameState.addWall(0,7, 1);
// console.log("dec ",gameState.hasPathDFS(0));
// gameState.addWall(0,9, 1);
// console.log("dec ",gameState.hasPathDFS(0));
//gameState.addWall(1, 8, 1);
// console.log(gameState.IsThereWall(gameState.playersPosition[0][0],gameState.playersPosition[0][1],0,10));
// console.log(gameState.IsThereWall(gameState.playersPosition[0][0],gameState.playersPosition[0][1],gameState.playersPosition[0][0],gameState.playersPosition[0][1]-2));
// console.log(gameState.IsThereWall(gameState.playersPosition[0][0],gameState.playersPosition[0][1],gameState.playersPosition[0][0]+2,gameState.playersPosition[0][1]));
// console.log(gameState.GetNeighbors(gameState.playersPosition[0][0],gameState.playersPosition[0][1]));
// console.log("dec ",gameState.hasPathDFS(0));
// console.log("player Position :",gameState.playersPosition);
// gameState.play(0,"move",0,10)
// console.log("-------------------------------------------\n");
// gameState.printGameState();

// console.log("player Position :",gameState.playersPosition);

// console.log("player Position :",gameState.playersPosition);

// gameState.ChangeVisiblityForWall(0,2,5,"vertical");
// console.log("\n---------------------------------------\n");

// gameState.printGameState();
// gameState.ChangeVisiblityForWall(0,15,2,"horizontal");
// console.log("\n---------------------------------------\n");
// gameState.ChangeVisiblityForWall(0,2,5,"vertical");
// gameState.printGameState();

//console.log(gameState.wallsPositions);
module.exports = GameState;
