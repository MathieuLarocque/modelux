import React from 'react'
import model from '../model'
    console.log(model);

export default class App extends React.Component {
  constructor(){
    super()
    model.times.bind(this);
    model.other.bind(this);
  }
  render(){
    console.log(this.state)
    return (
      <div>
        <div>you clicked {this.state.times.loading ? 'loading...' : this.state.times.active} times and {this.state.other.active} other times</div>
        <button onClick={e => {
          console.log('hi');
          model.times.add(3).then(ns => {
            console.log('nsApp', ns)
          });
        }}>add</button>
        <button onClick={model.other.add}>other add</button>
      </div>
    )
  }
}
