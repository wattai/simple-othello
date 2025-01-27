// An othello game

const BOARD_WIDTH = 8;
const NUM_PLAYERS = 2;

const alertHelloWorld = () => {
    alert("HelloWorld");
}

const startGame = () => {

}

const getBoard = () => {
    return document.getElementById("board");
}

const makeBoardFrame = (board) => {
    //let board = document.getElementById("board");
    let tbl = document.createElement("table");
    let tblBody = document.createElement("tbody");
    for (let idx_row = 0; idx_row < BOARD_WIDTH; idx_row++) {
        let row = document.createElement("tr");
        for (let idx_col = 0; idx_col < BOARD_WIDTH; idx_col++) {
            let cell = document.createElement("td");
            cell.className = "cell";
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    tbl.setAttribute("border", "2");
    board.appendChild(tbl);
    return board;
}

const createBoard = () => {
    board = getBoard();
    board = makeBoardFrame(board);
}

// there are two players
//

// create board
// if start button pressed
//   clean board
//   start game
// iterate
//   player-1: put a stone
//   judge if it ends the game
//   if ends: judge which one is the winner
//   player-2: put a stone
//   judge if it ends the game
//   if ends: judge which one is the winner
// display which one is the winner

