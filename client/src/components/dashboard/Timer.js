import React, { Component } from 'react';
import './ChallengePage.css';
 
export default class Timer extends Component {

   state = {minutes: 0, seconds: 30};


  componentWillMount(){

    this.setState(
    {minutes: (localStorage.getItem('minutes') || 0),
     seconds: (localStorage.getItem('seconds') || 30)});


    this.myInterval = setInterval(() => {

      if(this.state.seconds > 0){
        this.setState({
          seconds: this.state.seconds-1
        })
      }

      if(this.state.seconds=== 0){
        if(this.state.minutes===0){
          this.props.timesUp();
          clearInterval(this.myInterval);
        }
        else{
          if(this.state.minutes===15 || this.state.minutes===10 || this.state.minutes===5 || this.state.minutes === 1){
            this.props.intervalUpdate();
          }
          this.setState({
              minutes: this.state.minutes-1,
              seconds: 59
           })

        }
      }

      localStorage.setItem('minutes', this.state.minutes);
      localStorage.setItem('seconds', this.state.seconds);
    }, 1000)
  }
  componentWillUnmount(){

    clearInterval(this.myInterval);
    console.log('unmount');
    localStorage.removeItem('minutes');
    localStorage.removeItem('seconds');

 }

  render(){
    const {minutes, seconds} = this.state;
    return(
      <div>{minutes===0 && seconds === 0 ? <span style = {{fontFamily: "digital-clock-font", fontSize: "30px"}}>00:00</span> : <span style = {{fontFamily: "digital-clock-font", fontSize: "30px"}}>{minutes}: {seconds <10 ? '0' + seconds : seconds}</span>}</div>
    )
  }
}