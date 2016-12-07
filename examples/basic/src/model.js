import { createController } from '../../../modelux';
import delay from 'delay';
export default createController({
    times: {
        initial: {
            active: 8
        },
        add: function (n) {
            n = n || 1;
            var other = this.getState(['other', 'times']);
            var s = this.getState();
            delay(1000)
                .then(() => this.setState({active: s.active + other.active + n}))
                .then(this.resolve);
            return {active: 'loading...'};
        },
        remove: function (n) {
            n = n || 1;
            var other = this.getState(['other', 'times']);
            var s = this.getState();
            delay(1000)
                .then(() => this.setState({active: s.active - other.active - n}))
                .then(this.resolve);
            return {active: 'loading...'};
        }
    },
    other: {
        add: function () {
            this.times.oneMore();
        },
        times: {
            initial: function () {
                return {
                    active: 3
                }
            },
            oneMore: function () {
                var s = this.getState()
                delay(1000)
                    .then(() => this.setState({active: ++s.active}))
                    .then(this.resolve);
                return {active: 'loading...'};
            }
        }
    }
});
