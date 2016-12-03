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
    }
});
