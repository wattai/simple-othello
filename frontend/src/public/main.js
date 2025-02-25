// An othello game

const BOARD_WIDTH = 8;
const NUM_PLAYERS = 2;

const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;

const CSS_CLASS_CELL = "cell";
const CSS_CLASS_PLAYER1_PLACEABLE = "player1-placeable";
const CSS_CLASS_PLAYER2_PLACEABLE = "player2-placeable";
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
        this.words_from_charactor = null;
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
        throw new Error("Expected player value is either 1 or 2, but given unexpected value.");
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
            let candidatesToBeflipped = [];
            let currentRow = row;
            let currentCol = col;
            console.log(moveFn.name);
            for (const idx of Array(BOARD_WIDTH).keys()) {
                const [nextRow, nextCol] = moveFn([currentRow, currentCol]);
                // ボード上からはみ出たら break
                if (this.checkIfOutOfBoard(nextRow, nextCol)) {
                    break;
                }
                // 何もなければ break
                if (this.table[nextRow][nextCol] === EMPTY) {
                    console.log("EMPTY");
                    break;
                }
                // 現在のプレイヤーと違う石だったら, 反転候補座標に入れる
                if (this.table[nextRow][nextCol] === this.switchPlayer(this.currentPlayer)) {
                    candidatesToBeflipped.push([nextRow, nextCol]);
                }
                // 現在のプレイヤーと同じ石だったら, 反転候補座標をひっくり返して, break
                if (this.table[nextRow][nextCol] === this.currentPlayer) {
                    for (const [r, c] of candidatesToBeflipped) {
                        this.table[r][c] = this.currentPlayer;
                    }
                    break;
                }
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
        if (this.table[row][col] !== EMPTY)
            return false;

        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],  // 上下左右
            [-1, -1], [-1, 1], [1, -1], [1, 1]  // 斜め
        ];

        const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1;

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
                if (this.canPlaceStone(row, col, PLAYER1) || this.canPlaceStone(row, col, PLAYER2)) {
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

function num2PlayerColor(num) {
    if (num === PLAYER1) {
        return "黒";
    } else if (num === PLAYER2) {
        return "白";
    }
    throw new Error(`Found unexpected arguments: ${num}.`);
}

class OthelloScreen {
    constructor() {
        this.board_element = document.getElementById("board-placeholder");
        this.player_indicator_element = document.getElementById("player-indicator");
        this.opponent_message_element = document.getElementById("opponent-message");

        if (!this.board_element) {
            console.error("Error: board-placeholder element not found!");
        }
        if (!this.player_indicator_element) {
            console.error("Error: player-indicator element not found!");
        }
    }

    // 画面更新関数
    reflectGameState(game) {
        this.updateInfoText(`${num2PlayerColor(game.currentPlayer)}のターンです.`);
        this.updateBoardView(game);
    }

    updateOpponentMessage(text) {
        this.opponent_message_element.innerText = text;
    }

    updateInfoText(text) {
        this.player_indicator_element.innerText = text;
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
                cell.className = CSS_CLASS_CELL;
                if (game.canPlaceStone(idx_row, idx_col, game.currentPlayer)) {
                    if (game.currentPlayer === PLAYER1) {
                        let stone = document.createElement("div");
                        stone.className += ` ${CSS_CLASS_PLAYER1_PLACEABLE}`;
                        stone.addEventListener("click", runOneTurn);
                        cell.appendChild(stone);
                    }
                    else if (game.currentPlayer === PLAYER2) {
                        let stone = document.createElement("div");
                        stone.className += ` ${CSS_CLASS_PLAYER2_PLACEABLE}`;
                        stone.addEventListener("click", runOneTurn);
                        cell.appendChild(stone);
                    }
                }
                // let stone = document.createElement("div");
                if (game.table[idx_row][idx_col] === PLAYER1) {
                    let stone = document.createElement("div");
                    stone.className += ` ${CSS_CLASS_PLAYER1_STONE}`;
                    cell.appendChild(stone);
                }
                else if (game.table[idx_row][idx_col] === PLAYER2) {
                    let stone = document.createElement("div");
                    stone.className += ` ${CSS_CLASS_PLAYER2_STONE}`;
                    cell.appendChild(stone);
                }
                row.appendChild(cell);
            }
            tblBody.appendChild(row);
        }

        new_table_element.appendChild(tblBody);
        this.board_element.appendChild(new_table_element);

        // 4隅と中心の間の中点を4点描画する.
        this.drawMidpoints();
    }

    drawMidpoints() {
        const board = document.querySelectorAll(".cell");
        console.log("CALL drawMidpoints");
        console.log(board.className);

        // 中点を追加するセルの位置
        const midpoints = [
            { row: 2, col: 2 },
            { row: 2, col: 6 },
            { row: 6, col: 2 },
            { row: 6, col: 6 },
        ];

        midpoints.forEach(({ row, col }) => {
            const index = row * BOARD_WIDTH + col;  // 1次元インデックスに変換
            board[index].classList.add("midpoint");
        });
    }
}

// オセロの 1 ターンを進める
const runOneTurn = (event) => {
    console.log("PLAY");

    const stone = event.target;
    // 石が既に置いてある場合には置かない.
    if (
        stone.className.includes(CSS_CLASS_PLAYER1_STONE)
        ||
        stone.className.includes(CSS_CLASS_PLAYER2_STONE)
    ) {
        console.log("そこには置けないよ.");
        return;
    }
    // 配置可能でない場合には置かない.
    if (
        gameController.currentPlayer === PLAYER1
        &&
        !stone.className.includes(CSS_CLASS_PLAYER1_PLACEABLE)
    ) {
        console.log("そこには置けないよ.");
        return;
    }
    if (
        gameController.currentPlayer === PLAYER2
        &&
        !stone.className.includes(CSS_CLASS_PLAYER2_PLACEABLE)
    ) {
        console.log("そこには置けないよ.");
        return;
    }
    // クリックされた座標を取得する.
    const row = stone.parentNode.parentNode.rowIndex;
    const col = stone.parentNode.cellIndex;
    console.log(`Clicked cell at row: ${row}, col: ${col}`);

    // 1ターン進める
    proceedGame(row, col);
}


// オセロの 1 ターンを CPU が進める
const runCpuOneTurn = () => {
    console.log("CPU PLAY");

    // CPU が打てる手の候補をリストアップする
    const candidates = [];
    for (let idx_row = 0; idx_row < BOARD_WIDTH; idx_row++) {
        for (let idx_col = 0; idx_col < BOARD_WIDTH; idx_col++) {
            if (!gameController.canPlaceStone(idx_row, idx_col, PLAYER2)) {
                continue;
            }
            candidates.push({
                y: idx_col,
                x: idx_row,
            });
        }
    }
    console.log("candidates");
    console.log(candidates);

    // LLM が配置不能な位置を出してきたときのために位置をランダムに決めておく.
    const idx = Math.floor(Math.random() * candidates.length);
    let row = candidates[idx].x;
    let col = candidates[idx].y;

    console.log("ARRAY")
    console.log(arrayToString(gameController.table, indent=2));

    const runLlmPromise = callLlm(
        current_board_state=`
        今の盤面は以下の通りです。
            1が黒(相手)で、2が白(あなた)です。
            あなたは2(白)が勝つように手を打ってください。
            \n${arrayToString(gameController.table)}
        `,
        stone_position_candidates=candidates,
        personality="ずんだもん 語尾が「のだ」",
        language="ja",
        )
    runLlmPromise.then(llmResponse => {
        console.log("llmResponse");
        console.log(llmResponse);
        // LLM が配置可能な位置を出してきたときはその位置に上書きする.
        if (gameController.canPlaceStone(
            llmResponse.selected_stone_position.x,
            llmResponse.selected_stone_position.y,
            PLAYER2,
        )) {
            row = llmResponse.selected_stone_position.x;
            col = llmResponse.selected_stone_position.y;
        }
        // キャラクター台詞を書く.
        gameScreen.updateOpponentMessage(llmResponse.words_from_charactor);

        // 1ターン進める
        proceedGame(row, col);
    }).catch(error => {
        console.error(error);
        // キャラクター台詞を書く.
        gameScreen.updateOpponentMessage("難しい局面だ...");
        // エラーが出たらランダムに決めた候補値が選ばれる.
        // 1ターン進める
        proceedGame(row, col)
    });
}

function arrayToString(array, indent = 0) {
    if (!Array.isArray(array)) {
        throw new Error("Input must be a 2D array.");
    }
    const indentStr = ' '.repeat(indent);
    return '[' + array.map(row => {
        if (!Array.isArray(row)) {
            throw new Error("Each element must be an array.");
        }
        return indentStr + '\n  [' + row.map(String).join(', ') + ']';
    }).join(',') + '' + indentStr + ']';
}

function proceedGame(row, col) {
    // 1ターン進める
    gameController.runOneTurn(row, col);

    // 画面を更新する
    gameScreen.reflectGameState(gameController);
    console.log(gameController.table);

    // ゲーム終了判定をする
    // 終了したら勝利者を表示する
    console.log("isGameOver: ", gameController.isGameOver());
    if (gameController.isGameOver()) {
        const winner = gameController.checkWinner();
        if (winner === PLAYER1 || winner === PLAYER2) {
            gameScreen.updateInfoText(`${num2PlayerColor(winner)}の勝ちです.`);
        } else if (winner === 0) {
            gameScreen.updateInfoText(`引き分けです.`);
        } else {
            throw new Error(`Found unexpected value in ${winner}.`);
        }
    } else if (gameController.currentPlayer === PLAYER2) {
        runCpuOneTurn();
    }
}

function callLlm(
    current_board_state,
    stone_position_candidates,
    personality,
    language,
) {
    // const apiUrl = "http://localhost:8000";
    const apiUrl = "https://simple-othello-api.vercel.app";
    console.log("apiUrl");
    console.log(apiUrl);
    const apiPath = "/api/make-llm-choice-next-position"
    return fetch(`${apiUrl}${apiPath}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: "cors",  // これが重要！
        body: JSON.stringify({
            current_board_state: current_board_state,
            stone_position_candidates: stone_position_candidates,
            personality: personality,
            language: language,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            return data;
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

const createBoard = () => {
    console.log("createBoard");

    // 新しいゲームを開始
    gameController = new OthelloGame(JSON.parse(JSON.stringify(INIT_BOARD)));
    gameScreen = new OthelloScreen();

    // ボードを表示
    gameScreen.reflectGameState(gameController);
}
