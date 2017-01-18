import React from 'react'
import Footer from './components/Footer'
import Coloring from './components/Coloring'
import AddTodo from './containers/AddTodo'
import VisibleTodoList from './containers/VisibleTodoList'

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
    <Coloring />
  </div>
)

export default App
