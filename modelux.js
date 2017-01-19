"use strict";
var Immutable = require('immutable');

function createReactListener (comp) {
    return {
        comp: comp,
        func: function (newState, piecePath, resolve) {
            // console.log(comp.state, newState);
            comp.state = comp.state || {};
            var temp = comp.state;
            if (!piecePath) {
                throw new Error('no piece path in listener');
            }
            for (var i = 0; i < piecePath.length; i++) {
                var piece = piecePath[i];
                if (i < (piecePath.length - 1)) {
                    if (typeof temp[piece] !== 'object') {
                        temp[piece] = {};
                    }
                    temp = temp[piece];
                } else {
                    temp[piece] = newState;
                }
            }
            // console.log(comp.state, newState);
            if (resolve) {
                comp.setState.call(comp, comp.state, function () {
                    resolve(comp.state)
                });
            } else {
                comp.setState.call(comp, comp.state);
            }
        }
    }
}
function createSubscriber (listeners) {
    return function (listener) {
        if (typeof listener === 'function' && listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }
}

function ModeluxController (model, listeners, store) {
    function createGetState(piecePath) {
        return function (arg) {
            if (arg && typeof arg === 'object' && arg.length) {
                return store.getIn(arg);
            } else if (arg && typeof arg === 'string') {
                return store.get(arg);
            }
            return store.getIn(piecePath);
        };
    }
    function createSetState(piecePath, listeners) {
        // console.log(piecePath, listeners);
        return function (newState) {
            if (typeof newState === 'function' || newState instanceof Promise) {
                throw new Error('You cannot set the state to a function or a promise');
            }
            store = store.setIn(piecePath, newState);
            for (var i in listeners) {
                listeners[i].func(newState, piecePath);
            }
            return Promise.resolve(newState);
        };
    }
    function createControllerMethod (model, controller, listeners, piecePath, piece) {
        // var setState = controller.setState;
        // console.log(controller);
        return function () {
            var args = arguments;
            return new Promise(function (resolve, reject) {
                controller.resolve = resolve;
                controller.reject = reject;
                controller.resolveSetState = function (newState) {
                    controller.setState(newState);
                    resolve(newState);
                }
                // console.log(args.length);
                var newState = model[piece].apply(controller, args);
                // console.log(piece, model[piece], newState);
                controller.reject = function () {
                    throw new Error('The reject function is only available synchronously. Make sure you retrieve it from the "this" object before using it asynchronously. For example, you can use destructuring like so:  var { reject } = this;');
                };
                controller.resolve = function () {
                    throw new Error('The resolve function is only available synchronously. Make sure you retrieve it from the "this" object before using it asynchronously. For example, you can use destructuring like so:  var { resolve } = this;');
                };
                controller.resolveSetState = function () {
                    throw new Error('The resolveSetState function is only available synchronously. Make sure you retrieve it from the "this" object before using it asynchronously. For example, you can use destructuring like so:  var { resolveSetState } = this;');
                };
                if (newState !== undefined) {
                    // console.log(controller)
                    controller.setState(newState);
                }
            });
        }
    }
    function createBinder (listeners, piecePath, piece) {
        return function (comp) {
            // console.log(comp.state);
            comp.state = comp.state || {};
            if (piecePath && piecePath.length) {
                var path = [].concat(piecePath, piece);
                var initialValue = store.getIn(path);
                // console.log(path, piece, initialValue);
                var temp = {};
                var root = temp;
                for (var i = 1; i < path.length; i++) {
                    if (i < (path.length - 1)) {
                        temp[path[i]] = {};
                        temp = temp[path[i]];
                    } else {
                        temp[path[i]] = initialValue;
                    }
                    // console.log(temp)
                }
                comp.state[path[0]] = root;
            } else {
                var initialValue = store.get(piece);
                comp.state[piece] = initialValue;
            }
            // console.log(comp.componentWillMount);
            
            if (typeof comp.componentWillMount === 'function') {
                var compComponentWillMount = comp.componentWillMount;
                comp.componentWillMount = function () {
                    listeners.push(createReactListener(comp));
                    compComponentWillMount.call(comp);
                }
            } else {
                comp.componentWillMount = function () {
                    listeners.push(createReactListener(comp));
                }
            }
            if (typeof comp.componentWillUnmount === 'function') {
                var compComponentWillUnmount = comp.componentWillUnmount;
                comp.componentWillUnmount = function () {
                    var i = listeners.findIndex(function (l) {
                        return l.comp === comp
                    })
                    listeners.splice(i, 1);
                    compComponentWillUnmount.call(comp);
                }
            } else {
                comp.componentWillUnmount = function () {
                    var i = listeners.findIndex(function (l) {
                        return l.comp === comp
                    })
                    listeners.splice(i, 1);
                }
            }
            
            // console.log(comp.state);
            // console.log(comp);
            return initialValue;
        }
    }
    // function recursiveLoop (model, controller, listeners, piecePath) {
    
    for (var piece in model) {
        if (model.hasOwnProperty(piece)) {
            if (typeof model[piece] === 'object' && piece !== 'initial') {
                listeners[piece] = [];
                controller[piece] = {};
                controller[piece].getState = createGetState(newpiecePath);
                controller[piece].setState = createSetState(newpiecePath, listeners[piece]);
                controller[piece].subscribe = createSubscriber(listeners[piece]);
                controller[piece].bind = createBinder(listeners[piece], piecePath, piece);
                recursiveLoop(model[piece], controller[piece], listeners[piece], newpiecePath);
            }
        }
    }
            if (model[piece] instanceof ModeluxController) {
                controller[piece] = model[piece];
            } else if (piecePath && typeof model[piece] === 'function' && piece !== 'getState' && piece !== 'setState') {
                controller[piece] = createControllerMethod(model, controller, listeners, piece);
            } else 
             if (piece !== 'initial' && piece !== 'getState' && piece !== 'setState') {
                console.log(piece);
                console.log(model[piece]);
                console.log(model);
                throw new Error('All properties of the model should be methods');
            }
                if (piece === 'initial' && typeof model.initial === 'function') {
                    var newState = model.initial();
                    if (newState !== undefined) {
                        store = store.setIn(piecePath, newState);
                    }
                    // console.log(store.toJSON());
                    
                } else if (piece === 'initial') {
                    store = store.setIn(piecePath, model.initial);
                    // console.log(store.toJSON());
                }
            }
        }
    }
    this.getState = function (arg) {
        if (arg && typeof arg === 'object' && arg.length) {
            return store.getIn(arg);
        } else if (arg && typeof arg === 'string') {
            return store.get(arg);
        }
        return store.toJSON();
    }
    recursiveLoop(model, this, listeners);   
}

exports.createController = function (globalModel) {
    var globalListeners = {}; 
    var store = Immutable.Map({});
    return new ModeluxController(globalModel, globalListeners, store);
};