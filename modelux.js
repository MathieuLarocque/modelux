"use strict";

function createReactListener (comp) {
    return {
        comp: comp,
        func: function (newState, resolve) {
            // console.log(comp.state, newState);
            if (resolve) {
                comp.setState.call(comp, newState, function () {
                    resolve(newState)
                });
            } else {
                comp.setState.call(comp, newState);
            }
        }
    }
}

function Modelux (controller) {
    var store = {};
    var model = this;
    var listeners = {};
    var subscribers = [];
    function update (s, piece, method, args, isSetState) {
        if (s === undefined) {
            return;
        } else if (typeof s === 'function') {
            // console.log('function:',s);
            return update(s(store[piece], function (piece) {
                return Object.assign({}, store[piece]);
            }), piece, method, args, isSetState);
        } else if (typeof s !== 'object') {
            console.log(s);
            throw new Error('Piece of state must be an object');
        } else if (Promise && s instanceof Promise) {
            // console.log('promise:',s);
            return s.then(function (_s) {return update(_s, piece, method, args, isSetState)});
        } else {
            // console.log('object:', s);
            var copy = Object.assign({}, store[piece], s);
            dispatch({
                type: isSetState ? piece+'.'+method+'.setState' : piece+'.'+method,
                piece: piece,
                method: method,
                args: args,
                isSetState: isSetState,
                state: copy
            });
            
            return copy;
        }
    }
    function Piece (piece, pieceProto) {
        listeners[piece] = [];
        var modelPiece = this; 
        function wrapMethod(method) {
            return function () {
                var args = arguments;
                return new Promise(function (resolve, reject) {
                    model[piece].setState = function (newState) {
                        try {
                            var ns = update(newState, piece, method, args, true);
                            resolve(ns);
                            return ns;
                        } catch (e) {
                            reject(e);
                            return e;
                        }
                    };
                    update(controller[piece][method].apply(model[piece], args), piece, method, args, false);
                    model[piece].setState = function () {
                        throw new Error('The setState function is only available synchronously. Make sure you retrieve it from the "this" object before using it asynchronously. For example, you can use destructuring like so:  var { setState } = this;');
                    };
                });
            };
        }
        function bind(comp) {
            // console.log(comp.state);
            comp.state = comp.state || {};
            var initialState = store[piece];
            comp.state[piece] = initialState;
            if (typeof comp.componentWillMount === 'function') {
                var compComponentWillMount = comp.componentWillMount;
                comp.componentWillMount = function () {
                    listeners[piece].push(createReactListener(comp));
                    compComponentWillMount.call(comp);
                }
            } else {
                comp.componentWillMount = function () {
                    listeners[piece].push(createReactListener(comp));
                }
            }
            if (typeof comp.componentWillUnmount === 'function') {
                var compComponentWillUnmount = comp.componentWillUnmount;
                comp.componentWillUnmount = function () {
                    var i = listeners[piece].findIndex(function (l) {
                        return l.comp === comp
                    })
                    listeners[piece].splice(i, 1);
                    compComponentWillUnmount.call(comp);
                }
            } else {
                comp.componentWillUnmount = function () {
                    var i = listeners[piece].findIndex(function (l) {
                        return l.comp === comp
                    })
                    listeners[piece].splice(i, 1);
                }
            }
            // console.log(comp.state);
            // console.log(comp);
            return initialState;
        }
        for (var globalMethod in pieceProto) {
            if (!controller[piece].hasOwnProperty(globalMethod)) {
                controller[piece][globalMethod] = pieceProto[globalMethod];
            }
        }
        modelPiece.bind = bind;
        for (var method in controller[piece]) {
            if (controller[piece].hasOwnProperty(method) && method === 'initialState') {
                update(controller[piece].initialState, piece, method, null, false);
            } else if (controller[piece].hasOwnProperty(method) && typeof controller[piece][method] === 'function') {
                modelPiece[method] = wrapMethod(method);
            }
        }
    }
    var pieceProto = {};
    for (var globalMethod in controller) {
        if (controller.hasOwnProperty(globalMethod) && typeof controller[globalMethod] === 'function') {
            pieceProto[globalMethod] = controller[globalMethod];
        }
    }
    for (var piece in controller) {
        if (controller.hasOwnProperty(piece)) {
            if (typeof controller[piece] === 'object' && piece !== 'initialState') {
                model[piece] = new Piece(piece, pieceProto);
            } else if (typeof controller[piece] === 'function' && piece !== 'initialState') {
                // model[piece]
            }
        }
    }
    model.getState = function () {
        return Object.assign({}, store);
    }
    model.setState = function (s) {
        store = Object.assign(store, s);
        for (var piece in listeners) {
            if (listeners.hasOwnProperty(piece) && s.hasOwnProperty(piece)) {
                listeners[piece].forEach(function (l) {
                    l.func({[piece]: store[piece]});
                });
            }
        }
    }
    
    function subscribe (f) {
        if (subscribers.indexOf(f) === -1 && typeof f === 'function') {
            subscribers.push(f);
        }
    }
    model.subscribe = subscribe; 
    function dispatch (action) {
        store[action.piece] = action.state;
        listeners[action.piece].forEach(function (l) {
            l.func({[action.piece]: action.state})
        });
        subscribers.forEach(function (f) {f(action)});
    }
    model.dispatch = dispatch;
}

exports.createModel = function (controller) {
    return new Modelux(controller);
};

exports.createActionCreators = function (model) {
    var wrapper = {};
    for (var piece in model) {
        wrapper[piece] = {};
        for (var method in model[piece]) {
            wrapper[piece][method] = function () {
                model[piece][method];
            }
        }
    }
}