import {
    SET_CURRENT_USER,
    USER_LOADING,
    SET_CHALLENGE,
    SET_ROOM
  } from "../actions/types";
  const isEmpty = require("is-empty");
  const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false,
    challenge: {},
    isChallenge: false,
    room: '',
    isRoom: false
  };
  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_CURRENT_USER:
        return {
          ...state,
          isAuthenticated: !isEmpty(action.payload),
          user: action.payload
        };
      case USER_LOADING:
        return {
          ...state,
          loading: true
        };

      case SET_CHALLENGE:
        return {
          ...state,
          isChallenge: !isEmpty(action.payload),
          challenge: action.payload
        };

        case SET_ROOM:
          return {
            ...state,
            isRoom: !isEmpty(action.payload),
            room: action.payload
          };
          
      default:
        return state;
    }
  }