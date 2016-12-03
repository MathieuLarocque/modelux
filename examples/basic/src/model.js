import { createController } from '../../../modelux';
var m = {
    times: {
        initial: {
            active: 8
        },
        add: function (n) {
            var s = this.getState(['other', 'times']);
            n = n || 1;
            // var setState = this.createSetState();
            var {setState} = this;
            console.log(s, n, arguments);
            setTimeout(() => {
                setState({active: s.active + n})
                .then(() => this.remove(s))
                .then(function (a) {
                    console.log('React is done rendering:', a);
                });
            }, 1000);
            return {active: 'loading...'};
        },
        remove: function (s) {
            var {setState} = this;
            console.log(s);
            setTimeout(() => {
                setState({active: s.active - 1})
            }, 1000);
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
                var s = this.getState();
                // var setState = this.createSetState();
                var {setState} = this;
                setTimeout(() => {
                    setState({active: ++s.active})
                    .then(function (a) {
                        console.log('React is done rendering:', a);
                    });
                }, 2000);
                return {active: 'loading...'};
            }
        }
    }
};
// console.log(m);
export var c = createController(m);
console.log(c);

var m2 = {
    otherProp: {
        initial: 'another thing',
        change: function () {
            return 'that same thing';
        }
    }
}
export var c2 = createController(m2);
// var v = createController({
//     c: c,
//     featureX: {
//         initial: 'hello'
//     }
// });
// console.log(v);

// export default c;