import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { challengeUser } from "../../actions/challengeActions";

class ChallengeSelect extends Component {

    constructor() {
        super();
        this.state = {
          difficulty: ""
        };
      }

    onChallengeClick = e => {
        e.preventDefault();
        const diff = {
            difficulty: this.state.difficulty
        };

        this.props.challengeUser(diff, this.props.history);
      };

      onChange = e => {
        this.setState({ difficulty: e.target.value });
      };

    render(){
        return(
            <div style={{ height: "75vh" }} className="container valign-wrapper">
                <div className="row">
                    <h4>
                        Select your difficulty!
                    </h4>
                    <div class="input-field col s12">
                        <select class="browser-default"
                        onChange = {this.onChange}
                        value = {this.state.difficulty}>
                            <option value="" disabled selected >Choose your difficulty</option>
                            <option value="1">Beginner</option>
                            <option value="2">Intermediate</option>
                            <option value="3">Hard</option>
                            <option value="4">Expert</option>
                        </select>
                
                    </div>

                    <button
                        style={{
                        width: "150px",
                        borderRadius: "3px",
                        letterSpacing: "1.5px",
                        marginTop: "1rem"
                    }}


                    onClick={this.onChallengeClick}
                    className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                    >Go</button>
                    
                </div>
            </div>
        );
    }
}

ChallengeSelect.propTypes = {
    challengeUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };
  
  const mapStateToProps = state => ({
    auth: state.auth
  });

  export default connect(
    mapStateToProps,
    { challengeUser }
  )(ChallengeSelect);