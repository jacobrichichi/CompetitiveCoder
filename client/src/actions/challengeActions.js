import axios from "axios";
import setChallengeToken from "../utils/setChallengeToken";
import jwt_decode from "jwt-decode";

import {
  SET_CHALLENGE,
  SET_ROOM
} from "./types";

const jwt = require("jsonwebtoken");

export const challengeUser = (ID) => dispatch => {
  console.log('setChall call');
  console.log(ID);
  axios
    .post("/api/users/getChallenge", ID)
    .then(res => {
      const { token } = res.data;
      localStorage.setItem("challengeToken", token);
      // Set token to Auth header
      setChallengeToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentChallenge(decoded));
    })
    .catch(err =>
      console.log(err));

};

export const setCurrentChallenge = challenge => {
  return {
    type: SET_CHALLENGE,
    payload: challenge
  };
}

  export const removeChallenge = () => dispatch => {
    localStorage.removeItem("challengeToken");
    setChallengeToken(false);
    dispatch(setCurrentChallenge({}));
  };

 export const setCurrentRoom = (room) => dispatch => {

    axios
      .post("api/users/getRoom", room)
      .then(res => {
        const { token } = res.data;
        localStorage.setItem("roomToken", token);
        const decoded = jwt_decode(token);

        dispatch(dispatchRoomToken(decoded));

      })
      .catch(err => 
        console.log(err.response.data));
  }

  export const dispatchRoomToken = room =>{
    return {
      type: SET_ROOM,
      payload: room
    }
  }

  export const removeRoom = () => dispatch => {
    localStorage.removeItem("roomToken");
    dispatch(dispatchRoomToken({}));
  }


