import React from 'react'
import model from './model'

export default class Counter extends React.Component {
    constructor(props){
        super(props)
        // console.log(props);
        model[props.n].bind(this);
    }
    render(){
        // console.log(this.state);
        return (
        <div>
            <div>value : {this.state[this.props.n].value}</div>
            <button onClick={e => {
            console.log('hi');
            model[this.props.n].add().then(ns => {
                console.log('nsApp', ns)
            });
            }}>add</button>
        </div>
        )
    }
}