import { createController } from '../../../modelux';
import delay from 'delay';
import N from './N';
function addUp (s, g, n) {
    var ns = s.value;
    for (var i = 0; i < N; i++) {
        if (i !== n) {
            ns += g(i).value;
        }
    }
    return ns;
}
var mod = n => ({
    initialState: {
        value: 1,
        paused: false,
        pending: 0
    },
    add: function () {
        // var {setState} = this;
        // delay(1000*n)
        // .then(() => setState((s, g) => ({
        //     value: addUp(s, g, n) - s.pending,
        //     paused: false
        // })));
        this.setState(delay(1000*n)
            .then(() => (s, g) => ({
                value: addUp(s, g, n) - s.pending,
                paused: false
        })));
        
        return (s, g) => ({
            pending: addUp(s, g, n),
            paused: true
        });
    }
})
var Model = {}
for (var i = 0; i < N; i++) {
    Model[i] = mod(i);
}
export default createController(Model);
