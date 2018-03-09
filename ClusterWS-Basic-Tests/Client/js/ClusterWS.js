var ClusterWS = function() {
    "use strict";
    function n(n) {
        return console.log(n);
    }
    var t = function() {
        function t(n, t) {
            this.socket = n, this.name = t, this.subscribe();
        }
        return t.prototype.watch = function(t) {
            return "[object Function]" !== {}.toString.call(t) ? n("Listener must be a function") : (this.listener = t, 
            this);
        }, t.prototype.publish = function(n) {
            return this.socket.send(this.name, n, "publish"), this;
        }, t.prototype.unsubscribe = function() {
            this.socket.send("unsubscribe", this.name, "system"), this.socket.channels[this.name] = null;
        }, t.prototype.onMessage = function(n) {
            this.listener && this.listener.call(null, n);
        }, t.prototype.subscribe = function() {
            this.socket.send("subscribe", this.name, "system");
        }, t;
    }(), e = function() {
        function t() {
            this.events = {};
        }
        return t.prototype.on = function(t, e) {
            if ("[object Function]" !== {}.toString.call(e)) return n("Listener must be a function");
            this.events[t] = e;
        }, t.prototype.emit = function(n) {
            for (var t, e = [], o = 1; o < arguments.length; o++) e[o - 1] = arguments[o];
            this.events[n] && (t = this.events[n]).call.apply(t, [ null ].concat(e));
        }, t.prototype.removeAllEvents = function() {
            this.events = {};
        }, t;
    }();
    function o(n, t, e) {
        var o = {
            emit: {
                "#": [ "e", n, t ]
            },
            publish: {
                "#": [ "p", n, t ]
            },
            system: {
                subscribe: {
                    "#": [ "s", "s", t ]
                },
                unsubscribe: {
                    "#": [ "s", "u", t ]
                }
            }
        };
        return "ping" === e ? n : JSON.stringify("system" === e ? o[e][n] : o[e]);
    }
    return function() {
        function i(t) {
            return this.events = new e(), this.channels = {}, this.useBinary = !1, this.missedPing = 0, 
            this.inReconnection = !1, this.reconnectionAttempted = 0, t.url ? (this.options = {
                url: t.url,
                autoReconnect: t.autoReconnect || !1,
                reconnectionAttempts: t.reconnectionAttempts || 0,
                reconnectionIntervalMin: t.reconnectionIntervalMin || 1e3,
                reconnectionIntervalMax: t.reconnectionIntervalMax || 5e3
            }, this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax ? n("reconnectionIntervalMin can not be more then reconnectionIntervalMax") : void this.create()) : n("Url must be provided and it must be string");
        }
        return i.prototype.create = function() {
            var t = this, e = window.MozWebSocket || window.WebSocket;
            this.websocket = new e(this.options.url), this.websocket.binaryType = "arraybuffer", 
            this.websocket.onopen = function() {
                for (var n in t.reconnectionAttempted = 0, t.channels) t.channels[n] && t.channels[n].subscribe();
            }, this.websocket.onerror = function(n) {
                return t.events.emit("error", n);
            }, this.websocket.onmessage = function(e) {
                var o = "string" != typeof e.data ? String.fromCharCode.apply(null, new Uint8Array(e.data)) : e.data;
                if ("#0" === o) return t.missedPing = 0, t.send("#1", null, "ping");
                try {
                    o = JSON.parse(o);
                } catch (t) {
                    return n(t);
                }
                !function(n, t) {
                    var e = {
                        e: function() {
                            return n.events.emit(t["#"][1], t["#"][2]);
                        },
                        p: function() {
                            return n.channels[t["#"][1]] && n.channels[t["#"][1]].onMessage(t["#"][2]);
                        },
                        s: {
                            c: function() {
                                n.pingInterval = setInterval(function() {
                                    return n.missedPing++ > 2 && n.disconnect(4001, "Did not get pings");
                                }, t["#"][2].ping), n.useBinary = t["#"][2].binary, n.events.emit("connect");
                            }
                        }
                    };
                    "s" === t["#"][0] ? e[t["#"][0]][t["#"][1]] && e[t["#"][0]][t["#"][1]].call(null) : e[t["#"][0]] && e[t["#"][0]].call(null);
                }(t, o);
            }, this.websocket.onclose = function(n) {
                if (t.missedPing = 0, clearInterval(t.pingInterval), t.events.emit("disconnect", n.code, n.reason), 
                t.options.autoReconnect && 1e3 !== n.code && (0 === t.options.reconnectionAttempts || t.reconnectionAttempted < t.options.reconnectionAttempts)) t.websocket.readyState === t.websocket.CLOSED && (t.reconnectionAttempted++, 
                t.websocket = null, setTimeout(function() {
                    return t.create();
                }, Math.floor(Math.random() * (t.options.reconnectionIntervalMax - t.options.reconnectionIntervalMin + 1)))); else for (var e in t.events.removeAllEvents(), 
                t) t[e] && (t[e] = null);
            };
        }, i.prototype.on = function(n, t) {
            this.events.on(n, t);
        }, i.prototype.send = function(n, t, e) {
            void 0 === e && (e = "emit"), this.websocket.send(this.useBinary ? function(n) {
                for (var t = n.length, e = new Uint8Array(t), o = 0; o < t; o++) e[o] = n.charCodeAt(o);
                return e.buffer;
            }(o(n, t, e)) : o(n, t, e));
        }, i.prototype.disconnect = function(n, t) {
            this.websocket.close(n || 1e3, t);
        }, i.prototype.subscribe = function(n) {
            return this.channels[n] ? this.channels[n] : this.channels[n] = new t(this, n);
        }, i.prototype.getChannelByName = function(n) {
            return this.channels[n];
        }, i.prototype.getState = function() {
            return this.websocket.readyState;
        }, i;
    }();
}();
