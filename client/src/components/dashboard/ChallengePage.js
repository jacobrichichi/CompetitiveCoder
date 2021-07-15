import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { removeChallenge, removeRoom, challengeUser } from "../../actions/challengeActions";
import { updateUserRank, coolDown } from "../../actions/authActions";

import "unirest";
import "./ChallengePage.css";
import Timer from "./Timer";
import socket from "../../socket";
import {Col, Alert, Button} from "react-bootstrap";

import Editor from "@monaco-editor/react";
import PanelGroup from 'react-panelgroup';



class ChallengePage extends Component { 
    constructor(props){
        super(props);

        this.state ={
            input: '',
            output: '',
            language_id: 62,
            user_input: '',
            startTime: new Date().getTime(),
            count: 0,
            room: '',
            timeOfLastRun: 0,
            leaving: false,
            mounted: false,
            firstInput: false,
            showOppInfo: false,
            showGameFinished: false,
            showConfirmLeave: false,
            yourFinishInfo: '',
            theirFinishInfo: '',
            winnerInfo: '',
            oppNumCorrect: 0,
            oppRunTime: 0,
            oppMemory: 0, 
            description: '',
            exampleOne: '',
            exampleTwo: '',
            isGameFinished: false
        

        };


        socket.on('gameEnd', this.opponentLeave);

        socket.on("intervalUpdate", (data) => {

            this.setState({oppNumCorrect: data.numCorrect, oppRunTime: data.runTime, oppMemory: data.memory})
            this.showOppInfoAlert();
        })

       // socket.on('reconnect', () =>{
       //    console.log('reconnection');
       //    socket.emit('rejoinGame', { room: this.props.room.room });
        //});

    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isChallenge) {
            console.log('nextProps');
            this.props.history.push("/dashboard"); // push user back to dashboard once the room and challenge have been removed from state tree
        }
        /*if (nextProps.errors) {
          this.setState({
            errors: nextProps.errors
          });
        }*/
    }


    componentWillUnmount(){
        console.log('unmounting');
        console.log(this.props.isChallenge);
        console.log(this.props.user);

        localStorage.removeItem('srcCode');
        localStorage.removeItem('numCorrect');
        localStorage.removeItem('runTime');
        localStorage.removeItem('memory');
        localStorage.removeItem('description');
        localStorage.removeItem('exampleOne');
        localStorage.removeItem('exampleTwo');

        socket.emit('endGame', {room: this.props.room.room});


        this.props.removeRoom();
        this.props.removeChallenge();
    
     }

     componentWillMount() {
         if(localStorage.getItem('description')){
             this.setState({description: localStorage.getItem('description')
             , exampleOne: localStorage.getItem('exampleOne'),
             exampleTwo: localStorage.getItem('exampleTwo')})
         }
         else{
            var description = this.props.challenge.challenge.description;

            var exampleOne = description.substring(description.indexOf('!') + 1, description.indexOf('@'));
            var exampleTwo = description.substring(description.indexOf('@') + 1, description.length);

            exampleOne = exampleOne.split('%').map((line) => <text>{line}<br/></text>);
            exampleTwo = exampleTwo.split('%').map((line) => <text>{line}<br/></text>);
            

            description = description.substring(0, description.indexOf('!'));


            description = description.split('%').map((line) => <text >{line}<br/></text>);

            this.setState({description: description, exampleOne: exampleOne, exampleTwo: exampleTwo});
            localStorage.setItem('description', description);
            localStorage.setItem('exampleOne', exampleOne);
            localStorage.setItem('exampleTwo', exampleTwo);
         }
     }

     componentDidMount(){
         
         //this.enableTab('source');
     }
      


    back = (event) => {
        event.preventDefault();
        if(!this.state.isGameFinished){
            this.showConfirmLeave();
        }
        else{
            this.setState({leaving: true});
            socket.emit('endGame', {room: this.props.room.room});
            this.props.history.push('/dashboard');
        }

        
    }

    confirmedAbandon = (event) => {
        event.preventDefault();
        this.setState({leaving: true});
        socket.emit('endGame', {room: this.props.room.room});
        this.props.coolDown({name: this.props.user.name, time: new Date().getTime() +1800000});

        this.props.history.push('/dashboard');
    }

    opponentLeave = () => {

        this.setState({leaving: true});
        //socket.emit('opponentLeft', {room:this.props.room.room});

        this.props.history.push('/dashboard');

    }

    backMyFault = () => {
        this.setState({leaving: true});

        socket.emit('endGame', {room: this.props.room.room});
        this.props.history.push('/dashboard');

        
    }

    input = (value, event) => {
       // event.preventDefault();

        if(!this.state.firstInput){
            if(parseInt(this.props.room.room.split('/')[1])!== this.props.challenge.challenge.i){
                //this.back();

                this.backMyFault();  
            }
        }
        socket.emit('checkRoom');
       // console.log(this.props.room);
       // console.log(this.props.challenge);

       // console.log(socket);

       // if(this.state.count===0)
      //      this.enableTab('source');

        localStorage.setItem('srcCode', value);    //store input in local storage so it is preserved on refresh    
        this.setState({ input: value, count: 1, firstInput: true});


    };

    userInput = (event) => {
        event.preventDefault();
        this.setState({ user_input: event.target.value });
      };

    submit = async (e) =>{
        e.preventDefault();

        var currentTime = new Date().getTime();


        if((currentTime - this.state.timeOfLastRun)/1000 >= 30){

        this.setState({timeOfLastRun: new Date().getTime()});  
        outputText = document.getElementById('output').textContent;
        
        let outputText = document.getElementById("output");
        const { challenge } = this.props.challenge;

        var j = 0;
        var str2 = ''; 
        var str3 = this.state.input;
        const timeElapsed = new Date().getTime() - this.state.startTime;
        //Building the main method that will be used to invoke the user made method, and adding an import of Scanner at the beginning
        

        var str1 = '\tpublic static void main(String[] args){\n';

        var w = 0;
        var str5 = '';
        var userOutputs = '';
        var userOutputsCorrect = {};
        var correct = true;
        var userOutputsSplit ={};
        var numCorrect = 0;
        var runTime = 0;
        var memory = 0;
        var numOfLoops = 0;


        for(var j = 0; j <challenge.inputs.length; j++){
            str1 = str1 + "\t\ttry{\n\t\t\tSystem.out.println(" + challenge.methodName + "(";
            for(var k = 0; k<challenge.inputs[j].length; k++){
                str1 = str1 + challenge.inputs[j][k];
                if(k<challenge.inputs[j].length-1)
                    str1= str1 + ', ';
            }
            str1 = str1 + "));}\n\t\tcatch(Exception e){\n\t\t\tSystem.out.println(e.toString());\n\t\t}\n";
        }
        str1 = str1 + "\t}\n";



        while(str3.length>0){
            w = str3.indexOf('\n');
            if(str3.indexOf("public class Main")!==0){      //Toss a main method in there that calls the input method and passes into it the subject input
                str2 = str2 + str3.substring(0, w+1);
                str3 = str3.substring(w+1, str3.length);
            }
            else{
                str2 = str2 + "\n" + challenge.dataStructure + "\n" + str3.substring(0, w+1);
                str3 = str3.substring(w+1, str3.length);
                str2 = str2.concat(str1, str3);
                break;
            }
        }  

        

        const response = await fetch(
            "https://judge0-extra.p.rapidapi.com/submissions",
            {
                method: "POST",
                headers: {
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    "x-rapidapi-key": "e51bc475ffmshb688bd7febd7bdap175735jsn486eb27febcb", 
                    "content-type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify({
                    source_code: str2,
                    language_id: 62
                }),
                }
            
            );
            
            const jsonResponse = await response.json();
            

            let jsonGetSolution ={
                status: { description: "Queue" },
                stderr: null,
                compile_output: null
            };


            while(
                (jsonGetSolution.status.description!== "Accepted"&&
                jsonGetSolution.stderr == null &&
                jsonGetSolution.compile_output == null)
            ) {

                numOfLoops++;
                if(numOfLoops>100){
                    break;
                }
                if(jsonResponse.token){

                    let url = `https://judge0-extra.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;
                    
                    const getSolution = await fetch(url, {
                        method: "GET",
                        headers: {
                            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                            "x-rapidapi-key": "e51bc475ffmshb688bd7febd7bdap175735jsn486eb27febcb", 
                            "content-type": "application/json",
                          },
                    });

                    jsonGetSolution = await getSolution.json();
                }
            }

            if(jsonGetSolution.stdout){
                userOutputs = atob(jsonGetSolution.stdout);
                runTime = jsonGetSolution.time;
                memory = jsonGetSolution.memory;

                userOutputsSplit = userOutputs.split("\n");
                
                for(var t = 0; t<userOutputsSplit.length; t++){
                    if(userOutputsSplit[t] === challenge.outputs[t]){
                        userOutputsCorrect[t] = true;
                        numCorrect++;
                    
                    }    
                    else{
                    
                        correct = false;
                        userOutputsCorrect[t] = false;
                    }
                }
                str2 = "You passed " + numCorrect + "/" + challenge.inputs.length + " cases, and it took you " + (timeElapsed/1000) + " seconds. The average run time was " + (runTime/challenge.inputs.length) + " ms and you used " + memory + " KB of memory!\n" + "Did all test cases pass?: " + correct +"\n\n";
    
                localStorage.setItem("numCorrect", numCorrect);
                localStorage.setItem("runTime", runTime);
                localStorage.setItem("memory", memory);

                //for(var j = 0; j<challenge.outputs.length; j++){
                //    str2 = str2 + "Input(s): " + challenge.inputs[j] + "\nYour Output: " + userOutputsSplit[j] + "\nExpected Output: " + challenge.outputs[j] + "\nOutput correct?: " + userOutputsCorrect[j] + "\n-------------------------------------------\n";
                //}
            }    
            else if(jsonGetSolution.stderr){
                userOutputs = atob(jsonGetSolution.stderr);
                str2 = userOutputs;
                correct = false;
            }
    
            else{
                userOutputs = atob(jsonGetSolution.compile_output);
                str2 = userOutputs;
                correct = false;
            }
            outputText.textContent = str2;
        }
        else{
            document.getElementById('warningText').textContent = "Please wait another " + (30 - (currentTime - this.state.timeOfLastRun)/1000) + " seconds to run again"; 
        }
    
    
    };

    enableTab(id) {
        var el = document.getElementById(id);
        el.onkeydown = function(e) {
            if (e.keyCode === 9) { // tab was pressed
    
                // get caret position/selection
                var val = this.value,
                    start = this.selectionStart,
                    end = this.selectionEnd;
    
                // set textarea value to: text before caret + tab + text after caret
                this.value = val.substring(0, start) + '\t' + val.substring(end);
    
                // put caret at right position again
                this.selectionStart = this.selectionEnd = start + 1;
    
                // prevent the focus lose
                return false;
    
            }
        };
    }

    rejoinRoom(){
        socket.emit('rejoinRoom', {room:this.props.room});
    }

    timesUp = async () => {
        this.setState({isGameFinished: true});
        let outputText = document.getElementById("output");
        const { challenge } = this.props.challenge;
        var OCI = '';
        var hasOwn = false;
        var hasOpp = false;
        var oppNumCorrect;
        var oppRunTime;
        var oppMemory;
        var oppCorrect;
        var didWin = 2;
        var numOfLoops = 0;


        socket.on('opponentsChallengeInfo', (data) => {
            OCI = "Your opponent passed " + data.oppNumCorrect + "/" + challenge.inputs.length + " cases. Their run time was " + data.oppRunTime + " ms and they used " + data.oppMemory + " KB of memory!\n" + "Did all their test cases pass?: " + data.oppCorrect +"\n\n";
            this.setState({theirFinishInfo: OCI});
            hasOpp = true;

            console.log('OCI');
            if(hasOwn === true){
                console.log('hasown');
                str2 = str2 + OCI;
                var winnerString = '';

                if(oppNumCorrect<numCorrect){
                    winnerString = "You passed more test cases, so you won :)";
                    str2 = str2 + "\nYou passed more test cases, so you won :)";
                    didWin = 1;

                }
                else if(oppNumCorrect>numCorrect){
                    winnerString = "They passed more test cases, so you lost :(";
                    str2 = str2 + "\nThey passed more test cases, so you lost :(";
                    didWin = 0;
                }

                else{
                    winnerString = "You both had the same number of case right";
                    str2 = str2 + "\nYou both had the same number of case right";
                    if(runTime < oppRunTime){
                        winnerString = winnerString + ", but you had a better run time, so you win :^)";
                        str2 = str2 + ", but you had a better run time, so you win :^)";
                        didWin = 1;
                    }
                    else if(oppRunTime < runTime){
                        winnerString = winnerString + ", but they had a better run time, so you lost :^(";
                        str2 = str2 + ", but they had a better run time, so you lost :^(";
                        didWin = 0;
                    }
                    else{
                        winnerString = winnerString + ", and you both somehow had the same runtime. Lets call it a draw";
                        str2 = str2 + ", and you both somehow had the same runtime. Lets call it a draw ";
                        didWin = 2;
                    
                    }
                }
                outputText.textContent = str2;
                this.setState({winnerInfo: winnerString});
                this.showGameFinishedAlert();
                if(this.props.user.isCompetitive){
                    if(didWin === 0){
                        if(this.props.user.rank - 20 >= 100){
                            this.props.updateUserRank({name: this.props.user.name, rank: this.props.user.rank, eloUpdate: -20})
                        }
                    }
                    else if(didWin === 1){
                        if(this.props.user.rank + 20 <= 799){
                            this.props.updateUserRank({name: this.props.user.name, rank: this.props.user.rank, eloUpdate: 20})
                        }
                    }
                }

            }
            else{
                console.log('no hasown yet');
                oppNumCorrect = data.oppNumCorrect;
                oppRunTime = data.oppRunTime;
                oppMemory = data.oppMemory;
                oppCorrect = data.oppCorrect;
            }
        });
    
        var j = 0;
        var str2 = ''; 
        var str3 = this.state.input;
        const timeElapsed = new Date().getTime() - this.state.startTime;
    
        //Building the main method that will be used to invoke the user made method, and adding an import of Scanner at the beginning
            
    
        var str1 = '\tpublic static void main(String[] args){\n';
    
        var w = 0;
            var str5 = '';
            var userOutputs = '';
            var userOutputsCorrect = {};
            var correct = true;
            var userOutputsSplit ={};
            var numCorrect = 0;
            var runTime = 0;
            var memory = 0;
    
    
            for(var j = 0; j <challenge.inputs.length; j++){
                str1 = str1 + "\t\ttry{\n\t\t\tSystem.out.println(" + challenge.methodName + "(";
                for(var k = 0; k<challenge.inputs[j].length; k++){
                    str1 = str1 + challenge.inputs[j][k];
                    if(k<challenge.inputs[j].length-1)
                        str1= str1 + ', ';
                }
                str1 = str1 + "));}\n\t\tcatch(Exception e){\n\t\t\tSystem.out.println(e.toString());\n\t\t}\n";
            }
            str1 = str1 + "\t}\n";
    
    
    
            while(str3.length>0){
                w = str3.indexOf('\n');
                if(str3.indexOf("public class Main")!==0){      //Toss a main method in there that calls the input method and passes into it the subject input
                    str2 = str2 + str3.substring(0, w+1);
                    str3 = str3.substring(w+1, str3.length);
                }
                else{
                    str2 = str2 + "\n" + challenge.dataStructure + "\n" + str3.substring(0, w+1);
                    str3 = str3.substring(w+1, str3.length);
                    str2 = str2.concat(str1, str3);
                    break;
                }
            } 
            
            
            
    
            const response = await fetch(
                "https://judge0-extra.p.rapidapi.com/submissions",
                {
                    method: "POST",
                    headers: {
                        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                        "x-rapidapi-key": "e51bc475ffmshb688bd7febd7bdap175735jsn486eb27febcb", 
                        "content-type": "application/json",
                        accept: "application/json",
                    },
                    body: JSON.stringify({
                        source_code: str2,
                        language_id: 62
                    }),
                    }
                
                );

                console.log('running code');
                
                const jsonResponse = await response.json();
                
    
                let jsonGetSolution ={
                    status: { description: "Queue" },
                    stderr: null,
                    compile_output: null
                };
                console.log('running code 2');
    
    
                while(
                    (jsonGetSolution.status.description!== "Accepted"&&
                    jsonGetSolution.stderr == null &&
                    jsonGetSolution.compile_output == null)
                ) {
                    numOfLoops++;
                    if(numOfLoops>100){
                        break;
                    }
                    if(jsonResponse.token){

                        console.log('token');
    
                        let url = `https://judge0-extra.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;
                        
                        const getSolution = await fetch(url, {
                            method: "GET",
                            headers: {
                                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                                "x-rapidapi-key": "e51bc475ffmshb688bd7febd7bdap175735jsn486eb27febcb", 
                                "content-type": "application/json",
                              },
                        });
                        console.log('await get solution');
    
                        jsonGetSolution = await getSolution.json();
                    }
                }
    
                if(jsonGetSolution.stdout){
                    console.log('solution got');

                    userOutputs = atob(jsonGetSolution.stdout);
                    runTime = jsonGetSolution.time;
                    memory = jsonGetSolution.memory;

    
                    userOutputsSplit = userOutputs.split("\n");
                    
                    for(var t = 0; t<userOutputsSplit.length; t++){
                        if(userOutputsSplit[t] === challenge.outputs[t]){
                            
                            userOutputsCorrect[t] = true;
                            numCorrect++;
                        
                        }    
                        else{
                        
                            correct = false;
                            userOutputsCorrect[t] = false;
                        }
                    }

                    
                    str2 = "You passed " + numCorrect + "/" + challenge.inputs.length + " cases. The run time was " + runTime + " ms and you used " + memory + " KB of memory!\n" + "Did all test cases pass?: " + correct +"\n\n";
                    this.setState({yourFinishInfo: str2});
        
                   // for(var j = 0; j<challenge.outputs.length; j++){
                      //  str2 = str2 + "Input(s): " + challenge.inputs[j] + "\nYour Output: " + userOutputsSplit[j] + "\nExpected Output: " + challenge.outputs[j] + "\nOutput correct?: " + userOutputsCorrect[j] + "\n-------------------------------------------\n";
                    //}
                }    
                else if(jsonGetSolution.stderr){
                    userOutputs = atob(jsonGetSolution.stderr);
                    str2 = userOutputs;
                    correct = false;
                }
        
                else{
                    userOutputs = atob(jsonGetSolution.compile_output);
                    str2 = userOutputs;
                    correct = false;
                }
            

                hasOwn = true;
                console.log('finished running code');

                socket.emit('myChallengeInfo', {room: this.props.room.room, numCorrect: numCorrect, runTime: runTime, memory:memory, correct:correct});
                if(hasOpp){
                    var winnerString = '';
                    console.log('hasopp');
                    str2 = str2 + OCI;
                    if(oppNumCorrect<numCorrect){
                        winnerString = "You passed more test cases, so you won :)";
                        str2 = str2 + "\nYou passed more test cases, so you won :)";
                        didWin = 1;

                    }
                    else if(oppNumCorrect>numCorrect){
                        winnerString = "They passed more test cases, so you lost :(";
                        str2 = str2 + "\nThey passed more test cases, so you lost :(";
                        didWin = 0;
                    }
    
                    else{
                        winnerString = "You both had the same number of case right";
                        str2 = str2 + "\nYou both had the same number of case right";
                        if(runTime < oppRunTime){
                            winnerString = winnerString + ", but you had a better run time, so you win :^)";
                            str2 = str2 + ", but you had a better run time, so you win :^)";
                            didWin = 1;
                        }
                        else if(oppRunTime < runTime){
                            winnerString = winnerString + ", but they had a better run time, so you lost :^(";
                            str2 = str2 + ", but they had a better run time, so you lost :^(";
                            didWin = 0;
                        }
                        else{
                            winnerString = winnerString + ", and you both somehow had the same runtime. Lets call it a draw";
                            str2 = str2 + ", and you both somehow had the same runtime. Lets call it a draw ";
                            didWin = 2;
                        
                        }
                    }

                    outputText.textContent = str2;

                    this.setState({winnerInfo: winnerString});
                    this.showGameFinishedAlert();

                    if(this.props.user.isCompetitive){
                        if(didWin === 0){
                            if(this.props.user.rank - 20 >= 100){
                                this.props.updateUserRank({name: this.props.user.name, rank: this.props.user.rank, eloUpdate: -20})
                            }
                        }
                        else if(didWin === 1){
                            if(this.props.user.rank + 20 <= 799){
                                this.props.updateUserRank({name: this.props.user.name, rank: this.props.user.rank, eloUpdate: 20})
                            }
                        }
                    }


                }
        
                
        };

   componentDidMount(){

    

        if(!this.state.leaving){
            socket.emit('rejoinGame', { room: this.props.room.room });
        
        }
    }


    intervalUpdate = () => {
        if(localStorage.getItem("numCorrect")){
            socket.emit("intervalUpdate", { 
                numCorrect: localStorage.getItem("numCorrect"),
                runTime: localStorage.getItem("runTime"),
                memory: localStorage.getItem("memory"),
                room: this.props.room.room
            });
        }
    }

    showOppInfoAlert = () =>{
        this.setState({showOppInfo: true});
    } 

    showGameFinishedAlert = () =>{
        this.setState({showGameFinished: true});
    }
    showConfirmLeave = () => {
        this.setState({showConfirmLeave:true});
    }

    closeConfirmLeave = () => {
        this.setState({showConfirmLeave:false});
    }


    mapMakeDescription = () => {
        this.props.challenge.challenge.description.split('%').map(line => {
            return <text>{line}<br/></text>
        })
    }
    /*makeDescription = () => {
        var lineBreak = document.createElement("br");

        lineBreak.type = "br";
        const descriptionSplit = this.props.challenge.challenge.description.split('%');


        var descText = document.createElement('text');
        descText.type = "text";
        descText.innerHTML = '';

        console.log(lineBreak);

        for(var i = 0; i<descriptionSplit.length; i++){
            if(descriptionSplit[i].charAt(0)==='!'){
                descText.innerHTML = descText.innerHTML + 'Example 1:' + lineBreak;
            }
            else if(descriptionSplit[i].charAt(0)==='@'){
                descText.innerHTML = descText.innerHTML + 'Example 2:' + lineBreak;
            }
            descText.innerHTML = descText.innerHTML + descriptionSplit[i] + lineBreak;
            //console.log('hi');
           // console.log(descText.innerHTML);

        }
        document.getElementById('description').innerHTML = descText.innerHTML;

        
    }*/

    render(){


        const { challenge } = this.props.challenge;
        const { room } = this.props.room;
        console.log('render')
        var splitImports;

        if(this.state.firstInput===false){
            var DS = " \n";

            if(challenge.dataStructure!=="  "){
                DS = "/*\n" + challenge.dataStructure + "\n*//*\n";
            }

            if(challenge.imports!==" "){
                splitImports = challenge.imports.split('|');
                for(var j = 0; j<splitImports.length; j++){
                    DS = DS + splitImports[j] + "\n";
                }
            }


            DS = DS + "public class Main{\n\tpublic static "+ challenge.outputType + " " + challenge.methodName + "(";
                for(var l = 0; l<challenge.inputTypes.length; l++){
                DS = DS + challenge.inputTypes[l] + " " + challenge.inputVarNames[l];
                if(l<challenge.inputTypes.length-1){
                    DS = DS + ", ";
                }        


                
        }
        DS = DS + "){\n\n\t}\n}";


        var selected;

        

        if(localStorage.getItem('srcCode')){


            if(localStorage.getItem('srcCode')!==DS){
               // localStorage.setItem('description', description);
                selected = DS;
                localStorage.setItem('srcCode', DS);
                //document.getElementById('source').innerHTML = DS;
                //document.getElementById('description').innerHTML = description;
                this.setState({input: DS});

                if(this.state.firstInput===false)
                    window.location.reload(false);
                

            }
            else{
               // description = localStorage.getItem('description');
                selected = localStorage.getItem('srcCode');
            }

        }

        else{
            selected = DS;
            localStorage.setItem('srcCode', DS);
           // localStorage.setItem('description', description);
        }
        }


        return(
            <div className = "challengepagebg">
            
            <PanelGroup direction = "row">
                <div id = "transparent">
                    <div style = {{marginTop: "10px"}}>
                        <h4>
                            <p id = 'title'>{challenge.name}</p>
                        </h4>
                    </div>

                    <br></br>

                    <div style = {{marginLeft: "5px", marginRight: "5px"}}>
                        <div class = "d-flex justify-content-left">
                
                            <text id= 'description'>{this.state.description}</text>
                        </div>   
                        <hr></hr>
                        <br></br>

                        <div class = "d-flex justify-content-left">
                            <text id= "exampleTitle">{this.state.exampleOne=== '' ? '' : 'Example 1:' }<br></br><br></br></text>
                        </div>    

                        <div class = "d-flex justify-content-left">
                            <text id = "example">{this.state.exampleOne}</text>
                        </div>

                        <div class = "d-flex justify-content-left">    
                            <text id= "exampleTitle">{this.state.exampleTwo=== '' ? '' : 'Example 2:' }<br></br><br></br></text>
                        </div>  

                        <div class = "d-flex justify-content-left">
                            <text id = "example">{this.state.exampleTwo}</text>
                        </div>   
                    </div> 
                    

                </div>

                <div style = {{width: "100vw"}}>
                <Alert show = {this.state.showOppInfo}
                    variant = "info"
                    dismissable>
                    <Alert.Heading>
                        Little update on your opponents progress...
                    </Alert.Heading>
                    <p>
                        They currently have passed {this.state.oppNumCorrect} cases, have a run time of {this.state.oppRunTime} ms and are using {this.state.oppMemory} KBs of memory.
                    </p>
                </Alert>

                <Alert show = {this.state.showGameFinished}
                    variant = "info"
                    dismissable>

                    <Alert.Heading>
                        {this.state.winnerInfo}
                    </Alert.Heading>

                    <p>Your game data looked like:<br></br>{this.state.yourFinishInfo}<br></br><hr></hr>Their data looked like: <br></br>{this.state.theirFinishInfo}</p>
                </Alert>

                <Alert show = {this.state.showConfirmLeave}
                    variant = "info"
                    dismissable>

                    <Alert.Heading>
                        Are you sure you would like to leave?
                    </Alert.Heading>

                    <p>Be warned, abandoning incurs a cooldown!</p>
                    <hr></hr>

                    <Button 
                        onClick={this.confirmedAbandon}
                    >Leave</Button>   
                    <Button 
                        onClick={this.closeConfirmLeave}
                    >Nevermind</Button>   
                </Alert>


                    
                    <div class ="row justify-content-center" style ={{ height: "8vh" }}>
                    <text
                        style={{
                            fontFamily: "monospace",
                            fontSize: "30px"
                        }}
                        className="brand-logo black-text"
                        >
                        <i className="material-icons">code</i>
                            CompCoder
                    </text>
                    </div>

                    <div class ="d-flex justify-content-between" style ={{ height: "8vh" }}>
                        
                        <button 
                            type="submit"
                            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                            onClick ={this.back}
                            style = {{marginLeft: "20px"}}>
                        
                            <i class="fas fa-cog fa-fw"></i> Back
                        </button>
                        <div style ={{marginRight: "3vw"}}>
                            <Timer timesUp = {this.timesUp} intervalUpdate = {this.intervalUpdate}/>
                        </div>

                    </div>
                    
                    <div class ="row justify-content-center" style ={{ height: "65vh" }}>
                    <Col xs = {8}>
                        <Editor
                        required
                        height="65vh"
                        defaultLanguage= "java"
                        defaultValue = {DS}
                        name="solution"
                        id="source"
                        onChange={this.input}
                        editorProps={{blockingScroll:true}}>
                            {DS}
                        </Editor>
                    </Col> 

                    <Col xs = {3}>
                        <textarea 
                        id = "output">
                            {this.state.output}
                        </textarea>
                    </Col>
                    </div>

                    <div class ="row justify-content-center" style ={{ height: "9vh" }}>   

                    <button
                        style={{
                            width: "150px",
                            borderRadius: "3px",
                            letterSpacing: "1.5px",
                            marginTop: "1rem"
                        }}
                        type="submit"
                        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                        onClick={this.submit}
                    >
                    <i class="fas fa-cog fa-fw"></i> Run
                    </button>
                    <text id="warningText"></text>
                    </div>

                        
            
            </div> 
        </PanelGroup>
        </div>
        
   
                    
                
        
        );
    }
}
   

ChallengePage.propTypes = {
    updateUserRank: PropTypes.func.isRequired,
    coolDown: PropTypes.func.isRequired,

    removeChallenge: PropTypes.func.isRequired,
    challengeUser: PropTypes.func.isRequired,
    challenge: PropTypes.object.isRequired,
    isChallenge: PropTypes.bool.isRequired,

    room: PropTypes.string.isRequired,
    isRoom: PropTypes.bool.isRequired,
    removeRoom: PropTypes.func.isRequired,

    user: PropTypes.object.isRequired


  };
  
  const mapStateToProps = state => ({
    challenge: state.auth.challenge,
    isChallenge: state.auth.isChallenge,
    room: state.auth.room,
    isRoom: state.auth.isRoom,

    user: state.auth.user
  });

export default connect(
    mapStateToProps,
    { removeChallenge, removeRoom, challengeUser, updateUserRank, coolDown}
)(ChallengePage);    