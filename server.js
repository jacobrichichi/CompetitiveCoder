const config = require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require('path');

const app = express();


const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");


const io = socketIO(server, {
	cors: {
		origin: "http://competitivecoder.com",
		methods: ["GET","POST"]
	}
});

var rooms = 0;
var namesToLobbies = [];

var compList = [];
var socketsToRooms = [];

const users = require("./routes/api/users");

// Cors middleware
app.use(cors({
	origin: 'http://competitivecoder.com'
}));
app.use(express.json());


//Added
//End added


// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);


app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) =>
        res.sendFile(path.join(__dirname, "client/build", "index.html"))
);

const port = process.env.PORT || 5000; 

io.on('connection', function(socket){
  socket.on("getLobbies", () =>{
    var lobbies = [];
    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    const users = Array.from(io.sockets.adapter.rooms.values());

    for(var i = 0; i<rooms.length; i++){
      try{
      if(rooms[i].substring(0, 4)==="room"){
        if(users[i].size===1){
          lobbies.push({
            room: rooms[i],
            user: users[i].values().next().value
          });
        }
      }
    }

    catch(err){
      console.log(err.message);
    }
    }
    socket.emit("lobbies", lobbies);
    socket.emit('namesToLobbies', namesToLobbies);
  });

  socket.on('checkChallengeStatus', function(data){
    const it = socket.rooms.values();
    var user = it.next().value;
    var room = it.next().value

    socket.emit('returnCorrectChallengeID', {ID: room.split('/')[1]});
  })

  socket.on('createGame', function(data){


    socket.join('room-' + ++rooms + "/" + data.ID);
    socket.emit('newGame', {name: data.name, room: 'room-'+(rooms)+'/'+data.ID });
    namesToLobbies.push({name: data.name, rank: data.rank});
  });

  socket.on("isRoomFull", function(data){

    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    const users = Array.from(io.sockets.adapter.rooms.values());



    for(var i = 0; i<rooms.length; i++){
      try{
      if(rooms[i]===data.room){
        
        if(users[i].size===1){
          socket.emit('roomIsNotFull');
        }
        else{
          socket.emit('roomIsFull');
        }
        break;
      }
    }

    catch(err){
      console.log(err.message);
    }
    }

  });

  

  socket.on('gameJoin', function(data){

    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    const users = Array.from(io.sockets.adapter.rooms.values());
    try{

    for(var i = 0; i<rooms.length; i++){
      
      if(rooms[i]===data.room){

        
        if(users[i].size===1){
          socket.join(data.room);
         // socket.broadcast.to(data.room).emit("startGame");
          socket.emit('isJoinSuccessful', { success: true });
        }
        else{
          socket.emit('isJoinSuccessful', { success: false});
        }
        break;
      }
      if(i===rooms.length-1){
        socket.emit('isJoinSuccessful', {success: false});
      }
    }

    }
    catch(err){
      console.log(err.message);
    }
  });
  
  socket.on('joinerReady', function(data){
    socket.broadcast.to(data.room).emit('joinerReady', {room: data.room });
  })

  socket.on('beginGame', function(data){
   /* console.log('beginGame');
    console.log(data.room);
    console.log(io.sockets.adapter.rooms);*/
    socket.broadcast.to(data.room).emit('creatorReady');
  })

  socket.on('checkRoom', function(){
    //console.log(io.sockets.adapter.rooms);
  });

  socket.on('checkInNoGood', function(data){

    socket.broadcast.to(data.room).emit('createrDidntCheckIn');
    socket.leave(data.room);
  })

  socket.on('leaveAsCreatorDidntCheck', function(data){
    socket.leave(data.room);
  })

  socket.on('intervalUpdate', function(data){
    socket.broadcast.to(data.room).emit('intervalUpdate', { numCorrect: data.numCorrect, runTime: data.runTime, memory: data.memory})
  }) 

  socket.on('rejoinGame', function(data){
    if(socket.rooms.size===1){

      socket.join(data.room);
    }
  });

  socket.on('myChallengeInfo', function(data){
    console.log('mCI');
    console.log(data);

    socket.broadcast.to(data.room).emit('opponentsChallengeInfo', {
      oppNumCorrect: data.numCorrect,
      oppRunTime: data.runTime,
      oppMemory: data.memory,
      oppCorrect: data.correct
    });
  });

  socket.on('endGame', function(data){

    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    const users = Array.from(io.sockets.adapter.rooms.values());

    var i = 0;
    var j = 0;
    var sock;
    var lobbyUsers;
    var user;

    socket.leave(data.room);


    while(i<rooms.length){    //remove username from namesToLobbies array since lobby is being destroyed
      try{
        if(rooms[i].substring(0, 4)==="room"){
          if(rooms[i]===data.room){
            namesToLobbies.splice(j, 1);


            lobbyUsers = users[i].values();
            user = lobbyUsers.next().value;
            while(user){
              io.to(user).emit('leaveGame', {room: data.room});
              user = lobbyUsers.next().value;
            }
           
            break;
          }
          else{
            j++;
          }

        }
        i++;
    }
    catch(err){
      console.log(err);
    }
  }

  socket.broadcast.to(data.room).emit('gameEnd');

  //  console.log(namesToLobbies);

   // socket.leave(data.room);
  });

  socket.on('leaveGame', function(data){
    socket.leave(data.room);
  })

  socket.on("joinGameAfterCreateGame", function(data){
    const rooms = Array.from(io.sockets.adapter.rooms.keys());
   // console.log(rooms);

    //console.log(namesToLobbies);

    var i = 0;
    var j = 0;

    while(i<rooms.length){    //remove username from namesToLobbies array since lobby is being destroyed
      try{
        if(rooms[i].substring(0, 4)==="room"){
          //console.log(rooms[i])
          if(rooms[i]===data.room){
            namesToLobbies.splice(j, 1);
            break;
          }
          else{
            j++;
          }

        }
        i++;
    }
    catch(err){
      console.log(err);
    }
  }

  socket.leave(data.room);
  })

  socket.on('opponentLeft', function(data){
   /* const it = socket.rooms.values();
    var user = it.next().value;
    var room = it.next().value*/


  /*  console.log(data.room);

    console.log(Array.from(io.sockets.adapter.rooms.keys()));*/

    socket.leave(data.room);


    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    const users = Array.from(io.sockets.adapter.rooms.values());



    for(var i = 0; i<rooms.length; i++){
      try{
      if(rooms[i]===data.room){
        
        if(users[i].size>0){
          var sock;
          for(var j = 0; j<users[i].size; j++){
           // console.log('users');
          //  console.log(users[i]);
            sock = users[i][j];
          //  console.log('clear those rats');
           // console.log(sock);
            sock.leave(data.room);
          }
        }
        break;
      }
    }

    catch(err){
      console.log(err.message);
    }
    }

    //console.log(Array.from(io.sockets.adapter.rooms.keys()));
  });

  socket.on("compQueue", function(data){
    console.log('compQueue');
    compList.push({name: data.name, rank: data.rank, time: data.time, socket: socket});  
  });

  socket.on("checkPriorityQueue", function(data){
    var currTime = new Date().getTime()/1000;
    console.log(Array.from(io.sockets.adapter.rooms.keys()));
    console.log(Array.from(io.sockets.adapter.rooms.values()));
    var i = 0;
    while(i<compList.length){
      /*console.log(compList[i].name);
      console.log(compList[i].time);
      console.log(compList[i].rank);

      console.log(data.name);
      console.log(data.time);
      console.log(data.rank);

      console.log(currTime);
      console.log('--------------------------------');*/


      if(compList[i].name === data.name){
        console.log('samesies');
        i++;
        continue;
      }
      console.log(Math.abs(((compList[i].time- currTime) + (data.time-currTime))/Math.abs(compList[i].rank-data.rank)));
      
      if(compList[i].socket.disconnected){
        compList.splice(i,1);
        continue;
      }

      if(Math.abs(((compList[i].time - currTime) + (data.time- currTime))/Math.abs(compList[i].rank-data.rank))>=0.5){  //priority queue equation, possibly factor in frony of person calling this function, and their position in the queue?
        console.log('found');
        socket.emit("foundPerson", { index: i });
        
        break;
      }
      i++;
    }
  });

  socket.on("queueCreateLobby", function(data){

    //const users = Array.from(io.sockets.adapter.rooms.keys());
    //const sockets = Array.from(io.sockets.adapter.rooms.values());
    console.log('createLobby');

    try{
      var theirSocket = compList[data.index].socket;
      const room = 'room-' + ++rooms + "/" + data.challengeID;


      theirSocket.emit("personFoundYou");

      socket.join(room);
      theirSocket.join(room);


      socket.emit("compRoomCreated", { room: room, challengeID: data.challengeID});
      socket.broadcast.to(room).emit("compRoomCreated", { room: room, challengeID: data.challengeID });
      
      compList.splice(data.index, 1);
      for(var j = 0; j<compList.length; j++){    //they have found a match, so remove them from the queue
        if(compList[j].name===data.name){
          compList.splice(j, 1);
        }
      }
      console.log(compList)
  }
  catch(err){

  }
  });

  socket.on("getNumberOfPeopleQueuing", function(){
    socket.emit("numberOfPeopleQueuing", { num: compList.length });
  })

  socket.on('compCheckedIn', function(data){
    console.log(data.room)
    socket.broadcast.to(data.room).emit('opponentCheckedIn');
  })

  socket.on('endCompSearch', function(data){
    console.log("endCompSearch");
    console.log(data.name)
    for(var i = 0; i<compList.length; i++){
      if(compList[i].name===data.name){
        compList.splice(i, 1);
        break;
      }
      console.log(compList);

    }
  })


});


server.listen(port, () => console.log(`Server up and running on port ${port} !`));
