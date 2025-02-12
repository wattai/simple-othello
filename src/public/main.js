// An othello game

const BOARD_WIDTH = 8;
const NUM_PLAYERS = 2;

const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;

const CSS_CLASS_CELL = "cell";
const CSS_CLASS_PLACEABLE = "placeable";
const CSS_CLASS_PLAYER1_STONE = "player1-stone";
const CSS_CLASS_PLAYER2_STONE = "player2-stone";

const INIT_BOARD = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

let gameController = null;
let gameScreen = null;

function moveRight([row, col]) {
    return [row, col + 1];
}
function moveLeft([row, col]) {
    return [row, col - 1];
}
function moveUp([row, col]) {
    return [row - 1, col];
}
function moveDown([row, col]) {
    return [row + 1, col];
}
function moveUpRight([row, col]) {
    return this.moveUp(this.moveRight([row, col]));
}
function moveDownRight([row, col]) {
    return this.moveDown(this.moveRight([row, col]));
}
function moveUpLeft([row, col]) {
    return this.moveUp(this.moveLeft([row, col]));
}
function moveDownLeft([row, col]) {
    return this.moveDown(this.moveLeft([row, col]));
}

class OthelloGame {
    constructor(table) {
        this.table = table; // 2D 配列としてテーブルを格納 (0: 空白, 1: 黒, 2: 白)
        this.currentPlayer = PLAYER1;
    }

    // 1ターン進める
    runOneTurn(row, col) {
        console.log("CALL: runOneTurn")
        // 石が配置可能か調べる
        if (!this.canPlaceStone(row, col, this.currentPlayer)) {
            console.log("そこは置けないよ");
            // できないならターン終了
            return;
        }

        // 石を置く
        this.table[row][col] = this.currentPlayer;

        // 石をひっくり返す
        this.flipOverSandwichedStones(row, col);

        // player をスイッチする
        this.currentPlayer = this.switchPlayer(this.currentPlayer);

        // スキップするべきか調べるため
        // スイッチしたプレイヤーで置ける場所が1つ以上存在するかどうか調べる
        if (this.shouldSkip(this.currentPlayer)) {
            // プレイヤーを再度スイッチする
            alert("打ち手がないためスキップします.");
            this.currentPlayer = this.switchPlayer(this.currentPlayer);
        }
    }

    shouldSkip(currentPlayer) {
        // スキップするべきか調べる.
        // スキップすべきかの基準: 置ける場所が1つ以上存在するかどうか.
        for (const idx_row of Array(BOARD_WIDTH).keys()) {
            for (const idx_col of Array(BOARD_WIDTH).keys()) {
                if (this.canPlaceStone(idx_row, idx_col, this.currentPlayer)) {
                    return false;
                }
            }
        }
        return true;
    }

    switchPlayer(currentPlayer) {
        if (currentPlayer == PLAYER1) {
            return PLAYER2;
        }
        if (currentPlayer == PLAYER2) {
            return PLAYER1;
        }
        throw Error("Expected player value is either 1 or 2, but given unexpected value.");
    }

    flipOverSandwichedStones(row, col) {
        // row: 石を置いた行
        // col: 石を置いた列
        for (const moveFn of [
            moveRight,
            moveDownRight,
            moveDown,
            moveDownLeft,
            moveLeft,
            moveUpLeft,
            moveUp,
            moveUpRight,
        ]) {
            let isSearching = false;
            let edgeStoneCandidate = null;
            let candidatesToBeflipped = [];
            let currentRow = row;
            let currentCol = col;
            for (const idx of Array(BOARD_WIDTH).keys()) {
                const [nextRow, nextCol] = moveFn([currentRow, currentCol]);
                if (this.checkIfOutOfBoard(nextRow, nextCol)) {
                    break;
                }
                [
                    isSearching,
                    edgeStoneCandidate,
                    candidatesToBeflipped,
                ] = this._flipSandwichedStones(
                    currentRow,
                    currentCol,
                    isSearching,
                    edgeStoneCandidate,
                    candidatesToBeflipped,
                );
                currentRow = nextRow;
                currentCol = nextCol;
            }
        }
    }

    checkIfOutOfBoard(row, col) {
        if (row < 0 || row >= BOARD_WIDTH) {
            return true;
        }
        if (col < 0 || col >= BOARD_WIDTH) {
            return true;
        }
        return false;
    }

    _flipSandwichedStones(
        row,
        col,
        isSearching,
        edgeStoneCandidate,
        candidatesToBeflipped
    ) {
        if (this.table[row][col] !== PLAYER1 && this.table[row][col] !== PLAYER2) {
            // 石が置かれていなければ
            // 検索状態を初期化
            isSearching = false;
            edgeStoneCandidate = null;
            candidatesToBeflipped = [];
        } else {
            // 石が置かれていれば
            if (!isSearching) {
                isSearching = true;
                edgeStoneCandidate = this.table[row][col];
            } else if (isSearching) {
                if (this.table[row][col] === edgeStoneCandidate) {
                    // 同じ色の石ならば
                    // 候補の石をひっくり返す
                    console.log(candidatesToBeflipped);
                    for (const [y, x] of candidatesToBeflipped) {
                        this.table[y][x] = this.table[row][col];
                    }
                    // 検索状態を初期化
                    isSearching = false;
                    edgeStoneCandidate = null;
                    candidatesToBeflipped = [];
                } else {
                    // 違う色の石ならば
                    // 候補に石の座標を追加する
                    candidatesToBeflipped.push([row, col]);
                }
            }
        }
        return [isSearching, edgeStoneCandidate, candidatesToBeflipped];
    }

    // どちらのプレイヤーが勝利したのかをチェック
    checkWinner() {
        let numBlack = 0;
        let numWhite = 0;
        for (let row of this.table) {
            for (let cell of row) {
                if (cell === 1) numBlack += 1;
                if (cell === 2) numWhite += 1;
            }
        }
        if (numBlack > numWhite) return PLAYER1;  // 黒: 1
        if (numBlack < numWhite) return PLAYER2;  // 白: 2
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

class OthelloScreen {
    constructor() {
        this.board_element = document.getElementById("board-placeholder");
        this.player_indicator_element = document.getElementById("player-indicator");

        if (!this.board_element) {
            console.error("Error: board-placeholder element not found!");
        }
        if (!this.player_indicator_element) {
            console.error("Error: player-indicator element not found!");
        }
    }

    // 画面更新関数
    reflectGameState(game) {
        this.player_indicator_element.innerText = `player${game.currentPlayer}'s turn!`;
        this.updateBoardView(game);
    }

    updateBoardView(game){
        console.log("updateBoardView");
        // 既にテーブルがある場合は削除する
        const existingTable = document.getElementById("table");
        if (existingTable !== null) {
            existingTable.remove();
        }

        // 新しいテーブルを作成する
        const new_table_element = document.createElement("table");
        new_table_element.setAttribute("id", "table");
        let tblBody = document.createElement("tbody");
        for (let idx_row = 0; idx_row < BOARD_WIDTH; idx_row++) {
            let row = document.createElement("tr");
            for (let idx_col = 0; idx_col < BOARD_WIDTH; idx_col++) {
                let cell = document.createElement("td");
                cell.innerText = `${game.table[idx_row][idx_col]}`;
                cell.className = CSS_CLASS_CELL;
                if (game.canPlaceStone(idx_row, idx_col, game.currentPlayer)) {
                    cell.className += ` ${CSS_CLASS_PLACEABLE}`;
                }
                if (game.table[idx_row][idx_col] === PLAYER1) {
                    cell.className += ` ${CSS_CLASS_PLAYER1_STONE}`;
                }
                if (game.table[idx_row][idx_col] === PLAYER2) {
                    cell.className += ` ${CSS_CLASS_PLAYER2_STONE}`;
                }
                cell.addEventListener("click", runOneTurn);
                row.appendChild(cell);
            }
            tblBody.appendChild(row);
        }

        new_table_element.appendChild(tblBody);
        new_table_element.setAttribute("border", "2");
        this.board_element.appendChild(new_table_element);
    }
}

// オセロの 1 ターンを進める
const runOneTurn = (event) => {
    console.log("PLAY");

    const cell = event.target;
    if (cell.tagName !== 'TD') {
        return;
    }
    const row = cell.parentNode.rowIndex;  // 行番号を取得
    const col = cell.cellIndex;            // 列番号を取得
    console.log(`Clicked cell at row: ${row}, col: ${col}`);

    // 1ターン進める
    gameController.runOneTurn(row, col);

    // 画面を更新する
    gameScreen.reflectGameState(gameController);
    console.log(gameController.table);

    // ゲーム終了判定をする
    // 終了したら勝利者を表示する
    console.log("isGameOver: ", gameController.isGameOver());
    if (gameController.isGameOver()) {
        alert(`GAME!! The winner is player-${gameController.checkWinner()}`);
    }
}

const createBoard = () => {
    console.log("createBoard");

    // 新しいゲームを開始
    gameController = new OthelloGame(JSON.parse(JSON.stringify(INIT_BOARD)));
    gameScreen = new OthelloScreen();

    // ボードを表示
    gameScreen.reflectGameState(gameController);
}
