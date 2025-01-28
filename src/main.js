// An othello game

const BOARD_WIDTH = 8;
const NUM_PLAYERS = 2;
let isPlayer1Turn = true;
let isFinishGame = false;

const INIT_BOARD = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

class OthelloGame {
    constructor(table) {
        this.table = table; // 2D 配列としてテーブルを格納 (0: 空白, 1: 黒, 2: 白)
    }

    // TODO: 石を置く
    placeStone(row, col, player) {
        if (!this.canPlaceStone(row, col, player)) {
            return;
        }
        this.table[row][col] = player;
    }
    
    // TODO: どちらのプレイヤーが勝利したのかをチェック
    checkWinner() {
        let numBlack = 0;
        let numWhite = 0;
        for (let row of this.table) {
            for (let cell of row) {
                if (cell === 1) numBlack += 1;
                if (cell === 2) numWhite += 2;
            }
        }
        if (numBlack > numWhite) return 1;  // 黒: 1
        if (numBlack < numWhite) return 2;  // 白: 2
        if (numBlack === numWhite) return 0;  // 引き分け: 0
    }

    // 盤面がすべて埋まっているかチェック
    isBoardFull() {
        return this.table.every(row => row.every(cell => cell !== 0));
    }

    // 黒石と白石の存在をチェック
    hasOnlyOneColor() {
        let blackExists = false;
        let whiteExists = false;
        for (let row of this.table) {
            for (let cell of row) {
                if (cell === 1) blackExists = true;
                if (cell === 2) whiteExists = true;
            }
        }
        return !(blackExists && whiteExists);
    }

    // 指定した位置が合法手かどうかをチェック
    canPlaceStone(row, col, player) {
        // 既に埋まっている場合
        if (this.table[row][col] !== 0)
            return false;

        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],  // 上下左右
            [-1, -1], [-1, 1], [1, -1], [1, 1]  // 斜め
        ];

        const opponent = player === 1 ? 2 : 1;

        for (const [dx, dy] of directions) {
            let r = row + dx;
            let c = col + dy;
            let foundOpponent = false;

            while (r >= 0 && r < this.table.length && c >= 0 && c < this.table[0].length) {
                if (this.table[r][c] === opponent) {
                    foundOpponent = true;
                } else if (this.table[r][c] === player && foundOpponent) {
                    return true;  // 挟める石が見つかった
                } else {
                    break;
                }
                r += dx;
                c += dy;
            }
        }
        return false;
    }

    // どちらのプレイヤーも合法手がないかチェック
    hasNoValidMoves() {
        for (let row = 0; row < this.table.length; row++) {
            for (let col = 0; col < this.table[row].length; col++) {
                if (this.canPlaceStone(row, col, 1) || this.canPlaceStone(row, col, 2)) {
                    return false;  // どちらかが合法手を持っている場合
                }
            }
        }
        return true;
    }

    // ゲーム終了判定
    isGameOver() {
        return this.isBoardFull() || this.hasOnlyOneColor() || this.hasNoValidMoves();
    }
}

// ゲーム開始
const game = new OthelloGame(INIT_BOARD);

const runPlayer = (event) => {
    console.log("PLAY");
    console.log(isPlayer1Turn);

    const cell = event.target;
    if (cell.tagName !== 'TD') {
        return;
    }
    const row = cell.parentNode.rowIndex;  // 行番号を取得
    const col = cell.cellIndex;            // 列番号を取得
    console.log(`Clicked cell at row: ${row}, col: ${col}`);

    // TODO: 石を置く
    if (isPlayer1Turn === true) {
        // alert("run player1!!!");
        putBlackStone(cell);
        game.placeStone(row, col, 1);
    }
    if (isPlayer1Turn === false) {
        // alert("run player2!!!");
        putWhiteStone(cell);
        game.placeStone(row, col, 2);
    }
    // TODO: 画面を更新する
    updateBoardView(board, game.table);

    // TODO: ゲーム終了判定をする
    if (game.isGameOver() === true) {
        alert(`GAME!! The winner is ${isPlayer1Turn ? "player1" : "player2"}`);
    }
    // TODO: 終了したら勝利者を表示する
    isPlayer1Turn = !isPlayer1Turn;
}

const putBlackStone = (cell) => {
    let stone = document.createElement("p");
    stone.innerText = "B";
    cell.appendChild(stone);
}
const putWhiteStone = (cell) => {
    let stone = document.createElement("p");
    stone.innerText = "W";
    cell.appendChild(stone);
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
            cell.addEventListener("click", runPlayer);
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    tbl.setAttribute("border", "2");
    board.appendChild(tbl);
    return board;
}

// 画面更新関数
const updateBoardView = (board_view, board_array) => {
    let board = document.getElementById("board");
    //document.delete board.

    let tbl = document.createElement("table");
    let tblBody = document.createElement("tbody");
    for (let idx_row = 0; idx_row < BOARD_WIDTH; idx_row++) {
        let row = document.createElement("tr");
        for (let idx_col = 0; idx_col < BOARD_WIDTH; idx_col++) {
            let cell = document.createElement("td");
            cell.innerText = `${board_array[idx_row][idx_col]}`;
            cell.className = "cell";
            cell.addEventListener("click", runPlayer);
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    tbl.setAttribute("border", "2");
    board_view.appendChild(tbl);
    return board;
    
    
}

const createBoard = () => {
    // TODO: clear board
    board_view = getBoard();
    board_view = makeBoardFrame(board_view);

    // while(true) {
    //     //board = runPlayer1();
    //     if (isGameEnd(board) === true) {
    //         alert("The winner is player1.");
    //         break;
    //     }
    //     //board = runPlayer2();
    //     if (isGameEnd(board) === true) {
    //         alert("The winner is player2.");
    //         break;
    //     }
    // }
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

