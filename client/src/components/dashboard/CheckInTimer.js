import React, { Component } from 'react';
 
export default class CheckInTimer extends Component {

   state = {minutes: 0, seconds: 30};


  componentWillMount(){

    this.setState(
    {minutes: (localStorage.getItem('checkInMinutes') || 0),
     seconds: (localStorage.getItem('checkInSeconds') || 30)});


    this.checkInterval = setInterval(() => {

      if(this.state.seconds > 0){
        this.setState({
          seconds: this.state.seconds-1
        })
      }

      if(this.state.seconds=== 0){
        if(this.state.minutes===0){
          this.props.timesUp();
          clearInterval(this.checkInterval);
        }
        else{
          this.setState({
              minutes: this.state.minutes-1,
              seconds: 59
           })
        }
      }

      localStorage.setItem('checkInMinutes', this.state.minutes);
      localStorage.setItem('checkInSeconds', this.state.seconds);
    }, 1000)
  }
  componentWillUnmount(){

    clearInterval(this.checkInterval);
    console.log('unmount timer');
    localStorage.removeItem('checkInMinutes');
    localStorage.removeItem('checkInSeconds');

 }

  render(){
    const {minutes, seconds} = this.state;
    return(
      <div>{minutes===0 && seconds === 0 ? <h4>00:00</h4> : <h4>{minutes}: {seconds <10 ? '0' + seconds : seconds}</h4>}</div>
    )
  }
}