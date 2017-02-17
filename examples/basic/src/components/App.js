import React from 'react'
import model from '../model'

export default class App extends React.Component {
  constructor(){
    super()
    model.times.bind(this);
    model.other.bind(this);
  }
  render(){
    // console.log(this.state)
    return (
      <div>
        <div>you clicked 
        <span style={{color: this.state.times.color}}>
          : {this.state.times.active} times
        </span> and<span style={{color: this.state.other.color}}>
          : {this.state.other.active} other
        </span> times</div>
        <button onClick={e => {
          // console.log('hi');
          model.times.add().then(ns => {
            // console.log('nsApp', ns)
          });
        }}>add</button>
        <button onClick={model.other.add}>other add</button>
        <button onClick={e => model.dispatch({type: 'CALL', piece: 'times', method: 'add', args: {}})}>dispatch</button>
      </div>
    )
  }
}
