import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from"jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import setChallengeToken from "./utils/setChallengeToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import { setCurrentChallenge, dispatchRoomToken } from "./actions/challengeActions";
import { Link } from "react-router-dom";

import {Provider} from "react-redux";
import store from "./store";
import socket from "./socket";

import './App.css';

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import BugReport from "./components/dashboard/BugReport";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/private-route/PrivateRoute";
import Dashboard from "./components/dashboard/Dashboard";
import ChallengeSelect from "./components/dashboard/ChallengeSelect";
import ChallengePage from "./components/dashboard/ChallengePage";


if(localStorage.userToken) {
  const token = localStorage.userToken;
  setAuthToken(token);

  const decoded = jwt_decode(token);
  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}

if(localStorage.challengeToken) {
  const token = localStorage.challengeToken;
  setChallengeToken(token);

 const decoded = jwt_decode(token);
  store.dispatch(setCurrentChallenge(decoded));
}

if(localStorage.roomToken) {
  const token = localStorage.roomToken;

  const decoded = jwt_decode(token);
  store.dispatch(dispatchRoomToken(decoded));
}

function App() {
  return (
    <Provider store = {store}>
      <Router>
          <div className="App">
          <Route exact path = "/" component={Landing} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path = "/bugReport" component ={BugReport} />
          <Switch>
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path ="/challengeSelect" component={ChallengeSelect}/>
              <PrivateRoute exact path ="/challengePage" component={ChallengePage}/>
          </Switch>
          </div>
      </Router>
    </Provider>
  );
}

export default App;
