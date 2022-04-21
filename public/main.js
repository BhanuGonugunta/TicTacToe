// import { io } from "../node_modules/socket.io-client";

const container = document.getElementById("gameContainer");
const squareArray = [[], [], []];
let symbol = "";

const playAgainButton = document.getElementById("playAgainButton");
const connectButton = document.getElementById("connectButton");
const playRandomButton = document.getElementById("playRandomButton");

var pid;

var canClick = true;

//server functions
const socket = io("http://localhost:8080");
socket.on('connect', () => {
    document.getElementById('yourID').innerHTML = 'Your ID: '+socket.id.substring(0,5);
});

socket.on('getPartnerName', (p) => {
    pid = p;
})

socket.on("removePartnerName", () => {
    pid = null;
})

socket.on('displayMsg', (msg) => {
    displayMessage(msg);
});

socket.on("yourSymbol", (sym) => {
    displayMessage(`your symbol : <strong>${sym}</strong>`);
    symbol = sym;
});

function sendData(row, col) {
    socket.emit("clickLocation", pid, row, col, symbol);
}

socket.on("updateLocation", (row, col, sym) => {
    squareArray[row][col].clicked(row, col, sym);
});

socket.on('clearBoard', () => {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const element = squareArray[i][j].element;
            element.classList.add("notClicked");

            squareArray[i][j].state = '';

            element.querySelector("p").innerHTML = squareArray[i][j].state;

            element.querySelector("p").classList.remove('p1', 'p2');

        }   
    }

    document.getElementById("winner").innerHTML = '';
    document.getElementById("gameOver").style.display = "none";

    console.log(squareArray);

    // socket.emit('nextTurn', pid);
});

socket.on("reNewPage", () => {
    location.reload();
});

socket.on("myTurn", (id) => {
    // displayMessage(`Its ur turn..!!!..`);

    // var alert = document.querySelector('alert');
    // alert.style.display = "block";

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const element = squareArray[i][j].element;
            if(squareArray[i][j].state === ""){
                element.classList.add("notClicked");
            }
        }   
    }
    canClick = true;
});

//telling second user that it's not his/her turn.
socket.on("secondTurn", () => {
    changeTurn();
});

socket.on("displayResults", (c) => {
    if(symbol == c){
        gameOver("You Won...!!!");
    }
    else{
        gameOver("Better luck next time...");
    }
});

socket.on("setNewUser", (p) => {
    socket.emit("connectToUser", p);
    if (partnerID === "") return
});

//client side functions
playAgainButton.onclick = function() {
    // socket.emit("userDisconnected", pid);
    // location.reload();

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const element = squareArray[i][j].element;
            element.classList.add("notClicked");

            squareArray[i][j].state = '';

            element.querySelector("p").innerHTML = squareArray[i][j].state;

            element.querySelector("p").classList.remove('p1', 'p2');
        }   
    }

    document.getElementById("winner").innerHTML = '';
    document.getElementById("gameOver").style.display = "none";

    console.log(squareArray);

    socket.emit('newGame', pid, symbol);
}

playRandomButton.addEventListener("click", e => {
    socket.emit("userDisconnected", pid);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const element = squareArray[i][j].element;
            element.classList.add("notClicked");

            squareArray[i][j].state = '';

            element.querySelector("p").innerHTML = squareArray[i][j].state;

            element.querySelector("p").classList.remove('p1', 'p2');
        }   
    }

    document.getElementById("winner").innerHTML = '';
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("details").innerHTML = '';

    socket.emit("setRandomGame", pid);
});

connectButton.addEventListener("click", e => {
    e.preventDefault();

    const partnerID = document.getElementById("partnerID").value;

    socket.emit("connectToUser", partnerID);
    if (partnerID === "") return
});

function changeTurn(){
    canClick = false;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const element = squareArray[i][j].element;
            if(squareArray[i][j].state === ""){
                element.classList.remove("notClicked");
            }
        }   
    }
    socket.emit("nextTurn", pid);
}

function gameOver(message) {
    document.getElementById("winner").innerHTML = message;
    document.getElementById("gameOver").style.display = "block";

    canClick = false;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const element = squareArray[i][j].element;
            element.classList.remove("notClicked");
        }   
    }
}

function isDraw() {
    let shouldReturn = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if(squareArray[i][j].state == "") shouldReturn = false;
        }
    }
    return shouldReturn;
}

function wonGame() {
    // for rows
    let r1 = squareArray[0][0].state + squareArray[0][1].state + squareArray[0][2].state;
    let r2 = squareArray[1][0].state + squareArray[1][1].state + squareArray[1][2].state;
    let r3 = squareArray[2][0].state + squareArray[2][1].state + squareArray[2][2].state;

    //cols
    let c1 = squareArray[0][0].state + squareArray[1][0].state + squareArray[2][0].state;
    let c2 = squareArray[0][1].state + squareArray[1][1].state + squareArray[2][1].state;
    let c3 = squareArray[0][2].state + squareArray[1][2].state + squareArray[2][2].state;

    //diags
    let d1 = squareArray[0][0].state + squareArray[1][1].state + squareArray[2][2].state;
    let d2 = squareArray[0][2].state + squareArray[1][1].state + squareArray[2][0].state;

    if(
        r1 === "XXX" || r1 === "OOO" ||
        r2 === "XXX" || r2 === "OOO" ||
        r3 === "XXX" || r3 === "OOO"
    ){
        return true;
    }

    if(
        c1 === "XXX" || c1 === "OOO" ||
        c2 === "XXX" || c2 === "OOO" ||
        c3 === "XXX" || c3 === "OOO"
    ){
        return true;
    }

    if(
        d1 === "XXX" || d1 === "OOO" ||
        d2 === "XXX" || d2 === "OOO"
    ){
        return true;
    }

    return false;
}

class ClassSquare {
    constructor(element, row, col){
        this.element = element;
        this.state = "";
    }
    clicked(r, c, s){
        const div = squareArray[r][c];
        div.state = s;
        div.element.classList.remove("notClicked");
        div.element.onclick = function () {
            return false;
        }
        div.element.querySelector("p").innerHTML = div.state;

        if(div.state == "X"){
            div.element.querySelector("p").classList.add("p1");
        }
        if(div.state == "O"){
            div.element.querySelector("p").classList.add("p2");
        }

        if(wonGame()) {
            socket.emit("sendResultsToServer", pid, div.state);
        }
        if(isDraw()) {
            socket.emit("drawMatch");
            return gameOver("It is a draw"); 
        }
    }
}

for (let i = 0; i < 3; i++) {

    const row = document.createElement("div");
    row.classList.add("row", "justify-content-center");

    for (let j = 0; j < 3; j++) {
        const div = document.createElement("div");
        div.classList.add("square", "notClicked", "col");
        const square = new ClassSquare(div, i, j);
    
        const  p = document.createElement("p");
        div.appendChild(p);
        p.classList.add("display-1", "text-center");

        row.appendChild(div);

        squareArray[i].push(square);
    }

    container.appendChild(row);
}

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        updateBoard(i, j);
    }
}

function updateBoard(i, j) {
    const div = squareArray[i][j].element;

    div.addEventListener("click", e => {
        if( canClick && squareArray[i][j].state === ""){
            sendData(i,j);
            squareArray[i][j].clicked(i, j, symbol);
            changeTurn();
        }
    });
}

function displayMessage(params) {
    const details = document.getElementById('details');

    const p = document.createElement('p');
    p.innerHTML = params;

    p.classList.add('col-sm-4');

    details.appendChild(p);
}

console.log(squareArray);