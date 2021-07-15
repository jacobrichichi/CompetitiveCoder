import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./BugReport.css";
import { InputGroup, Button, FormControl } from "react-bootstrap";

class BugReport extends Component {
    constructor(props){
        super(props);

        this.state = {
            username: '',
            problem: '',
            email: ''
        }
    }

    submit = (event) => {
        event.preventDefault();

        const templateId = 'basic';
        this.sendFeedback(templateId, {

        })


    }

    sendFeedback = (templateId, variables) => {
        window.emailjs.send(
            'yahoo', templateId, variables)
            .then(res => {

            })
    }

    changeName = (event) => {
        event.preventDefault();
        this.setState({name: event.target.value});
    }

    changeProblem = (event) => {
        event.preventDefault();
        this.setState({problem: event.target.value});
    }


    render(){
        return (
            <div className = "bugreportbg">
            
                <div style= {{width: "70vw", margin: "auto"}}>
                <div className = "d-flex justify-content-center" style = {{marginBottom: "10vh"}}>
                    <span style = {{fontSize: "40px"}}>
                        Oh no, a bug!
                    </span>
                </div>

                <div className = "d-flex justify-content-center">
                    <label htmlFor="basic-url" style = {{fontSize: "25px", color: "black"}}>
                        What's your username?
                    </label>
                </div>

                <div className = "d-flex justify-content-center">
                    <InputGroup className = "mb-3"
                    onChange = {this.changeName}>
                
                    <FormControl
                    placeholder="Username"
                    aria-label="Username"
                    />
                    </InputGroup>
                </div>

                <div className = "d-flex justify-content-center">
                    <label htmlFor="basic-url" style = {{fontSize: "25px", color: "black"}}>
                        What seems to be the issue?
                    </label>
                </div>    
                <div className = "d-flex justify-content-center">
                <InputGroup className = "mb-3" 
                onChange = {this.changeProblem}>
                
                <FormControl as="textarea"
                    placeholder="Explain here"
                    aria-label="explain"
                />
                </InputGroup>
                </div>
                <div className = "d-flex justify-content-center">
                <Button
                onClick = {this.submit}>
                    Submit
                </Button>
                </div>
                </div>
            </div>
        );

    }
}

export default BugReport;