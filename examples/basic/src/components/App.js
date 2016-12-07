import React from 'react'
import model from '../model'

export default class App extends React.Component {
  constructor(){
    super()
    model.times.bind(this);
    model.other.times.bind(this);
  }
  render(){
    // console.log(this.state);
    return (
      <div>
        <div>you clicked {this.state.times.active} times and {this.state.other.times.active} other times</div>
        <button onClick={e => {
          model.times.add(3).then(model.other.add);
        }}>add</button>
        <button onClick={model.other.add}>other add</button>
      </div>
    )
  }
}
