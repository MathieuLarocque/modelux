# modelux
State management library with React in mind

## Disclaimer

This library is a work in progress so do not use in production. In fact, the documentation is also a work in progress.

## Installation

Assuming you are already using npm in your app development, you can download and install Modelux like so:

```
npm i --save modelux
```

## Dependencies

This library uses [ImmutableJS](https://facebook.github.io/immutable-js/) to store the state. The reason is mainly to allow deep getters and setters within the state tree. In other words, it allows using arrays of strings as property names. This will be explained in the this.getState section.

## Getting started

Modelux only gives you 1 function called createController which, when given an object, returns an object with the same shape but can be used to manipulate the state which is kept. I call this returned object the controller but it will look and feel like the original object.

``` javascript
import { createController } from 'modelux';
var model = createController({
    prop: {
        method(arg) {
            return 'new state';
        }
    }
});
```

## model vs controller

You will notice above that I called the result `model` instead of controller. That is because these two words can be used interchangeably. Think of it as a remote and a TV. Saying turn off the tv really means take the remote and click off. The role of the controller is to be a seamless representation of the model. You can call it controller if it pleases you.

## return value

The state can be changed two ways. The first way is to return a value from a method of the model. The return value will become the new state of this specific property in the model. In other words, using the example above and doing

``` javascript
model.prop.method(arg)
```
and then doing this

``` javascript
console.log(model.getState())
```
 will log this:

``` javascript
{
    prop: 'new state'
}
```


## this.setState

The second way is to use the setState function that can be used with the `this` keyword or directly on the model. This way is equivalent to returning but it is meant as an asynchronous mechanism. For example:

``` javascript
var model = createController({
    prop: {
        method(sec) {
            setTimeout(() => this.setState(sec + ' second'+ sec>1 ? 's' : '' +' has passed'), 1000 * sec);
            return 'pending';
        }
    }
});
model.prop.method(1);
model.prop.setState('you can also set state here');
```

## this.getState

Each prop also gets a getState that can be used with the `this` keyword or directly on the model. 

``` javascript
var model = createController({
    prop: {
        method(arg) {
            var currentState = this.getState();
            return currentState + ' changing state';
        }
    }
});
```
The getState function can accept an argument which can be two things. The first is a string corresponding to a first level property. In the example above, `prop` is a first level property so doing this:

``` javascript
model.getState('prop')
```
will return ```'new state changing state'```

The second type of argument is an array of strings that represents the path within the model. For example:

``` javascript
var model = createController({
    prop1: {
        prop2: {
            method(arg) {}
        }
    }
});
model.prop1.prop2.setState('first state');
console.log(model.getState(['prop1', 'prop2']));
```
will log ```'first state'```

## this.resolve and this.reject

All controller method returns a Promise, except for setState and getState. What can be confusing at this point is that every function of the object written by the user is wrapped by the controller. The controller returns a promise that can be resolved from within the model.

``` javascript
var model = createController({
    prop: {
        method(sec) {
            var { resolve } = this;
            setTimeout(() => {
                this.setState(sec + ' second has passed');
                resolve('done');
            }, 1000 * sec);
            return 'pending';
        }
    }
});
model.prop.method(1)
    .then(res => console.log('method is ' + res));
```
will log ```'method is done'``` after 1 second.

There is something very important to note here. I am using destructuring to extract the resolve function from the `this` object. That is necessary for a very specific reason. The resolve function is attached to the object only for the duration of the call of the method and then removed. That is to avoid race conditions where if you call two different methods of the same prop, you have created two promises and it becomes hard to tell which resolve function belongs to which promise. Here is a piece of code from the library to help clarify.

``` javascript
function createControllerMethod (model, controller, listeners, propPath, prop) {
    return function () {
        var args = arguments;
        return new Promise(function (resolve, reject) {
            controller.resolve = resolve;
            controller.reject = reject;
            controller.resolveSetState = function (newState) {
                controller.setState(newState);
                resolve(newState);
            };
            var newState = model[prop].apply(controller, args);
            controller.reject = null;
            controller.resolve = null;
            controller.resolveSetState = null;
            if (newState !== undefined) {
                controller.setState(newState);
            }
        });
    }
}
```

Notice that the controller also has a resolveSetState as a shorthand for both setState and resolve.

## initial

There is a special property name called ```initial``` which is used to set the initial value of the property. If it is a function it will be called on initialisation. It will have access to this.setState function if asynchronous setting is needed.

## using with React

Modelux binds with React components by using the setState function of the component instead of wrapping the component with an extra stateful component, like Redux and Mobx do. This makes using the React dev tools much easier to use. Also, the Redux connect function maps the state properties to the props, making it hard, when reading the component code, to figure out what is a prop passed from the parents component and what is really a state. Here is how you bind the component.

``` javascript
var model = createController({
    prop1: {
        prop2: {
            method(arg) {}
        }
    }
});
class App extends React.Component {
  constructor(props){
    super(props)
    model.prop1.prop2.bind(this);
  }
  render(){
    return (
      <div>
        <div>This is prop2: {this.state.prop1.prop2}</div>
        <button onClick={e => model.prop1.prop2.method()}>Do something</button>
      </div>
    )
  }
}
```

The constructor is used to set a listener that will call setState when this particular property of the model is changed. Because the bind function also returns the initial state, you can also do this with the createClass function this way:

``` javascript
var App = React.createClass({
    getInitialState() {
        return {
            prop1: {
                prop2: model.prop1.prop2.bind(this)
            }
        };
    },
    render(){
        return (
            <div>
            <div>This is prop2: {this.state.prop1.prop2}</div>
            <button onClick={e => model.prop1.prop2.method()}>Do something</button>
            </div>
        )
    }
}); 
```

## Examples

This repo has a todo example and a basic example with some tests. Here is an excerpt from the todos example of this repo.

``` javascript
import { createController } from 'modelux';
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
```

There is no use of asynchronous setting of state in this example and that is where this library truly shines when compared to Redux, where side-effects of actions should be handled in middleware in order to keep reducers purely functional. With Redux, there is no official way to do this, steepening the learning curve for beginners. There are more examples to come to show these potential benefits.