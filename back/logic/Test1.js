// delete require.cache[require.resolve("./Darkmaze.js")];
// delete require.cache[require.resolve("./Test1.js")];
// const { setup2, nextMove2 } = require("./Darkmaze2.js");
 const { setup, nextMove } = require("./Darkmaze.js");






// var ownPlayer = 1;
// var opponentPlayer =2;
// var PlayingTurn = 1;

// let gameState = {
//   opponentWalls: [],
//   ownWalls: [], // Example wall placement
//   board: [
//     [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
//     [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
//   ],
// };

let gameState2 = {
  opponentWalls: [],
  ownWalls: [], // Example wall placement
  board: [
    [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
    [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
    [0, 0, 0,-1,2 ,-1,-1,-1,-1],
    [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
    [0, 0, 0,-1,1,-1,-1,-1,-1],
    [0, 0, 0, -1,-1 ,-1,-1,-1,-1],
    [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
    [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
    [0, 0, 0,-1,-1 ,-1,-1,-1,-1],
  ],
};
(async()=>{
      let start = await setup(1);
      console.log(start);
      console.log("hello");
        console.time("nextMove");
        let move = await nextMove(gameState2);
        console.timeEnd("nextMove");
        console.log(move);
        console.log("hola");
})();

// (async () => {

//     let startingPos;

//     console.time("setup");
//     startingPos = await setup(ownPlayer);
//     console.timeEnd("setup");

//     console.log(startingPos);

//     let col = parseInt(startingPos[0], 10);
//     let row = parseInt(startingPos[1], 10);
//     gameState.board[col - 1][row - 1] = 1;

//     console.time("setup");
//     let startingPos2 = await setup2(opponentPlayer);
//     console.timeEnd("setup");


//     console.log(startingPos2);

//     let col2 = parseInt(startingPos2[0], 10);
//     let row2 = parseInt(startingPos2[1], 10);
//     gameState2.board[col2 - 1][row2 - 1] = 1;


//     for (let i = 0; i < 20; i++) {


//       if (PlayingTurn == 1) {

//         console.log("move player 1 : ", i);

//         console.time("nextMove");
//         let move = await nextMove(gameState);
//         console.timeEnd("nextMove");

//         if (move.action == "move") {
//           console.log("SELECTED : MOVE");
//           console.log(move);
//           console.log(col,row);
//           let oldCol = col;
//           let oldRow=row;
//           gameState.board[col - 1][row - 1] = 0;
//           col = parseInt(move.value[0], 10);
//           row = parseInt(move.value[1], 10);

//           if(gameState2.board[col - 1][row - 1] == -1){
//             console.log("changingngngn ");
//             gameState2.board[oldCol - 1][oldRow - 1] = 0;
//             gameState2.board[col - 1][row - 1] = opponentPlayer;
//           }
//           gameState.board[col - 1][row - 1] = ownPlayer;
//         } 
        
        
//         else if (move.action == "wall") {
//           console.log("SELECTED : WALL");
//           gameState.ownWalls.push(move.value);
//           gameState2.opponentWalls.push(move.value);
//         }
//         else
//           console.log(move.action);
//         PlayingTurn = 2;
//         printCompactBoard(gameState);
//       } else {

//         console.log("move player 2 : ", i);

//         console.time("nextMove");
//         let move2 = await nextMove2(gameState2);
//         console.timeEnd("nextMove");
        
//         if (move2.action == "move") {

          
//           console.log("SELECTED : MOVE");
//           console.log(move2);
//           gameState2.board[col2 - 1][row2 - 1] = -1;
//           let oldCol2 = col2;
//           let oldRow2=row2;
//           col2 = parseInt(move2.value[0], 10);
//           row2 = parseInt(move2.value[1], 10);
//           if(gameState.board[col2 - 1][row2 - 1] == 0){

//             gameState.board[oldCol2 - 1][oldRow2 - 1] = 0;
//             gameState.board[col2 - 1][row2 - 1] = opponentPlayer;
//           }
          
//           gameState2.board[col2 - 1][row2 - 1] = ownPlayer;
//         } else if (move2.action == "wall") {
//           console.log("SELECTED : WALL");
//           gameState.ownWalls.push(move2.value);
//           gameState2.opponentWalls.push(move2.value);
//         }
//         else{
//           console.log(move2.action);
//         }
//         PlayingTurn = 1;
//         printCompactBoard(gameState2);
//         console.log("#############################################");
//       }
//     }
//   // } catch (err) {
//   //   console.log(err);
//   // }
// })();


//   function printCompactBoard(gameState) {
//     console.log("\n-------------------------\n");
//     console.log(gameState.ownWalls, gameState.opponentWalls);
//     gameState.board.forEach((row) => console.log(row.join(" ")));
//     console.log("\n-------------------------\n");
//   }

