import model from '../../model'
import React from 'react'
import Todo from '../components/Todo'

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    default:
      throw new Error('Unknown filter: ' + filter)
  }
}

export default class VisibleTodoList extends React.Component {
  constructor(props) {
    super(props);
    model.todos.bind(this);
    model.filter.bind(this);
  }
  render() {
    var todos = getVisibleTodos(this.state.todos, this.state.filter);
    return (
      <ul>
        {todos.map(todo =>
          <li key={todo.id}><Todo
            id={todo.id}
            {...todo}
            onClick={() => model.todos.toggle(todo.id)}
          />
          <button onClick={() => model.todos.remove(todo.id)}>X</button>
          </li>
        )}
      </ul>
    )
  }
}



