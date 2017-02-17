import React from 'react'
import { render } from 'react-dom'
import App from './components/App'

// import { createStore } from 'redux';
// import model from './model'

// function reducer (state, action) {
//   return model.getState();
// }
// var initialState = model.getState();
// var enhancer = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
// var store = createStore(reducer, initialState, enhancer);
// store.subscribe(() => {
//   var s = store.getState();
// console.log('s', s);
//   model.setState(s);
// })
// model.subscribe(store.dispatch);
render(
    <div><App /></div>,
  document.getElementById('root')
)
