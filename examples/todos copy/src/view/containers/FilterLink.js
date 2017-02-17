import React from 'react'
// import React, {PropTypes} from 'react'
import model from '../../model'

export default React.createClass({
  getInitialState() {
    return {
      filter: model.filter.bind(this)
    };
  },
  render() {
      if (this.state.filter.current === this.props.filter) {
        return <span>{this.props.children}</span>
      }

      return (
        <a href="#"
          onClick={e => {
            e.preventDefault();
            model.filter.set(this.props.filter);
          }}
        >
          {this.props.children}
        </a>
      )
  }
}); 


// export default class FilterLink extends React.Component {
//   constructor() {
//     super();
//     model.filter.bind(this);
//   }
//   render() {

//       if (this.state.filter === this.props.filter) {
//         return <span>{this.props.children}</span>
//       }

//       return (
//         <a href="#"
//           onClick={e => {
//             e.preventDefault();
//             model.filter.set(this.props.filter);
//           }}
//         >
//           {this.props.children}
//         </a>
//       )
//   }
// }

// FilterLink.propTypes = {
//   filter: PropTypes.string.isRequired
// }