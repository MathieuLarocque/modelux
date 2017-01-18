import { createController } from '../../../modelux';
var counter = 0;
export default createController({
    todos: {
        initial: [],
        add: function(text) {
            var todo = {
                id: counter++,
                text: text,
                completed: false
            };
            return this.getState().concat(todo);
        },
        remove: function (id) {
            return this.getState().filter(todo => todo.id !== id);
        },
        toggle: function(todoId) {
            return this.getState().map(todo => {
                if (todo.id === todoId) {
                    todo.completed = !todo.completed;
                }
                return todo;
            });
        }
    },
    filter: {
        initial: 'SHOW_ALL',
        set: function(newFilter) {
            return newFilter;
        }
    },
    color: {
        initial: 'red',
        toggle: function () {
            var s = this.getState();
            if (s === 'red') {
                return 'green'
            } else {
                return 'red'
            }
        }
    }
});
