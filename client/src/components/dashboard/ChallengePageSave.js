/*import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { removeChallenge } from "../../actions/challengeActions";
import "unirest";
import "./ChallengePage.css";
import Stopwatch from "./Stopwatch";




class ChallengePage extends Component { 
    constructor(props){
        super(props);

        this.state ={
            input: '',
            output: '',
            language_id: 62,
            user_input: ''

        };
    }

    back = (event) => {
        event.preventDefault();
        this.props.removeChallenge();
        this.props.history.push("/dashboard");
    }

    input = (event) => {
        event.preventDefault();
        this.setState({ input: event.target.value});
    };

    userInput = (event) => {
        event.preventDefault();
        this.setState({ user_input: event.target.value });
      };

    submit = async (e) =>{
        e.preventDefault();
        let outputText = document.getElementById("output");
        const { challenge } = this.props.challenge;

        var j = 0;
        var str2 = ''; 
        var str3 = this.state.input;

        //Building the main method tha t will be used to invoke the user made method, and adding an import of Scanner at the beginning
    
        var str4 ='public static void main(String[]args){ \nSystem.out.print(' + challenge.methodName+ '(';

        var str5 = '';

        var correct = true;

        var userOutputs = {};
        var userOutputsCorrect = {};
        console.log(challenge.outputs);
        var w = 0;

        for(var j = 0; j<challenge.inputs.length; j++){         //custom inputs placed into user method call(built in stdin from API doesnt work for objects :/)
            outputText.innerHTML = "Case " + j + " running...";
            for(var k = 0; k<challenge.inputs[j].length; k++){
                str5 = str5 + "\"" + challenge.inputs[j][k] + "\"";
                if(k<challenge.inputs[j].length-1)
                    str5= str5 + ', ';
            }
        
            while(str3.length>0){
                w = str3.indexOf('\n');
                if(str3.indexOf("public class Main")!==0){      //Toss a main method in there that calls the input method and passes into it the subject input
                    str2 = str2 + str3.substring(0, w+1);
                    str3 = str3.substring(w+1, str3.length);
                }
                else{
                    str2 = str2 + "\n" + challenge.dataStructure + "\n" + str3.substring(0, w+1);
                    str3 = str3.substring(w+1, str3.length);
                    str5 = str4 + str5 + "));\n}";
                    str2 = str2.concat(str5, str3);
                    break;
                }
            }   
        console.log(str2);

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
                    //stdin: '',
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
            str5 = '';  //reset str5 for next set of inputs
            str2 = '';
            str3 = this.state.input;

        if(jsonGetSolution.stdout){
            userOutputs[j] = atob(jsonGetSolution.stdout);
            console.log(typeof userOutputs[j]);
            console.log(userOutputs[j]);
            console.log(typeof challenge.outputs[j]);
            console.log(challenge.outputs[j]);
            if(userOutputs[j] === challenge.outputs[j].toString()){
                userOutputsCorrect[j] = true;
            
            }    
            else{
            
                correct = false;
                userOutputsCorrect[j] = false;
            }
        }    
        else if(jsonGetSolution.stderr){
            userOutputs[j] = atob(jsonGetSolution.stderr);
            userOutputsCorrect[j] = false;
            correct = false;
        }

        else{
            userOutputs[j] = atob(jsonGetSolution.compile_output);
            userOutputsCorrect[j] = false;
            correct = false;
        }
        }

        str2 = "Did all test cases pass?: " + correct +"\n---------------------------------------\n";


        for(var j = 0; j<challenge.outputs.length; j++){
            str2 = str2 + "Input(s): " + challenge.inputs[j] + "\nYour Output: " + userOutputs[j] + "\nExpected Output: " + challenge.outputs[j] + "\nOutput correct?: " + userOutputsCorrect[j] + "\n-------------------------------------------\n";
        }

        outputText.innerHTML = str2;
    };

    render(){

        const { challenge } = this.props.challenge;

        var DS = " \n";
        if(challenge.dataStructure!=="  ")
            DS = "/*\n" + challenge.dataStructure + "\n\n";

        DS = DS + "public class Main{\n\tpublic static "+ challenge.outputType + " " + challenge.methodName + "(";
        for(var l = 0; l<challenge.inputTypes.length; l++){
            DS = DS + challenge.inputTypes[l] + " " + challenge.inputVarNames[l];
            if(l<challenge.inputTypes.length-1)
                DS = DS + ", ";
        }
        DS = DS + "){\n\n\t}\n}";


        return(
                <div class ="row">
                    <div class = "col s1 left-align">
                        <button 
                            type="submit"
                            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                            onClick ={this.back}
                        >
                            <i class="fas fa-cog fa-fw"></i> Back
                        </button>

                    </div>
                    <div class = "col s11 right-align">
                        <Stopwatch/>
                    </div>


                    <div class="col s12">
                        <h4>
                        <p>{challenge.name}</p>
                        </h4>
                    </div>
                    <div class ="col s12">
                        <h6><p>{challenge.description}</p></h6>
                    </div>
                    <div class = "col s8">
                        <textarea
                        required
                        name="solution"
                        id="source"
                        onChange={this.input}
                        className="source">
                            {DS}
                        </textarea>

                    </div>

                    <div class = "col s4">
                        <textarea 
                        id = "output">
                            {this.state.output}
                        </textarea>
                        
                    </div>
                    <div class = "col s2 left-align">
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
                    </div>

                </div>
        
        
   
                    
                
        
        );
    }
}
   

ChallengePage.propTypes = {
    removeChallenge: PropTypes.func.isRequired,
    challenge: PropTypes.object.isRequired

  };
  
  const mapStateToProps = state => ({
    challenge: state.auth.challenge
  });

export default connect(
    mapStateToProps,
    { removeChallenge }
)(ChallengePage);    */