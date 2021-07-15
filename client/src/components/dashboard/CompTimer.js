import React, { Component } from 'react';
 
export default class CompTimer extends Component {

   state = {minutes: 0, seconds: 30};


  componentWillMount(){

    this.setState(
    {minutes: (localStorage.getItem('compMinutes') || 0),
     seconds: (localStorage.getItem('compSeconds') || 30)});


    this.compInterval = setInterval(() => {

      if(this.state.seconds > 0){
        this.setState({
          seconds: this.state.seconds-1
        })
      }

      if(this.state.seconds=== 0){
        if(this.state.minutes===0){
          this.props.timesUp();
          clearInterval(this.compInterval);
        }
        else{
          this.setState({
              minutes: this.state.minutes-1,
              seconds: 59
           })
        }
      }

      localStorage.setItem('compMinutes', this.state.minutes);
      localStorage.setItem('compSeconds', this.state.seconds);
    }, 1000)
  }
  componentWillUnmount(){

    clearInterval(this.compInterval);
    console.log('unmount timer');
    localStorage.removeItem('compMinutes');
    localStorage.removeItem('compSeconds');

 }

  render(){
    const {minutes, seconds} = this.state;
    return(
      <div>{minutes===0 && seconds === 0 ? <h4>00:00</h4> : <h4>{minutes}: {seconds <10 ? '0' + seconds : seconds}</h4>}</div>
    )
  }
}