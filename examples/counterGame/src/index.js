import React from 'react';
import { render } from 'react-dom';
// import App from './components/App'
import Comp from './Comp';
import N from './N';
import model from './model'
// import { createStore, applyMiddleware, compose } from 'redux';


var initialState = model.getState();
console.log(window.devToolsExtension);
function reducer (state, action) {
    if (action.type === 'UPDATE') {
        return model.getState();
    } else if (action.type === 'ACTION') {

    }
}
var store = createStore(reducer, initialState,
    window.devToolsExtension ? window.devToolsExtension() : f => f
);
model.subscribe(function (action) {
    store.dispatch(action);
})

  
// import model from './model'

// model.times.subscribe(function (newState, propPath, callback) {
//   console.log('times has changed', newState, propPath, callback);
//   if (callback)
//     callback();
// });

var App = [];
for (var i = 1; i < N; i++) {
    App.push(<div key={i}><Comp n={i}/></div>);
}

render(
    <div>{App}</div>,
  document.getElementById('root')
)
