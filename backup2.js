"use strict";

exports.createReducerAndMiddleware = function (model) {

    function reducer(state, act) {
        state = state || {};
        if ( (act.type === 'ASYNC_UPDATE' || act.type === 'UPDATE') && act.newState !== undefined ) {
            var obj = {};
            for (var key in state) {
                obj[key] = state[key];
            }
            obj[act.prop] = act.newState;
            return obj;
        }
    }

    function middleware (store) {
        return function (next) {
            return function (act) {
                if (act.type === 'ACTION' && act.method !== undefined) {
                    return new Promise(function (resolve, reject) {
                        next(act);
                        model[act.prop].setState = function (newState) {
                            var newAction = store.dispatch({ type: 'ASYNC_UPDATE', prop: act.prop, newState: newState });
                            resolve(newState);
                            return newAction;
                        }
                        var newState = model[act.prop][act.method].apply(model[act.prop], act.args);
                        model[act.prop].setState = null;
                        if (newState !== undefined) {
                            store.dispatch({ type: 'UPDATE', prop: act.prop, newState: newState });
                        }
                    });
                }
                return next(act);
            };
        };
    };

    return { reducer: reducer, middleware: middleware };
}

exports.createDispatcher = function (model, store) {
    var dispatcher = {};
    function createGetState(prop) {
        return function () {
            return store.getState()[prop];
        };
    }
    for (var prop in model) {
        dispatcher[prop] = {};
        for (var method in model[prop]) {
            if (typeof model[prop][method] === 'function') {
                dispatcher[prop][method] = function () {
                    return store.dispatch({ type: 'ACTION', prop: prop, method: method, args: arguments });
                };
            } else {
                throw new Error('All properties of the model should be methods');
            }
        }
        model[prop].getState = createGetState(prop);
    }

    return dispatcher;
};