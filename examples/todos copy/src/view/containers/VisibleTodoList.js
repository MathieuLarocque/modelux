import model from '../../model'
import React from 'react'
import Todo from '../components/Todo'

const getVisibleTodos = (todos, filter) => {
  if (!todos) {
    return [];
  }
  todos = todos[0] ? [].concat(todos) : [];
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
    var todos = getVisibleTodos(this.state.todos.list, this.state.filter.current);
    console.log(todos);
    return (
      <ul>
        {todos.map(todo =>
          <li key={todo.id}><Todo
            id={todo.id}
            {...todo}
            onClick={() => model.todos.toggle(todo.id)}
          />
          </li>
        )}
      </ul>
    )
  }
}



