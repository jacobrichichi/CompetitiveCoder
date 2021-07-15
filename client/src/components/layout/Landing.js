import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import Button from "react-bootstrap";

class Landing extends Component {


  render() {
    return (
      <div className = "landingbg"> 
       <div style={{ height: "10vh" }} className="row">
      <div className = "col s12 center-align">
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
      </div>
      
        <div className="row justify-content-center" style = {{marginTop: "7vh", marginBottom: "7vh"}}>
            <h2>
              <b>Challenge</b> yourself, become a better programmer{" "}
            
            </h2>
          </div>  

          <div className="row justify-content-center" style = {{marginTop: "7vh", marginBottom: "7vh", marginLeft: "15vw", marginRight: "15vw"}}>
            <p className="flow-text grey-text text-darken-1">
              Face off in a head to head challenge against real programmers around the world! Pass those test cases, and cut that runtime if you want to come out on top!
            </p>
            <br />
            </div>
            <div className="row justify-content-center">
              <Link to = "/register">
              <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
                marginRight: "100px"
              }}

              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Register
            </button>
            </Link>
            <Link to = "/login">
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
                marginLeft: "100px"
              }}


              onClick={this.toLoginPage}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Login
            </button>
            </Link>
            </div>
          
          </div>
    );
  }
}
export default Landing;