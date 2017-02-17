import React, { PropTypes } from 'react'
// import model from '../../model'

export default class Todo extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // if (props.text !== 'dont bind') {
  //   //   // model.color.bind(this);
  //   // }
  // }
  render() {
    console.log('rendering');
    var { onClick, completed, text, color } = this.props;
    return (
      <span
        onClick={onClick}
        style={{
          textDecoration: completed ? 'line-through' : 'none',
          color: color || 'blue'
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
