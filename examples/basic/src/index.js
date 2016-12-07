import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import model from './model'

model.times.subscribe(function (newState, propPath, callback) {
  console.log('times has changed', newState, propPath, callback);
  if (callback)
    callback();
});

render(
    <div><App /></div>,
  document.getElementById('root')
)
