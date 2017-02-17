import { createModel } from '../../../modelux';
// import delay from 'delay';
var counter = 0;
export default createModel({
    todos: {
        initialState: {
            list: []
        },
        add: function(text) {
            var c = counter++;
            this.setState(state => state.list.map(t => {
                if (t.id !== c) {
                    return t;
                } else {
                    return {
                        ...t,
                        color: 'green'
                    }
                }
            }));
            return state => state.list.map(t => {
                if (t.id !== c) {
                    return t;
                } else {
                    return {
                        id: c,
                        text: text,
                        completed: false,
                        color: 'blue'
                    }
                }
            });
        },
        toggle: function(todoId) {
            return state => state.map(todo => {
                if (todo.id === todoId) {
                    todo.completed = !todo.completed;
                }
                return todo;
            });
        }
    },
    filter: {
        initialState: {current: 'SHOW_ALL'},
        set: function(newFilter) {
            return newFilter;
        }
    }
});
