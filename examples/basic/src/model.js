import { createModel } from '../../../modelux';
import delay from 'delay';

export default createModel({
    add: function () {
        this.setState(delay(2000)
            .then(() => (s, g) => ({
                active: s.active + 1,
                color: s.color === 'red' ? 'green' : 'red'
            }))
        );
        return (s, g) => delay(1000)
            .then(() => ({
                active: s.active + 1,
                color: s.color === 'red' ? 'green' : 'red'
            }));
    },
    times: {
        initialState: {
            active: 5,
            color: 'red'
        }
    },
    other: {
        initialState: function () {
            return {
                active: 3,
                color: 'green'
            }
        }
    }
});
