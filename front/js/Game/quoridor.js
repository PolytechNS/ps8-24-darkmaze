var TestGame; // Correct the reference to GameState
var playerNumber = 0;
const rows = 17;
const cols = 17;
const grid = [];
var ContinuePlaying = true;
var Row, Col;
const fogGrid = [];
for (let i = 0; i < rows; i++) {
  grid[i] = [];
  fogGrid[i] = [];
  for (let j = 0; j < cols; j++) {
    if (i % 2 == 0 && j % 2 == 0) {
      grid[i][j] = "emptyCell";
      fogGrid[i][j] = 1;
    } else {
      grid[i][j] = "emptyWall";
      fogGrid[i][j] = 1;
    }
  }
}

var urlParams = new URLSearchParams(window.location.search);
var playAgainstAIParam = urlParams.get("playAgainstAI");
var aiFirstParam = urlParams.get("aiFirst");

//socket communications
const gameNamespace = io("/api/game");
gameNamespace.emit("setup", playAgainstAIParam, aiFirstParam);
gameNamespace.on("ErrorPlaying", (msg) => window.alert(msg));
gameNamespace.on("GameOver", (msg) => window.alert(msg));
gameNamespace.on(
  "updatedBoard",
  (id, board, playerPostion, wallsPositions, newGame) => {
    if (newGame) {
      TestGame = new GameState(id, board, playerPostion, wallsPositions);
      drawBoard();
    } else {
      let OldRow = TestGame.playersPosition[playerNumber][0];
      let OldCol = TestGame.playersPosition[playerNumber][1];
      let Opponent = playerNumber == 1 ? 0 : 1;
      let OldOpponentRow = TestGame.playersPosition[Opponent][0];
      let OldOpponentCol = TestGame.playersPosition[Opponent][1];
      TestGame = new GameState(id, board, playerPostion, wallsPositions);
      let PlayerRow = TestGame.playersPosition[playerNumber][0];
      let PlayerCol = TestGame.playersPosition[playerNumber][1];

      playerNumber ? (playerNumber = 0) : (playerNumber = 1);

      //this code should be on the update
      UpdatePiecePositionOnBoard(
        playerNumber,
        OldRow,
        OldCol,
        PlayerRow,
        PlayerCol
      );
      addMoveChoices(PlayerRow, PlayerCol, OldOpponentRow, OldOpponentCol);
      removeMoveChoices(OldRow, OldCol);
      changeVisibility(playerNumber);
      drawGrid();
    }
  }
);
gameNamespace.on(
  "UpdateWalls",
  (id, board, playerPostion, wallsPositions, direction, row, col) => {
    TestGame = new GameState(id, board, playerPostion, wallsPositions);
    updateGame(playerNumber, row, col);
    playerNumber = playerNumber === 1 ? 0 : 1;
    if (direction == "vertical")
      grid[row + 1][col] = "P" + (playerNumber + 1) + "v";
    else if (direction == "horizontal") {
      grid[row][col + 1] = "P" + (playerNumber + 1) + "h";
    }
  }
);

// functions
function UpdatePiecePositionOnBoard(
  NumberOfPlayer,
  oldRow,
  oldCol,
  newRow,
  newCol
) {
  const OldCell = document.getElementById("cell-" + oldRow + "-" + oldCol);
  const NewCell = document.getElementById("cell-" + newRow + "-" + newCol);
  NumberOfPlayer == 0
    ? OldCell.classList.remove("player2Cell")
    : OldCell.classList.remove("player1Cell");
  grid[oldRow][oldCol] = "emptyCell";
  NumberOfPlayer == 0
    ? NewCell.classList.add("player2Cell")
    : NewCell.classList.add("player1Cell");
  grid[newRow][newCol] = NumberOfPlayer === 0 ? "P2" : "P1";
}
function addMoveChoices(opponentRow, opponentCol, row, col) {
  if (row + 2 <= 16 && (row + 2 !== opponentRow || col !== opponentCol)) {
    //console.log("Adding playerChoice to cell-" + (row + 2) + "-" + col);
    document
      .getElementById("cell-" + (row + 2) + "-" + col)
      .classList.add("playerChoice");
    grid[row + 2][col] = "PChoice";
  }

  if (row - 2 >= 0 && (row - 2 !== opponentRow || col !== opponentCol)) {
    //console.log("Adding playerChoice to cell-" + (row - 2) + "-" + col);
    document
      .getElementById("cell-" + (row - 2) + "-" + col)
      .classList.add("playerChoice");
    grid[row - 2][col] = "PChoice";
  }

  if (col + 2 <= 16 && (row !== opponentRow || col + 2 !== opponentCol)) {
    //console.log("Adding playerChoice to cell-" + row + "-" + (col + 2));
    document
      .getElementById("cell-" + row + "-" + (col + 2))
      .classList.add("playerChoice");
    grid[row][col + 2] = "PChoice";
  }

  if (col - 2 >= 0 && (row !== opponentRow || col - 2 !== opponentCol)) {
    //console.log("Adding playerChoice to cell-" + row + "-" + (col - 2));
    document
      .getElementById("cell-" + row + "-" + (col - 2))
      .classList.add("playerChoice");
    grid[row][col - 2] = "PChoice";
  }
}
function removeMoveChoices(row, col) {
  if (row + 2 <= 16) {
    //console.log("Removing playerChoice from cell-" + (row + 2) + "-" + col);
    document
      .getElementById("cell-" + (row + 2) + "-" + col)
      .classList.remove("playerChoice");
    if (grid[row + 2][col] == "PChoice") grid[row + 2][col] = "emptyCell";
  }

  if (row - 2 >= 0) {
    //console.log("Removing playerChoice from cell-" + (row - 2) + "-" + col);
    document
      .getElementById("cell-" + (row - 2) + "-" + col)
      .classList.remove("playerChoice");
    if (grid[row - 2][col] == "PChoice") grid[row - 2][col] = "emptyCell";
  }

  if (col + 2 <= 16) {
    //console.log("Removing playerChoice from cell-" + row + "-" + (col + 2));
    document
      .getElementById("cell-" + row + "-" + (col + 2))
      .classList.remove("playerChoice");
    if (grid[row][col + 2] == "PChoice") grid[row][col + 2] = "emptyCell";
  }

  if (col - 2 >= 0) {
    //console.log("Removing playerChoice from cell-" + row + "-" + (col - 2));
    document
      .getElementById("cell-" + row + "-" + (col - 2))
      .classList.remove("playerChoice");
    if (grid[row][col - 2] == "PChoice") grid[row][col - 2] = "emptyCell";
  }
}
function changeVisibility(playerNumber) {
  for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
      if (playerNumber == 0 && TestGame.board[i][j] > 0) {
        document
          .getElementById("cell-" + i + "-" + j)
          .classList.add("hidedCell");
        fogGrid[i][j] = 0;
      }

      if (playerNumber == 0 && TestGame.board[i][j] <= 0) {
        document
          .getElementById("cell-" + i + "-" + j)
          .classList.remove("hidedCell");
        fogGrid[i][j] = 1;
      }

      if (playerNumber == 1 && TestGame.board[i][j] < 0) {
        document
          .getElementById("cell-" + i + "-" + j)
          .classList.add("hidedCell");
        fogGrid[i][j] = 0;
      }

      if (playerNumber == 1 && TestGame.board[i][j] >= 0) {
        document
          .getElementById("cell-" + i + "-" + j)
          .classList.remove("hidedCell");
        fogGrid[i][j] = 1;
      }
    }
  }
}

function drawBoard() {
  const quoridorBoard = document.getElementById("quoridor-board");
  //pour l'animation :
  window.lastpiece = null;
  // Create the Quoridor board
  let is_piece_box = true;
  for (let row = 0; row < 17; row++) {
    for (let col = 0; col < 17; col++) {
      const cell = document.createElement("div");

      cell.classList.add("cell");
      is_piece_box ? cell.classList.add("piece") : cell.classList.add("wall");
      cell.id = "cell-" + row + "-" + col;
      if (
        row == TestGame.playersPosition[0][0] &&
        col == TestGame.playersPosition[0][1]
      ) {
        cell.classList.add("player1Cell");
        grid[row][col] = "P1";
        // Add click event listener to each cell
      }

      if (
        row == TestGame.playersPosition[1][0] &&
        col == TestGame.playersPosition[1][1]
      ) {
        cell.classList.add("player2Cell");
        grid[row][col] = "P2";
        // Add click event listener to each cell
      }
      if (col % 2 == 0 && row % 2 == 0)
        cell.addEventListener("click", function () {
          handleClick(row, col);
        });
      if (col % 2 == 1 && row % 2 == 0) {
        cell.classList.remove("piece");
        cell.classList.add("wall");
        cell.classList.add("vertical");
      }
      if (row % 2 == 1 && col % 2 == 0) {
        cell.classList.remove("piece");
        cell.classList.add("wall");
        cell.classList.add("horizontal");
      }
      if (row % 2 == 1 && col % 2 == 1) {
        cell.classList.remove("piece");
        cell.classList.add("wall");
        cell.classList.add("dot");
      }

      quoridorBoard.appendChild(cell);
    }
    is_piece_box = is_piece_box ? false : true;
  }
  addMoveChoices(
    TestGame.playersPosition[1][0],
    TestGame.playersPosition[1][1],
    TestGame.playersPosition[0][0],
    TestGame.playersPosition[0][1]
  );
  changeVisibility(0);
  // Function to handle cell click

  //----------------------------GRID MANIPULATION--------------------------
  document.querySelectorAll(".vertical").forEach((item) => {
    item.classList.add("inWall");
  });
  document.querySelectorAll(".horizontal").forEach((item) => {
    item.classList.add("inWall");
  });

  //-------------------------------CANVA DRAW------------------------------

  window.canvas = document.getElementById("myCanvas");
  window.ctx = canvas.getContext("2d");
  const canvasHeight = canvas.height;

  const caseWidth = canvasHeight * (8 / 88);
  window.wallShort = canvasHeight * (2 / 88);
  window.wallLong = canvasHeight * (18 / 88);

  ctx.fillRect(0, 0, caseWidth, caseWidth);
  let backgroundImage; // Variable globale pour stocker l'image

  // Charger l'image une seule fois au démarrage de l'application
  let gridImage;
  let player1Image;
  let player2Image;
  let fogImage;
  let possibleImage;

  // Appeler la fonction pour charger l'image au démarrage
  loadImages()
    .then(() => {
      // L'image est chargée, vous pouvez maintenant appeler drawGrid à tout moment
      drawGrid();
    })
    .catch((error) => {
      console.error(error);
    });

  const wallItems = document.querySelectorAll(".inWall");
  wallItems.forEach((item) => {
    item.addEventListener("mouseenter", highlightWall);
  });
  wallItems.forEach((item) => {
    item.addEventListener("click", handleClickWall);
  });

  const playerChoicesE = document.querySelectorAll(".piece");
  playerChoicesE.forEach((item) => {
    item.addEventListener("mouseenter", playChoiceHover);
  });
}
// ===================================FONCTIONS UTILES =======================================================================
function loadImages() {
  return Promise.all([
    loadImage("http://localhost:8000/assets/Grid.png"),
    loadImage("http://localhost:8000/assets/P1.png"),
    loadImage("http://localhost:8000/assets/P2.png"),
    loadImage("http://localhost:8000/assets/fog.png"),
    loadImage("http://localhost:8000/assets/possibleMove.png"),
  ]);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    console.log("chargement " + src);
    image.src = src;

    image.onload = function () {
      if (src === "http://localhost:8000/assets/Grid.png") {
        gridImage = image;
      } else if (src === "http://localhost:8000/assets/P1.png") {
        player1Image = image;
      } else if (src === "http://localhost:8000/assets/P2.png") {
        player2Image = image;
      } else if (src === "http://localhost:8000/assets/fog.png") {
        fogImage = image;
      } else if (src === "http://localhost:8000/assets/possibleMove.png") {
        possibleImage = image;
      }

      resolve();
    };

    image.onerror = function () {
      reject("Erreur lors du chargement de l'image " + src);
    };
  });
}

// Fonction pour dessiner la grille avec l'image chargée
function drawGrid(player1 = true, player2 = true) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Vérifier si l'image est chargée

  if (gridImage && player1Image && player2Image) {
    // Dessiner l'image
    ctx.drawImage(gridImage, 0, 0, canvas.width, canvas.height);

    // Dessiner la grille
    ctx.fillStyle = "#444444";

    for (let x = 0; x < 17; x += 2) {
      for (let y = 0; y < 17; y += 2) {
        if (grid[x][y] == "P1" && player1) {
          ctx.drawImage(player1Image, y * 80, x * 80, 128, 128);
        }
        if (grid[x][y] == "P2" && player2) {
          ctx.drawImage(player2Image, y * 80, x * 80, 128, 128);
        }
        if (grid[x][y] == "PChoice") {
          ctx.drawImage(possibleImage, y * 80, x * 80, 128, 128);
        }
        if (fogGrid[x][y] == 0) {
          ctx.drawImage(fogImage, y * 80 - 32, x * 80 - 32, 192, 192);
        }
      }
    }
    //dessiner les murs
    for (let x = 1; x < 17; x += 2) {
      for (let y = 1; y < 17; y += 2) {
        if (grid[x][y] == "P1v") {
          ctx.fillStyle = "#fa861f";
          drawRotatedRectangle(
            ctx,
            y * 80 + 64,
            x * 80 + 64,
            wallLong,
            wallShort,
            90
          );
        }
        if (grid[x][y] == "P2v") {
          ctx.fillStyle = "#07f9fa";

          drawRotatedRectangle(
            ctx,
            y * 80 + 64,
            x * 80 + 64,
            wallLong,
            wallShort,
            90
          );
        }
        if (grid[x][y] == "P1h") {
          ctx.fillStyle = "#fa861f";

          drawRotatedRectangle(
            ctx,
            y * 80 + 64,
            x * 80 + 64,
            wallLong,
            wallShort,
            0
          );
        }
        if (grid[x][y] == "P2h") {
          ctx.fillStyle = "#07f9fa";

          drawRotatedRectangle(
            ctx,
            y * 80 + 64,
            x * 80 + 64,
            wallLong,
            wallShort,
            0
          );
        }
      }
    }
  } else {
    console.error("L'image n'est pas encore chargée.1");
  }
}
function highlightWall(event) {
  const target = event.target;
  if (!target.classList.contains("dot")) {
    drawGrid();
  }
  if (target.classList.contains("vertical")) {
    const verticals = document.querySelectorAll(".vertical");

    // Find the index of the target wall
    var index;
    for (let i = 0; i < verticals.length; i++) {
      if (verticals[i] == target) {
        index = i;
        break;
      }
    }

    // Determine the x and y position of the wall on the canvas
    var col = index % 8;
    var row = Math.floor(index / 8);
    if (row > 7) {
      row--;
    }

    // Convert grid position to canvas position
    const xPos = 8 * 16 + 160 * col;
    const yPos = 160 * row;

    // Draw a rectangle on the canvas at the position of the wall
    var nextLastPiece = [xPos + wallShort / 2, yPos + wallLong / 2, 90];

    if (lastpiece != null) {
      animateRectangle(
        ctx,
        lastpiece[0],
        lastpiece[1],
        nextLastPiece[0],
        nextLastPiece[1],
        lastpiece[2],
        nextLastPiece[2],
        100,
        wallLong,
        wallShort
      );
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(xPos, yPos, wallLong, wallShort);
    }

    lastpiece = nextLastPiece;
  } else if (target.classList.contains("horizontal")) {
    const horizontals = document.querySelectorAll(".horizontal");

    // Find the index of the target wall
    var index;
    for (let i = 0; i < horizontals.length; i++) {
      if (horizontals[i] == target) {
        index = i;
        break;
      }
    }

    // Determine the x and y position of the wall on the canvas
    var col = index % 9;
    var row = Math.floor(index / 9);
    if (col > 7) {
      col--;
    }

    // Convert grid position to canvas position
    const xPos = 160 * col;
    const yPos = 8 * 16 + 160 * row;

    // Draw a rectangle on the canvas at the position of the wall
    var nextLastPiece = [xPos + wallLong / 2, yPos + wallShort / 2, 0];

    if (lastpiece != null) {
      animateRectangle(
        ctx,
        lastpiece[0],
        lastpiece[1],
        nextLastPiece[0],
        nextLastPiece[1],
        lastpiece[2],
        nextLastPiece[2],
        100,
        wallLong,
        wallShort
      );
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(xPos, yPos, wallLong, wallShort);
    }

    lastpiece = nextLastPiece;
  }
}

function playChoiceHover(event) {
  const hoveredElement = event.target;
  if (hoveredElement.classList.contains("playerChoice")) {
    const playerChoices = document.querySelectorAll(".piece");

    const playerChoiceArray = Array.from(playerChoices);

    const index = playerChoiceArray.indexOf(hoveredElement);
    var col = index % 9;
    var row = Math.floor(index / 9);
    if (playerNumber == 0) {
      animateImage(
        player1Image,
        TestGame.playersPosition[0][1] * 80,
        TestGame.playersPosition[0][0] * 80,
        col * 160,
        row * 160,
        100
      );
    }
    if (playerNumber == 1) {
      animateImage(
        player2Image,
        TestGame.playersPosition[1][1] * 80,
        TestGame.playersPosition[1][0] * 80,
        col * 160,
        row * 160,
        100
      );
    }
  }
}

function drawRotatedRectangle(ctx, x, y, width, height, rotation) {
  ctx.globalAlpha = 0.5;
  ctx.save();
  let rotationR = (rotation * Math.PI) / 180;

  // Tranlate to the center of the rectangle
  ctx.translate(x, y);

  // Rotate the canvas to the specified angle
  ctx.rotate(rotationR);

  // Draw the rectangle
  ctx.fillRect(-width / 2, -height / 2, width, height);

  // Restore the canvas to its original state
  ctx.restore();
  ctx.globalAlpha = 1;
}

function animateRectangle(
  ctx,
  startX,
  startY,
  endX,
  endY,
  startAngle,
  endAngle,
  duration,
  width,
  height
) {
  var startTime = null;

  function animate(currentTime) {
    if (!startTime) startTime = currentTime;

    var progress = (currentTime - startTime) / duration;
    if (progress > 1) progress = 1;

    var currentX = startX * (1 - progress) + endX * progress;
    var currentY = startY * (1 - progress) + endY * progress;
    var currentAngle = startAngle * (1 - progress) + endAngle * progress;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid();

    ctx.fillStyle = "red";
    drawRotatedRectangle(ctx, currentX, currentY, width, height, currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function animateImage(image, startX, startY, endX, endY, duration) {
  const startTime = Date.now();

  function animate() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const newX = startX + (endX - startX) * progress;
    const newY = startY + (endY - startY) * progress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(playerNumber == 1, playerNumber == 0);
    ctx.drawImage(image, newX, newY, image.width, image.height);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function handleClick(row, col) {
  //console.log("Clicked on cell:", row, col);

  //we should check if the move is possible or not
  gameNamespace.emit("newMove", TestGame.id, playerNumber, row, col);

  // Add your logic for handling the click event
}

function updateGame(playerNumber, row, col) {
  var oldRow = TestGame.playersPosition[playerNumber][0];
  var oldCol = TestGame.playersPosition[playerNumber][1];
  var opponent = playerNumber === 1 ? 0 : 1;
  var oldOpponentRow = TestGame.playersPosition[opponent][0];
  var oldOpponentCol = TestGame.playersPosition[opponent][1];

  playerNumber = playerNumber === 1 ? 0 : 1;

  // Assuming removeMoveChoices, addMoveChoices, changeVisibility functions are defined elsewhere
  removeMoveChoices(oldRow, oldCol);
  addMoveChoices(row, col, oldOpponentRow, oldOpponentCol);

  // Assuming changeVisibility function takes a playerNumber as an argument
  changeVisibility(playerNumber);
  changeVisibility(playerNumber);
}

function handleClickWall(event) {
  const target = event.target;
  ctx.fillStyle = playerNumber === 0 ? "#fa861f" : "#07f9fa";

  if (target.classList.contains("vertical")) {
    console.log("test");
    const verticals = document.querySelectorAll(".vertical");
    // Find the index of the target wall
    var index;
    for (let i = 0; i < verticals.length; i++) {
      if (verticals[i] == target) {
        index = i;
        break;
      }
    }
    // Determine the x and y position of the wall on the canvas
    var col = index % 8;
    var row = Math.floor(index / 8);

    if (row > 7) {
      row--;
    }
    col = 1 + 2 * col;
    row = 2 * row;
    // Convert grid position to canvas position
    gameNamespace.emit(
      "newWall",
      TestGame.id,
      "vertical",
      row,
      col,
      playerNumber
    );
  } else if (target.classList.contains("horizontal")) {
    const horizontals = document.querySelectorAll(".horizontal");
    // Find the index of the target wall
    var index;
    for (let i = 0; i < horizontals.length; i++) {
      if (horizontals[i] == target) {
        index = i;
        break;
      }
    }

    // Determine the x and y position of the wall on the canvas
    var col = index % 9;

    var row = Math.floor(index / 9);

    if (col > 7) {
      col--;
    }
    col = 2 * col;
    row = 1 + 2 * row;

    // Convert grid position to canvas

    gameNamespace.emit(
      "newWall",
      TestGame.id,
      "horizontal",
      row,
      col,
      playerNumber
    );
  }
}
