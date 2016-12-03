import React from 'react'
import { c, c2 } from '../model'
var model = c;
export default class App extends React.Component {
  constructor(){
    super()
    model.times.bind(this);
    model.times.subscribe(function (newState, propPath, callback) {
      console.log('times has changed', newState, propPath, callback);
      if (callback)
        callback();
    });
    model.other.times.bind(this);
    c2.otherProp.bind(this)
  }
  render(){
    // console.log(this.state);
    return (
      <div>
        <div>you clicked {this.state.times.active} times and {this.state.other.times.active} other and this other thing is {this.state.otherProp} </div>
        <button onClick={e => {
          model.times.add(3);
          model.other.add();
          console.log(model.getState());
          // c2.otherProp.change();
          //.then(a => console.log('Modelux is done setting the state :', a)).then(model.c.other.oneMore);
        }}>add</button>
        <button onClick={model.other.add}>other add</button>
      </div>
    )
  }
}
