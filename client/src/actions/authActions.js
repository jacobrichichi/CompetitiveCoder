import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING
} from "./types";
// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login")) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      // Save to localStorage
// Set token to localStorage
      console.log(res.data);
      const { token } = res.data;
      localStorage.setItem("userToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const updateUserRank = (userData) => dispatch => {
  console.log('action userData');
  console.log(userData);
  axios.post("/api/users/updateUserRank", userData)
  .then(res => {
    const {token} = res.data;
    console.log('just posted');
   /* localStorage.removeItem("userToken");
    setAuthToken(false);
    dispatch(setCurrentUser({}));*/
    console.log('setting local storage')

    localStorage.setItem("userToken", token);
    console.log('setting authtoken')
    setAuthToken(token);
    const decoded = jwt_decode(token);
    console.log('dispatching');
    dispatch(setCurrentUser(decoded));
  })
  .catch(err => {
    console.log(err);
    dispatch({
      type: GET_ERRORS,
      payload:err.response.data
    })
  });
};

export const coolDown = (userData) => dispatch => {
  axios.post("/api/users/coolDown", userData)
  .then(res => {
    const {token} = res.data;
    console.log('setting local storage')

    localStorage.setItem("userToken", token);
    console.log('setting authtoken')
    setAuthToken(token);
    const decoded = jwt_decode(token);
    console.log('dispatching');
    dispatch(setCurrentUser(decoded));
  })
  .catch(err => {
    console.log(err);
    dispatch({
      type: GET_ERRORS,
      payload:err.response.data
    })
  });
};


export const endCoolDown = (userData) => dispatch => {
  axios.post("/api/users/endCoolDown", userData)
  .then(res => {
    const {token} = res.data;
    console.log('setting local storage')

    localStorage.setItem("userToken", token);
    console.log('setting authtoken')
    setAuthToken(token);
    const decoded = jwt_decode(token);
    console.log('dispatching');
    dispatch(setCurrentUser(decoded));
  })
  .catch(err => {
    console.log(err);
    dispatch({
      type: GET_ERRORS,
      payload:err.response.data
    })
  });
};

export const setIsCompetitive = (userData) => dispatch => {
  axios.post("/api/users/setIsCompetitive", userData)
    .then(res => {

    })
} 


// Set logged in user
export const setCurrentUser = decoded => {
  
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};
// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};


// Log user out
export const logoutUser = () => dispatch => {       //Apply this to Challenge
  // Remove token from local storage
  localStorage.removeItem("userToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};


