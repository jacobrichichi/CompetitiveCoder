import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser, endCoolDown, setIsCompetitive  } from "../../actions/authActions";
import { Link } from "react-router-dom";
import socket from "../../socket";
import { challengeUser, setCurrentRoom, removeChallenge, removeRoom } from "../../actions/challengeActions";
import "./Dashboard.css";
import CheckInTimer from "./CheckInTimer";
import CompTimer from "./CompTimer";
import {Button, Modal, Col, Alert, Card} from "react-bootstrap";
import BarLoader from "react-spinners/ClipLoader";



class Dashboard extends Component {

  constructor(props){
    super(props);

    console.log('redirected');

    this.state ={
        lobbies: [],
        namesToLobbies: [],
        isGameReady: false,
        isLobbyCreated: false,
        lobby: '',
        showCreate: false,
        showCheckIn: false,
        showJoinGame: false,
        showCreaterDidntConfirm: false,
        showGameFull: false,
        showCoolDownWait: false,
        showConfirmComp: false,
        showIsQueued: false,
        userRank: '',
        queueTime: 0.0,
        queueInterval: {},
        isQueued: false,
        isOpponentCheckedIn: false,
        isCheckedIn: false

    };

    if(this.props.isChallenge){
      console.log('isChallenge');
      this.props.removeChallenge();
    }
    if(this.props.isRoom){
      console.log('isRoom');
      this.props.removeRoom();
    }


}



componentWillReceiveProps(nextProps) {
  if (nextProps.auth.isChallenge && nextProps.auth.isRoom && this.state.isGameReady) {
    this.props.history.push("/challengePage"); // push user to challengepage when challenge is ready
  }
  /*if (nextProps.errors) {
    this.setState({
      errors: nextProps.errors
    });
  }*/
}

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };



  getData = rooms => {
    this.setState({lobbies: rooms});
  }

  changeLobbies = () => socket.emit("getLobbies");

  getNamesToLobbies = namesToLobbies => {
    this.setState({namesToLobbies: namesToLobbies});
  }


  getGames = event => {
    console.log(socket);


    socket.emit("getLobbies");
    socket.on("lobbies", this.getData);
    socket.on('namesToLobbies', this.getNamesToLobbies);

    var row;
    var button;
    var room;
    var userName;
    var rank;

    var buttonCell;
    var roomCell;
    var userCell;
    var rankCell;

    var table = document.getElementById("lobbyTable");
    table.style = "border: 1px solid black; padding: 10px;";
    table.textContent = '';

    row = table.insertRow(-1);

    row.height = "30px";

    roomCell = row.insertCell(-1);
    userCell = row.insertCell(-1);
    rankCell = row.insertCell(-1);
    buttonCell = row.insertCell(-1);

    button = document.createElement('text');
    room = document.createElement('text');
    userName = document.createElement('text');
    rank = document.createElement('text');

    button.type = 'text';
    room.type = 'text';
    userName.type = 'text';
    rank.type = 'text';

    button.style = "font-size: 25px;";
    room.style = "font-size: 25px;";
    userName.style = "font-size: 25px;";
    rank.style = "font-size: 25px;";

    room.textContent = "Lobby Name";
    userName.textContent = "Username";
    rank.textContent = "Rank";
    button.textContent = "Click to Join";

    buttonCell.appendChild(button);
    roomCell.appendChild(room);
    userCell.appendChild(userName);
    rankCell.appendChild(rank);

    var max = 0;

    if(this.state.lobbies.length <10){
      max = this.state.lobbies.length;
    }

    else{
      max = 10;
    }

    for(var i = 0; i<max; i++){


      row = table.insertRow(-1);

      row.height = "30px";

      roomCell = row.insertCell(-1);
      userCell = row.insertCell(-1);
      rankCell = row.insertCell(-1);
      buttonCell = row.insertCell(-1);


      button = document.createElement('button');
      room = document.createElement('text');
      userName = document.createElement('text');
      rank = document.createElement('text');

      button.type = 'button';
      room.type = 'text';
      userName.type = 'text';
      rank.type = 'text';

      button.className = "btn blue darken-3 waves-effect waves-light";
      room.style = "font-size: 20px;";
      userName.style = "font-size: 20px";
      rank.style = "font-size: 20px";

      room.textContent = this.state.lobbies[i].room.split("/")[0];

      try{
      userName.textContent = this.state.namesToLobbies[i].name;
      rank.textContent = this.getRank(this.state.namesToLobbies[i].rank);
      }
      catch(err){
        userName.textContent = 'Refresh to view';
        rank.textContent = 'Refresh to view';
      }
      button.textContent = "Join";

      button.value = this.state.lobbies[i].room;
      button.onclick = this.joinGame;

      if(this.state.isLobbyCreated || this.state.lobbies[i].user===socket.id){
        button.disabled = true;
      }

      buttonCell.appendChild(button);
      roomCell.appendChild(room);
      userCell.appendChild(userName);
      rankCell.appendChild(rank);

    }

    var pageButtons = document.getElementById("pageButtons");
    pageButtons.textContent = '';
    row = pageButtons.insertRow(-1);

    var i = 0;
    while(i*10<this.state.lobbies.length){
      buttonCell = row.insertCell(-1);
      button = document.createElement('button');
      buttonCell.width = "20px";
      button.type = 'button';
      button.textContent = i+1;
      button.value = i + 1;
      buttonCell.onclick = this.getPageOfLobbies;
      buttonCell.appendChild(button);
      i++;
      
    }



  }

  getPageOfLobbies = event => {

    var page = event.target.value;

    var row;
    var button;
    var room;
    var userName;
    var rank;

    var buttonCell;
    var roomCell;
    var userCell;
    var rankCell;

    var table = document.getElementById("lobbyTable");
    table.style = "border: 1px solid black; padding: 10px;";
    table.textContent = '';


    row = table.insertRow(-1);
    row.height = "5vh";

    roomCell = row.insertCell(-1);
    userCell = row.insertCell(-1);
    rankCell = row.insertCell(-1);
    buttonCell = row.insertCell(-1);

    button = document.createElement('text');
    room = document.createElement('text');
    userName = document.createElement('text');
    rank = document.createElement('text');

    button.type = 'text';
    room.type = 'text';
    userName.type = 'text';
    rank.type = 'text';

    button.style = "font-size: 25px;";
    room.style = "font-size: 25px;";
    userName.style = "font-size: 25px;";
    rank.style = "font-size: 25px;";

    room.textContent = "Lobby Name";
    userName.textContent = "Username";
    rank.textContent = "Rank";
    button.textContent = "Click to Join";

    buttonCell.appendChild(button);
    roomCell.appendChild(room);
    userCell.appendChild(userName);
    rankCell.appendChild(rank);

    var max = 0;

    if(this.state.lobbies.length < 10 * page){
      max = this.state.lobbies.length;
    }

    else{
      max = 10 * page;
    }

    for(var i = (page-1) * 10; i<max; i++){

      row = table.insertRow(-1);
      roomCell = row.insertCell(-1);
      userCell = row.insertCell(-1);
      rankCell = row.insertCell(-1);
      buttonCell = row.insertCell(-1);


      button = document.createElement('button');
      room = document.createElement('text');
      userName = document.createElement('text');
      rank = document.createElement('text');

      button.type = 'button';
      room.type = 'text';
      userName.type = 'text';
      rank.type = 'text';

      button.className = "btn blue darken-3 waves-effect waves-light";
      room.style = "font-size: 20px;";
      userName.style = "font-size: 20px";
      rank.style = "font-size: 20px";

      room.textContent = this.state.lobbies[i].room.split("/")[0];

      try{
      userName.textContent = this.state.namesToLobbies[i].name;
      rank.textContent = this.getRank(this.state.namesToLobbies[i].rank);
      }
      catch(err){
        userName.textContent = 'Refresh to view';
        rank.textContent = 'Refresh to view';
      }
      button.textContent = "Join";

      button.value = this.state.lobbies[i].room;
      button.onclick = this.joinGame;

      if(this.state.lobbies[i].user===socket.id){
        button.disabled = true;
      }

      buttonCell.appendChild(button);
      roomCell.appendChild(room);
      userCell.appendChild(userName);
      rankCell.appendChild(rank);

    }

    var pageButtons = document.getElementById("pageButtons");
    pageButtons.textContent = '';
    row = pageButtons.insertRow(-1);

    var i = 0;
    while(i*10<this.state.lobbies.length){
      buttonCell = row.insertCell(-1);
      button = document.createElement('button');
      buttonCell.width = "20px";
      button.type = 'button';
      button.textContent = i+1;
      button.value = i;
      buttonCell.onclick = this.getPageOfLobbies;
      buttonCell.appendChild(button);
      i++;
      
    }

  }

  createLobby = (name, rank) => event => {

    console.log((this.props.auth.user.coolDownEnd- (new Date().getTime())));
    console.log(this.props.auth.user.isCoolDown);
    console.log(this.props.auth.user.name);

    if(this.state.isQueued){
      this.showIsQueuedAlert();
    }

    else if(this.props.auth.user.isCoolDown && (this.props.auth.user.coolDownEnd- (new Date().getTime())>0)){
      
        this.showCoolDownWaitModal();
    }
    
    else{  
      if(this.props.auth.user.isCoolDown){
        this.props.endCoolDown();
      }
      
      console.log(this.props.room);
      document.getElementById("createLobbyButton").disabled = true;
      document.getElementById("destroyLobbyButton").disabled = false;
      if(this.state.isLobbyCreated){
        
        
      }
      else{
          

          const ID = 100 + Math.floor(Math.random() * 10) +1;

          console.log(ID);

          socket.emit("createGame", {name: name, rank: rank, ID: ID }); //create room from challenge ID

          socket.on('newGame', (data) => {  
            this.setState({isLobbyCreated: true});
            this.setState({lobby: data.room});


            this.props.setCurrentRoom({ room: data.room });
            this.props.challengeUser({ ID: data.room.split('/')[1] });
            this.props.setIsCompetitive({name: this.props.auth.user.name, isCompetitive: false});
          
            this.showCreateModal();
            console.log('set');
          
        })


        socket.on('joinerReady', (data) => {
          this.showCheckInModal();
        });
      }
    }
  }
  

joinGame = (event) => {


  var room = event.target.value;

  if(this.state.isQueued){
    this.showIsQueuedAlert();
  }

  else if(this.props.auth.user.isCoolDown && (this.props.auth.user.coolDownEnd- (new Date().getTime())>0)){    
    this.showCoolDownWaitModal();
  }

  else{
    if(this.props.auth.user.isCoolDown){
      this.props.endCoolDown();
    }

    console.log(room);

    var DI = room.split("/")[1];
    console.log(DI);
    console.log(room.split('/')[1]);
    socket.emit("gameJoin", {room: room});

    socket.on('isJoinSuccessful', (data) => {
      if(data.success){
        this.showJoinGameModal();
        console.log('roomNotFull');
        console.log(DI);
        console.log(room);

        this.props.challengeUser({ ID: room.split('/')[1] });
  
        this.props.setCurrentRoom({ room: room });

        this.props.setIsCompetitive({name: this.props.auth.user.name, isCompetitive: false});

        console.log(room);

        socket.emit('joinerReady', { room: room });
        socket.on('creatorReady', () => {
          console.log('creatorready');
          this.setState({isGameReady: true});
          this.props.history.push('/challengePage');

        })

        socket.on('creatorDidntCheckIn', () => {
          this.showCreaterDidntConfirmModal();
          socket.emit('leaveAsCreatorDidntCheck', {room: room});
          this.props.removeChallenge();
          this.props.removeRoom();
        })

      }

      else if(!data.success){
        this.showGameFullModal();
      }

    })
  }


}

destroyLobby = (event) => {
  this.setState({isLobbyCreated: false, lobby: ''});
  socket.emit("joinGameAfterCreateGame", { user: this.props.auth.name, room: this.props.room.room });
  this.props.removeRoom();
  this.props.removeChallenge();
  document.getElementById("destroyLobbyButton").disabled = true;
  document.getElementById("createLobbyButton").disabled = false;


}


componentDidMount(){
  this.getRank();
  console.log(this.props.challenge);
  console.log(this.props.room);
  if(this.props.isChallenge){
    console.log('remove');
      this.props.removeChallenge();
  }

  if(this.props.isRoom){
      console.log('remove');
      socket.emit("opponentLeft", {room: this.props.room});
      this.props.removeRoom();
  }

  console.log(this.props.challenge);
  console.log(this.props.room);
  /*this.peopleNumInterval = setInterval(()=> { 
    socket.emit("getNumOfPeopleQueuing");
    socket.on("numOfPeopleQueuing", (data) => {
      this.setState({peopleInQueue: data.num});
    })
  }, 4000);*/
  this.getGames();

  socket.emit("endCompSearch", { name: this.props.auth.user.name });

  //window.addEventListener("beforeunload", this.endCompQueue);
}

/*componentWillUnmount(){
  window.removeEventListener("beforeunload", this.endCompQueue);
}*/

/*unload = (event) => {
  console.log('hi');
  console.log(this.props.auth.user.name);
  console.log(socket.id);
  socket.emit("endCompSearch", { name: this.props.auth.user.name });
  event.returnValue = "hi";

}*/

getRank = (rank) => {
  console.log(this.props.auth.user.rank);
  var str;
  //const rank = this.props.auth.user.rank;

  if((rank/100 | 0)===1){
    str = 'Wood ';
  }
  else if((rank/100 | 0)===2){
    str = 'Bronze ';
  }
  else if((rank/100 | 0)===3){
    str = 'Silver ';
  }
  else if((rank/100 | 0)===4){
    str = 'Gold ';
  }
  else if((rank/100 | 0)===5){
    str = 'Platinum ';
  }
  else if((rank/100 | 0)===6){
    str = 'Diamond ';
  }
  else{
    str = 'Global Elite ';
  }

  if(rank % 100 <=25){
    str = str + "1"
  }
  else if(rank % 100 <=50){
    str = str + "2"
  }
  else if(rank % 100 <=75){
    str = str + "3"
  }
  else {
    str = str + "4";
  }

  return str;
  //this.setState({userRank: str});
}

 showCreateModal = () => {
    console.log('show');
    this.setState({showCreate: true});
  }

 closeCreateModal = () => {
   this.setState({showCreate: false});
 }

 showCheckInModal = () => {
  console.log('show');
  this.setState({showCheckIn: true});
}

closeCheckInModal = () => {
 this.setState({showCheckIn: false});
}

showJoinGameModal = () => {
  console.log('show');
  this.setState({showJoinGame: true});
}

closeJoinGameModal = () => {
 this.setState({showJoinGame: false});
}

showCreaterDidntConfirmModal = () => {
  console.log('show');
  this.setState({showCreaterDidntConfirm: true});
}

closeCreaterDidntConfirmModal = () => {
 this.setState({showCreaterDidntConfirm: false});
}

showGameFullModal = () => {
  console.log('show');
  this.setState({showGameFull: true});
}

closeGameFullModal = () => {
 this.setState({showGameFull: false});
}

showCoolDownWaitModal = () => {
  console.log('show');
  this.setState({showCoolDownWait: true});
}

closeCoolDownWaitModal = () => {
 this.setState({showCoolDownWait: false});
}

showConfirmCompModal = () => {
  this.setState({showConfirmComp: true});
}

closeIsQueuedAlert = () => {
  this.setState({showIsQueued: false});
 }
 
 showIsQueuedAlert = () => {
   this.setState({showIsQueued: true});
 }

createrCheckedIn = () => {
  console.log('ready');
  console.log(this.props.room.room);
  socket.emit('beginGame', {room: this.props.room.room});
  this.setState({isGameReady: true});
  this.props.history.push('/challengePage');
}

compCheckIn = () => {
  socket.emit("compCheckedIn", { room: this.props.room.room });
  this.setState({isCheckedIn: true});
  if(this.state.isOpponentCheckedIn){
    console.log('their checked in')
    this.setState({isGameReady: true});
    this.props.history.push('/challengePage');
  }
}

timesUp = () => {
  this.props.removeChallenge();
  this.props.removeRoom();
  socket.emit('checkInNoGood', { room: this.props.room.room });
}

compTimesUp = () => {
  this.props.removeChallenge();
  this.props.removeRoom();
  socket.emit("compTimesUp", {room: this.props.room.room});

  this.setState({isQueued: false});
}

compQueue = (event) => {
  event.preventDefault();
  console.log("compQueuecalled");
  document.getElementById("startCompSearchButton").disabled = true;
  document.getElementById("endCompSearchButton").disabled = false;
  this.setState({isQueued: true});

  var time = (new Date().getTime())/1000;

  console.log(time);
  socket.emit("compQueue", {name: this.props.auth.user.name, rank: this.props.auth.user.rank, time: time, socketID: socket.id});

  socket.emit("getNumberOfPeopleQueuing");
  socket.on("numberOfPeopleQueuing", (data) => {
    document.getElementById("tellNumOfPplInQueue").textContent = "There are currently " + data.num + " people queued up"
  })

  this.peopleQueuingInterval = setInterval(() => {
    socket.emit("getNumberOfPeopleQueuing");
    socket.on("numberOfPeopleQueuing", (data) => {
      document.getElementById("tellNumOfPplInQueue").textContent = "There are currently " + data.num + " people queued up"
    })
  }, 3000); 

  this.queueInterval = setInterval(()=> { 
    console.log('interval');
      socket.emit("checkPriorityQueue", {name: this.props.auth.user.name, rank: this.props.auth.user.rank, time: time});
    }, 5000);

  socket.on("foundPerson", (data) => {
    console.log('foundPerson');
    clearInterval(this.queueInterval);
    clearInterval(this.peopleQueuingInterval);
    document.getElementById("tellNumOfPplInQueue").textContent = "";

    const ID = 100 + Math.floor(Math.random() * 8) + 1;
    socket.emit("queueCreateLobby", { index: data.index, challengeID: ID, name: this.props.auth.user.name });
    socket.on("compRoomCreated", (data)=> {
      console.log(data.challengeID);
      this.props.challengeUser({ID: data.challengeID});
      this.props.setCurrentRoom({room: data.room });
      this.props.setIsCompetitive({name: this.props.auth.user.name, isCompetitive: true});

      this.showConfirmCompModal();
      socket.on("opponentCheckedIn", () => {
        console.log("opponentCheckedIn");
        this.setState({isOpponentCheckedIn: true});
        if(this.state.isCheckedIn){
          console.log("im checked in");
          this.setState({isGameReady: true});
          this.props.history.push('/challengePage');
        }
      })

    })
  })  

  socket.on("personFoundYou", (data) => {
    console.log('found');
    clearInterval(this.queueInterval);

    clearInterval(this.peopleQueuingInterval);
    document.getElementById("tellNumOfPplInQueue").textContent = "";

    socket.on("compRoomCreated", (data) =>{
      console.log(data.challengeID);
      this.props.challengeUser({ID: data.challengeID});
      this.props.setCurrentRoom({ room: data.room });
      this.props.setIsCompetitive({name: this.props.auth.user.name, isCompetitive: true});

      this.showConfirmCompModal();

      socket.on("opponentCheckedIn", () => {
        this.setState({isOpponentCheckedIn: true});
        if(this.state.isCheckedIn){
          console.log('im checked in');
          this.setState({isGameReady: true});
          this.props.history.push('/challengePage');
        }
      })
    })
  })  
}

endCompQueue = (event) => {
  event.preventDefault();


  socket.emit("endCompSearch", {name: this.props.auth.user.name});
  clearInterval(this.queueInterval);
  clearInterval(this.peopleQueuingInterval);

  document.getElementById("tellNumOfPplInQueue").textContent = "";
  this.setState({isQueued: false});

  document.getElementById("startCompSearchButton").disabled = false;
  document.getElementById("endCompSearchButton").disabled = true;


}




render() {
    const { user } = this.props.auth;

  return (
    <div className = "dashboardbg">

      <div style = {{width: "90vw", margin: "auto"}}>
    
      <Alert  
        show = {this.state.showCreate} 
        onHide = {this.closeCreateModal}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
            You have created a lobby!
          </Alert.Heading>
          <p>
              Your lobby name is {this.state.lobby}
          </p>
          <hr/>
          <div className="d-flex justify-content-end">
            <Button onClick = {this.closeCreateModal}>OK</Button>

          </div>

        </Alert>

        <Alert  
        show = {this.state.showCheckIn} 
        onHide = {this.closeCheckInModal}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
              Someone has joined your lobby!
          </Alert.Heading>
          <p>
              Please hit the button below to confirm, and start the match!
          </p>
          <hr/>
          <div className = "d-flex justify-content-start">
            <CheckInTimer timesUp = {this.timesUp}></CheckInTimer>
          </div>              
          <div className = "d-flex justify-content-end">
              <Button onClick = {this.createrCheckedIn}>Join</Button>
          </div>

        </Alert>

        <Alert 
        show = {this.state.showJoinGame} 
        onHide = {this.closeJoinGameModal}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
            You have requested to join this game
          </Alert.Heading>
          <p>Just waiting for the creator to confirm...</p>
            <hr/>

          <div className="d-flex justify-content-end">
            <Button onClick = {this.closeJoinGameModal}>OK</Button>
          </div>


        </Alert>

        <Alert  
        show = {this.state.showGameFull} 
        onHide = {this.closeGameFullModal}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
            This game is now full
          </Alert.Heading>
          <p>
            Sorry, hit refresh to get the most updated list of games
          </p>
          <hr/>

          <div className="d-flex justify-content-end">
            <Button onClick = {this.closeGameFullModal}>OK</Button>
          </div>
        </Alert>

        <Alert  
        show = {this.state.showCreaterDidntConfirm} 
        onHide = {this.closeCreaterDidntConfirm}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
            The other player failed to confirm the game
          </Alert.Heading>

          <p>
            Either join another game, or start one yourself!
          </p>
          <hr/>

          <div className="d-flex justify-content-end">
            <Button onClick = {this.closeCreaterDidntConfirmModal}>OK</Button>
            </div>

        </Alert>

        <Alert  
        show = {this.state.showCoolDownWait} 
        onHide = {this.closeCoolDownWait}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
            You are still cooling down from a match abandon
          </Alert.Heading>

          <p>
            Please wait another {(this.props.auth.user.coolDownEnd - (new Date().getTime()))/1000} seconds
          </p>
          <hr/>

          <div className="d-flex justify-content-end">
            <Button onClick = {this.closeCoolDownWaitModal}>OK</Button>
          </div>

        </Alert>

        <Alert  
        show = {this.state.showConfirmComp} 
        variant = "info"
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
              A game has been found!
          </Alert.Heading>
          <p>
              Please hit the button below to confirm, and start the match!
          </p>
          <hr/>
          <div className = "d-flex justify-content-start">
            <CompTimer timesUp = {this.compTimesUp}></CompTimer>
          </div>              
          <div className = "d-flex justify-content-end">
              <Button onClick = {this.compCheckIn}>Join</Button>
          </div>

        </Alert>

        <Alert  
        show = {this.state.showIsQueued} 
        onHide = {this.closeIsQueuedAlert}
        variant = "info"
        dismissable
        style={{position: "fixed", zIndex: "1", width: "80vw"}}>
          <Alert.Heading>
            You can't create join a casual lobby when in line for a competitive game!
          </Alert.Heading>

          <p>
            If you'd like to play a casual game instead, you can end your competitive search...
          </p>
          <hr/>

          <div className="d-flex justify-content-end">
            <Button onClick = {this.closeIsQueuedAlert}>OK</Button>
            </div>

        </Alert>

        <div className="row" style = {{ height: "3vh" }}>


          <div className = "col sm">
          <text
              style={{
                fontFamily: "monospace",
                fontSize: "30px",
                textAlign: "center"
              }}
              className="brand-logo black-text"
            >
              <i className="material-icons">code</i>
                CompCoder
            </text>
          </div>
          </div>
          <hr></hr>
          <div className = "row d-flex" style = {{ height: "5vh" }}>
            <div className = "mr-auto">
            <Button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
                backgroundColor: "rgb(71, 214, 114)"
              }}


              onClick={this.onLogoutClick}
            >
              Logout
            </Button>
            </div>

            <div className = "ml-auto">
              <text>
                <b>{user.name.split(" ")[0]}</b>, {this.getRank(this.props.auth.user.rank)}
              </text>

            </div>
          </div>  

          <div className = "row" style = {{height: "40vh"}}>
            <div className = "col-sm" style = {{border: "1px solid black", marginRight: "8px", backgroundColor: "rgba(153, 255, 255, 0.2)"}}>

                <div className = "row justify-content-center" style = {{height: "4vh"}}>
                  <h3>
                    Welcome, to the gauntlet...
                  </h3>
                </div>
                <div className = "row justify-content-left" style = {{ height: "15vh" }}>
                  <p class = "tieReminder">
                    -Compete 1-on-1 against others in real time on a variety of programming problems.<br></br><br></br>
                    -To the right, you'll see you can queue up for a competitive game against people of similar skills.<br></br><br></br>
                    -Want a laid back game? Below you'll see casual games, where you can either create or join a lobby to play with somebody, or add a friend, and play with them instead</p>
                </div>
          </div>

            <div className = "col-sm" style = {{border: "1px solid black", marginLeft: "8px", marginBottom: "10vh", backgroundColor: "rgba(153, 255, 255, 0.2)"}}>
              <div className = "row justify-content-center" style = {{height: "8vh"}}>
                <text class = "compTitle">
                  <b>Feeling confident? Play competitive to queue up with people of a similar rank!</b>
                </text>
              </div>

              <div className = "d-flex row" style = {{height: "6vh"}}>
                <div className = "mr-auto" style ={{marginLeft: "5vw"}}>
                  <Button 
                  id= "startCompSearchButton"
                  onClick ={this.compQueue}
                  style = {{
                  backgroundColor: "rgb(71, 214, 114)",
                  width: "15vw"}}>
                    Queue
                  </Button>
                  </div>

                  <div className = "ml-auto" style ={{marginRight: "5vw"}}>
                    <Button 
                    id="endCompSearchButton"
                    onClick = {this.endCompQueue}
                    style = {{
                    backgroundColor: "rgb(185, 82, 100)",
                    width: "15vw"}}>
                      Cancel
                    </Button>
                  </div>



              </div>

              <div className = "d-flex row justify-content-center" style = {{height: "4vh"}}>
                  <text id = "tellNumOfPplInQueue">
                    
                  </text>
              </div>

              <div className = "d-flex row justify-content-center" style = {{height: "8vh"}}>
                  <BarLoader color = "#66ff66" loading = {this.state.isQueued} size = {100}/>
              </div>

            </div>
          </div>
            
            

            
          <div className = "row justify-content-center">
            <h4>
              <br></br><hr></hr><br></br>
              Join a casual game</h4>
          </div>

          <div className="row d-flex">
            <div class ="mr-auto">
              <Button
                style={{
                  width: "100px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px",
                  marginTop: "1rem",
                  float: "left"
                }}
                onClick={this.getGames}
              >
                  Refresh
              </Button>
              </div>

              <div class ="ml-auto">
              <Button
              style={{
                width: "100px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
              }}
              onClick={this.createLobby(user.name, user.rank)}
              id = "createLobbyButton"
              
              >
                  Create
              </Button>
            
            
              <Button 
              id = "destroyLobbyButton"
              style={{
                width: "100px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
              }}
              
              onClick={this.destroyLobby}
              >
                Leave
              </Button>
              </div>
            
          </div>
            <h5> </h5>

            <div className="row justify-content-center" style = {{height: "65vh"}}>
              <div style = {{width: "93vw"}}>
              <table id="lobbyTable" className = "bordered" style ={{border: "1px solid black", padding: "10px"}} >
              </table>
              
              
            
            </div>
            <div className = "col sm">
              <table id = "pageButtons">

              </table>
            </div>
            </div>

          <div className = "d-flex row justify-content-center" style = {{height: "8vh"}}>

            <p className="bottomText" style = {{width: "100vw"}}>
              <hr></hr>
              This site was created by Jacob Richichi<br></br>
            </p>
          </div>  
          <div className = "d-flex row justify-content-center" style = {{height: "5vh"}}>
            <Link to = "/bugReport">
              <p className="bottomText">
                Found a bug? Click here to let me know!
              </p>
            </Link>
          </div>

        </div>



      </div>
    );
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  endCoolDown: PropTypes.func.isRequired,
  setIsCompetitive: PropTypes.func.isRequired,

  challengeUser: PropTypes.func.isRequired,
  setCurrentRoom: PropTypes.func.isRequired,
  removeChallenge: PropTypes.func.isRequired,
  removeRoom: PropTypes.func.isRequired,

  isChallenge: PropTypes.bool.isRequired,
  isRoom: PropTypes.bool.isRequired,

  auth: PropTypes.object.isRequired,
  challenge: PropTypes.object.isRequired,
  room: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  challenge: state.auth.challenge,
  isChallenge: state.auth.isChallenge,

  room: state.auth.room,
  isRoom: state.auth.isRoom
});

export default connect(
  mapStateToProps,
  { logoutUser, challengeUser, setCurrentRoom, removeChallenge, removeRoom, endCoolDown, setIsCompetitive }
)(Dashboard);