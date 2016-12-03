import React from 'react'
import model from '../../model'

export default class AddTodo extends React.Component {
  constructor(props) {
    super(props);
    model.todos.bind(this);
  }
  render() {
      let input

      return (
        <div>
          <form onSubmit={e => {
            e.preventDefault()
            if (!input.value.trim()) {
              return
            }
            model.todos.add(input.value)
            input.value = ''
          }}>
            <input ref={node => {
              input = node
            }} />
            <button type="submit">
              Add Todo
            </button>
          </form>
        </div>
      )
  }
}
