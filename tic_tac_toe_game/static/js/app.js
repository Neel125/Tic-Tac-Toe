
let roomCode = document.getElementById("game_board").getAttribute("room_code");
let charChoice = document.getElementById("game_board").getAttribute("char_choice");

let connectionString = "ws://" + window.location.host + "/ws/play/" + roomCode + "/";
let gameSocket = new WebSocket(connectionString);
let gameBoard = [
    -1, -1, -1,
    -1, -1, -1,
    -1, -1, -1,
];

let winIndices = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

let moveCount = 0;
let myTurn = true;


let elementArray = document.getElementsByClassName("square");
for (var i = 0; i < elementArray.length; i++){
    elementArray[i].addEventListener("click", event=>{
        const index = event.path[0].getAttribute("data-index");
        if (gameBoard[index] === -1){
            if (!myTurn){
                alert("Wait for other to place move")
            }
            else {
                myTurn = false;
                document.getElementById("alert_move").style.display = 'none';
                makeMove(index, charChoice);
            }
        }
    })
}

let makeMove = (index, player) => {
    index = parseInt(index);
    let data = {
        "event": "MOVE",
        "message": {
            "index": index,
            "player": player
        }
    }

    if(gameBoard[index] === -1){
        moveCount++;
        if(player === 'X')
            gameBoard[index] = 1;
        else if(player === 'O')
            gameBoard[index] = 0;
        else{
            alert("Invalid character choice");
            return false;
        }
        gameSocket.send(JSON.stringify(data))
    }

    elementArray[index].innerHTML = player;
    const win = checkWinner();
    if(myTurn){
        if(win){
            data = {
                "event": "END",
                "message": `${player} is a winner. Play again?`
            }
            gameSocket.send(JSON.stringify(data))
        }
        else if(!win && moveCount === 9){
            data = {
                "event": "END",
                "message": "It's a draw. Play again?"
            }
            gameSocket.send(JSON.stringify(data))
        }
    }
}

let checkWinner = () => {
    let win = false;
    if (moveCount >= 5){
        winIndices.forEach((w) => {
            if (check(w)){
                win = true;
                windex = w; 
            }
        });
    }
    return win;
}

const check = (winIndex) => {
    return gameBoard[winIndex[0]] !== -1 &&
        gameBoard[winIndex[0]] === gameBoard[winIndex[1]] &&
        gameBoard[winIndex[0]] === gameBoard[winIndex[2]];
}

let reset = () => {
    gameBoard = [
        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,
    ];
    moveCount = 0;
    myTurn = true;
    document.getElementById("alert_move").style.display = 'inline';
    for (var i = 0; i < elementArray.length; i++){
        elementArray[i].innerHTML = "";
    }
}


let connect = () => {
    gameSocket.onopen = function open(){
        console.log("WebSocet connection created");
        gameSocket.send(JSON.stringify({
            "event": "START",
            "message": ""
        }));
    }

    gameSocket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function () {
            connect();
        }, 1000);
    };

    // Sending the info about the room
    gameSocket.onmessage = function (e) {
        let data = JSON.parse(e.data);
        data = data["payload"];
        let message = data['message'];
        let event = data["event"];
        switch (event) {
            case "START":
                reset();
                break;
            case "END":
                alert(message);
                reset();
                break;
            case "MOVE":
                if(message["player"] !== charChoice){
                    makeMove(message["index"], message["player"])
                    myTurn = true;
                    document.getElementById("alert_move").style.display = 'inline';
                }
                break;
            default:
                console.log("No event")
        }
    };

    if (gameSocket.readyState === WebSocket.OPEN) {
        gameSocket.onopen();
    }
}

connect();
