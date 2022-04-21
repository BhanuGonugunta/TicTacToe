var express = require('express');
var http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
var cors = require('cors')

//express
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());

var corsOptions = {
    origin: 'http://otickytackyx.herokuapp.com/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.get('/', cors(corsOptions), (req, res) => {
    res.render('index');
});

var users = {};
var userCount = 0;
var rooms = io.sockets.adapter.rooms;

var availableUsers = {};


io.on("connection", (socket) => {

    users[socket.id.substring(0,5)] = socket.id;

    availableUsers[socket.id.substring(0,5)] = true;
    userCount += 1;

    // console.log(users);
    console.log(availableUsers);

    socket.emit("secondTurn");

    socket.on("connectToUser", (pid) => {
        if(availableUsers[pid]){
            socket.emit('getPartnerName', users[pid]);
            socket.to(users[pid]).emit('getPartnerName', socket.id);

            socket.emit('displayMsg', `connected to <strong>${pid}</strong>`);
            socket.to(users[pid]).emit('displayMsg', `connected to <strong>${socket.id.substring(0,5)}</strong>`);

            socket.emit("yourSymbol", "X");
            socket.to(users[pid]).emit("yourSymbol", "O");

            //telling second user that it's not his/her turn.
            socket.to(users[pid]).emit("secondTurn");
            
            availableUsers[socket.id.substring(0,5)] = false;
            availableUsers[pid] = false;

            console.log(availableUsers);
        }
        else{
            socket.emit('displayMsg', "user is in another game");
        }

    });

    socket.on("clickLocation", (pid, row, col, sym) => {
        // console.log(`${socket.id}:, ${row}, ${col}, ${sym}`);
        socket.to(pid).emit("updateLocation", row, col, sym);
    });

    socket.on("userDisconnected", (pid) => {
        socket.to(pid).emit("displayMsg",'user has disconnected.');
    });

    socket.on("nextTurn", (pid) => {
        socket.to(pid).emit("myTurn", socket.id);
    });

    socket.on("sendResultsToServer", (pid, c) => {
        socket.to(pid).emit("displayResults", c);
    });

    socket.on("drawMatch", () => {
        console.log("draw match");
    });

    socket.on('newGame', (pid, sym) => {
        socket.to(pid).emit('clearBoard');
        if(sym == 'X'){
            socket.to(pid).emit("secondTurn")
        }
        else{
            socket.emit("secondTurn");
        }
    });

    socket.on("setRandomGame", (pid) => {
        var noUsers = true;
        availableUsers[socket.id.substring(0,5)] = true;
        // console.log(availableUsers);

        socket.to(pid).emit("removePartnerName");

        for (var key in availableUsers) {
            console.log(key);
            if (key != socket.id.substring(0,5) && availableUsers[key]) {
                socket.emit("setNewUser",key);
                console.log(socket+" requested to connect with "+key);
                noUsers = false;
                break;
            }
        }

        if(noUsers){
            socket.emit("displayMsg",'no free users.');
        }

    })

    socket.on("disconnect", () => {
        console.log("user disconnected : ",socket.id);
        delete users[socket.id.substring(0,5)];
        delete availableUsers[socket.id.substring(0,5)];
    });
});

server.listen(process.env.PORT || 8080);
