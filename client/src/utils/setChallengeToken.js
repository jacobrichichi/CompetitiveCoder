import axios from "axios";
const setChallengeToken = token => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common["Challenge"] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["Challenge"];
  }
};
export default setChallengeToken;