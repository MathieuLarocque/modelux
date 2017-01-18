import React, { PropTypes } from 'react'
import model from '../../model'
var x = 5;
export default class Todo extends React.Component {
  constructor(props) {
    super(props);
    if (props.text !== 'dont bind') {
      model.color.bind(this);
    }
    // console.log(this.componentWillMount);
  }
  componentWillMount() {
    console.log('mounting', this, x)
  }
  componentDidMount() {
    console.log('mounted', this, x);
  }
  componentWillUnmount() {
    console.log('unmounting', this, x)
  }
  render() {
    console.log('rendering');
    var { onClick, completed, text } = this.props;
    return (
      <span
        onClick={onClick}
        style={{
          textDecoration: completed ? 'line-through' : 'none',
          color: this.state ? this.state.color || 'blue' : 'blue'
        }}
      >
        {text}
      </span>
    )
  }
}

// const Todo = ({ onClick, completed, text, id }) => (
//   <span
//     onClick={onClick}
//     style={{
//       textDecoration: completed ? 'line-through' : 'none'
//     }}
//   >
//     {text}
//   </span>
// )

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

// export default Todo
