"use strict";
var Immutable = require('immutable');

function createReactListener (comp) {
    return function (newState, propPath, resolve) {
        // console.log(comp.state, newState);
        comp.state = comp.state || {};
        var temp = comp.state;
        if (!propPath) {
            throw new Error('no prop path in listener');
        }
        for (var i = 0; i < propPath.length; i++) {
            var prop = propPath[i];
            if (i < (propPath.length - 1)) {
                if (typeof temp[prop] !== 'object') {
                    temp[prop] = {};
                }
                temp = temp[prop];
            } else {
                temp[prop] = newState;
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

function createSubscriber (listeners) {
    return function (listener) {
        if (typeof listener === 'function' && listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }
}

function ModeluxController (model, listeners, store) {
    function createGetState(propPath) {
        return function (arg) {
            if (arg && typeof arg === 'object' && arg.length) {
                return store.getIn(arg);
            } else if (arg && typeof arg === 'string') {
                return store.get(arg);
            }
            return store.getIn(propPath);
        };
    }
    function createSetState(propPath, listeners) {
        // console.log(propPath, listeners);
        return function (newState) {
            if (typeof newState === 'function' || newState instanceof Promise) {
                throw new Error('You cannot set the state to a function or a promise');
            }
            store = store.setIn(propPath, newState);
            for (var i in listeners) {
                listeners[i](newState, propPath);
            }
            return Promise.resolve(newState);
        };
    }
    function createControllerMethod (model, controller, listeners, propPath, prop) {
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
                var newState = model[prop].apply(controller, args);
                // console.log(prop, model[prop], newState);
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
    function createBinder (listeners, propPath, prop) {
        return function (comp) {
            // console.log(comp.state);
            comp.state = comp.state || {};
            if (propPath && propPath.length) {
                var path = [].concat(propPath, prop);
                var initialValue = store.getIn(path);
                // console.log(path, prop, initialValue);
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
                var initialValue = store.get(prop);
                comp.state[prop] = initialValue;
            }
            listeners.push(createReactListener(comp));
            // console.log(comp.state);
            // console.log(comp);
            return initialValue;
        }
    }
    function recursiveLoop (model, controller, listeners, propPath) {
        for (var prop in model) {
            if (model.hasOwnProperty(prop)) {
                if (model[prop] instanceof ModeluxController) {
                    controller[prop] = model[prop];
                } else if (propPath && typeof model[prop] === 'function' && prop !== 'getState' && prop !== 'setState') {
                    console.log(controller);
                    controller[prop] = createControllerMethod(model, controller, listeners, propPath, prop);
                } else if (typeof model[prop] === 'object' && prop !== 'initial') {
                    listeners[prop] = [];
                    controller[prop] = {};
                    propPath = propPath || [];
                    var newPropPath = [].concat(propPath, prop);
                    // console.log(newPropPath);
                    controller[prop].getState = createGetState(newPropPath);
                    controller[prop].setState = createSetState(newPropPath, listeners[prop]);
                    controller[prop].subscribe = createSubscriber(listeners[prop]);
                    controller[prop].bind = createBinder(listeners[prop], propPath, prop);
                    recursiveLoop(model[prop], controller[prop], listeners[prop], newPropPath);
                } else if (prop !== 'initial' && prop !== 'getState' && prop !== 'setState') {
                    console.log(prop);
                    console.log(model[prop]);
                    console.log(model);
                    throw new Error('All properties of the model should be methods');
                }
                if (prop === 'initial' && typeof model.initial === 'function') {
                    var newState = model.initial();
                    if (newState !== undefined) {
                        store = store.setIn(propPath, newState);
                    }
                    // console.log(store.toJSON());
                    
                } else if (prop === 'initial') {
                    store = store.setIn(propPath, model.initial);
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