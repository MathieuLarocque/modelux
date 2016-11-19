"use strict";
var Immutable = require('immutable');
var store = Immutable.Map({});

exports.createController = function (globalModel) {
    var globalController = {};
    var globalListeners = {};
    function createGetState(propPath) {
        return function (arg) {
            if (arg && typeof arg === 'object' && arg.length) {
                return store.getIn(arg);
            }
            return store.getIn(propPath);
        };
    }
    function recursiveLoop (model, controller, listeners, propPath) {
        for (var prop in model) {
            if (propPath && typeof model[prop] === 'function') {
                controller[prop] = function () {
                    var args = arguments;
                    return new Promise(function (resolve1, reject1) {
                        model.setState = function (newState) {
                            return Promise.all(listeners.map(function (listener) {
                                return new Promise(function (resolve2, reject2) {
                                    store = store.setIn(propPath, newState);
                                    listener(newState, resolve2);
                                    resolve1(newState);
                                });
                            }));
                        }
                        var newState = model[prop].apply(model, args);
                        model.setState = null;
                        if (newState !== undefined) {
                            store = store.setIn(propPath, newState);
                        }
                    });
                };
            } else if (typeof model[prop] === 'object') {
                listeners[prop] = [];
                controller[prop] = {};
                propPath = propPath || [];
                var newPropPath = [].concat(propPath, prop);
                model.getState = createGetState(newPropPath);
                model.bind = function (comp) {
                    comp.state = comp.state || {};
                    if (propPath && propPath.length) {
                        var defaultValue = store.getIn(propPath);
                        var temp = {};
                        var root = temp;
                        for (var i = 1; i < propPath.length; i++) {
                            if (i < (propPath.length - 1)) {
                                temp[propPath[i]] = {};
                                temp = temp[propPath[i]];
                            } else {
                                temp[propPath[i]] = defaultValue;
                            }
                        }
                        comp.state[propPath[0]] = root;
                    } else {

                    }
                    function listener (newState, resolve) {
                        var state = {};
                        for (var i in comp.state) {
                            state[i] = comp.state[i];
                        }
                        for (var k in newState) {
                            state[k] = newState[k];
                        }
                        comp.setState.call(comp, state, resolve)
                    }
                    listeners.push(listener)
                }
                recursiveLoop(model[prop], controller[prop], listeners[prop], newPropPath);
            } else if (prop !== 'default') {
                throw new Error('All properties of the model should be methods');
            }
            if (prop === 'default' && typeof model.default === 'function') {
                model.setState = function (newState) {
                    store = store.setIn(propPath, newState);
                }
                var newState = model.default();
                model.setState = null;
                if (newState !== undefined) {
                    store = store.setIn(propPath, newState);
                }
            }
        }
    }
    recursiveLoop(globalModel, globalController, globalListeners);
    return globalController;
};