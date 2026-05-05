import e, { useCallback as t, useEffect as n, useRef as r, useState as i } from "react";
//#region \0rolldown/runtime.js
var a = Object.defineProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, t) => {
	let n = {};
	for (var r in e) a(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || a(n, Symbol.toStringTag, { value: "Module" }), n;
}, c = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}), l = Object.create(null);
l.open = "0", l.close = "1", l.ping = "2", l.pong = "3", l.message = "4", l.upgrade = "5", l.noop = "6";
var u = Object.create(null);
Object.keys(l).forEach((e) => {
	u[l[e]] = e;
});
var d = {
	type: "error",
	data: "parser error"
}, f = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", p = typeof ArrayBuffer == "function", m = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, h = ({ type: e, data: t }, n, r) => f && t instanceof Blob ? n ? r(t) : g(t, r) : p && (t instanceof ArrayBuffer || m(t)) ? n ? r(t) : g(new Blob([t]), r) : r(l[e] + (t || "")), g = (e, t) => {
	let n = new FileReader();
	return n.onload = function() {
		let e = n.result.split(",")[1];
		t("b" + (e || ""));
	}, n.readAsDataURL(e);
};
function _(e) {
	return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
var v;
function y(e, t) {
	if (f && e.data instanceof Blob) return e.data.arrayBuffer().then(_).then(t);
	if (p && (e.data instanceof ArrayBuffer || m(e.data))) return t(_(e.data));
	h(e, !1, (e) => {
		v ||= new TextEncoder(), t(v.encode(e));
	});
}
//#endregion
//#region node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", x = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < 64; e++) x[b.charCodeAt(e)] = e;
var S = (e) => {
	let t = e.length * .75, n = e.length, r, i = 0, a, o, s, c;
	e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
	let l = new ArrayBuffer(t), u = new Uint8Array(l);
	for (r = 0; r < n; r += 4) a = x[e.charCodeAt(r)], o = x[e.charCodeAt(r + 1)], s = x[e.charCodeAt(r + 2)], c = x[e.charCodeAt(r + 3)], u[i++] = a << 2 | o >> 4, u[i++] = (o & 15) << 4 | s >> 2, u[i++] = (s & 3) << 6 | c & 63;
	return l;
}, C = typeof ArrayBuffer == "function", w = (e, t) => {
	if (typeof e != "string") return {
		type: "message",
		data: te(e, t)
	};
	let n = e.charAt(0);
	return n === "b" ? {
		type: "message",
		data: ee(e.substring(1), t)
	} : u[n] ? e.length > 1 ? {
		type: u[n],
		data: e.substring(1)
	} : { type: u[n] } : d;
}, ee = (e, t) => C ? te(S(e), t) : {
	base64: !0,
	data: e
}, te = (e, t) => {
	switch (t) {
		case "blob": return e instanceof Blob ? e : new Blob([e]);
		default: return e instanceof ArrayBuffer ? e : e.buffer;
	}
}, T = "", ne = (e, t) => {
	let n = e.length, r = Array(n), i = 0;
	e.forEach((e, a) => {
		h(e, !1, (e) => {
			r[a] = e, ++i === n && t(r.join(T));
		});
	});
}, re = (e, t) => {
	let n = e.split(T), r = [];
	for (let e = 0; e < n.length; e++) {
		let i = w(n[e], t);
		if (r.push(i), i.type === "error") break;
	}
	return r;
};
function E() {
	return new TransformStream({ transform(e, t) {
		y(e, (n) => {
			let r = n.length, i;
			if (r < 126) i = new Uint8Array(1), new DataView(i.buffer).setUint8(0, r);
			else if (r < 65536) {
				i = new Uint8Array(3);
				let e = new DataView(i.buffer);
				e.setUint8(0, 126), e.setUint16(1, r);
			} else {
				i = new Uint8Array(9);
				let e = new DataView(i.buffer);
				e.setUint8(0, 127), e.setBigUint64(1, BigInt(r));
			}
			e.data && typeof e.data != "string" && (i[0] |= 128), t.enqueue(i), t.enqueue(n);
		});
	} });
}
var D;
function O(e) {
	return e.reduce((e, t) => e + t.length, 0);
}
function k(e, t) {
	if (e[0].length === t) return e.shift();
	let n = new Uint8Array(t), r = 0;
	for (let i = 0; i < t; i++) n[i] = e[0][r++], r === e[0].length && (e.shift(), r = 0);
	return e.length && r < e[0].length && (e[0] = e[0].slice(r)), n;
}
function A(e, t) {
	D ||= new TextDecoder();
	let n = [], r = 0, i = -1, a = !1;
	return new TransformStream({ transform(o, s) {
		for (n.push(o);;) {
			if (r === 0) {
				if (O(n) < 1) break;
				let e = k(n, 1);
				a = (e[0] & 128) == 128, i = e[0] & 127, r = i < 126 ? 3 : i === 126 ? 1 : 2;
			} else if (r === 1) {
				if (O(n) < 2) break;
				let e = k(n, 2);
				i = new DataView(e.buffer, e.byteOffset, e.length).getUint16(0), r = 3;
			} else if (r === 2) {
				if (O(n) < 8) break;
				let e = k(n, 8), t = new DataView(e.buffer, e.byteOffset, e.length), a = t.getUint32(0);
				if (a > 2 ** 21 - 1) {
					s.enqueue(d);
					break;
				}
				i = a * 2 ** 32 + t.getUint32(4), r = 3;
			} else {
				if (O(n) < i) break;
				let e = k(n, i);
				s.enqueue(w(a ? e : D.decode(e), t)), r = 0;
			}
			if (i === 0 || i > e) {
				s.enqueue(d);
				break;
			}
		}
	} });
}
//#endregion
//#region node_modules/@socket.io/component-emitter/lib/esm/index.js
function j(e) {
	if (e) return M(e);
}
function M(e) {
	for (var t in j.prototype) e[t] = j.prototype[t];
	return e;
}
j.prototype.on = j.prototype.addEventListener = function(e, t) {
	return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
}, j.prototype.once = function(e, t) {
	function n() {
		this.off(e, n), t.apply(this, arguments);
	}
	return n.fn = t, this.on(e, n), this;
}, j.prototype.off = j.prototype.removeListener = j.prototype.removeAllListeners = j.prototype.removeEventListener = function(e, t) {
	if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
	var n = this._callbacks["$" + e];
	if (!n) return this;
	if (arguments.length == 1) return delete this._callbacks["$" + e], this;
	for (var r, i = 0; i < n.length; i++) if (r = n[i], r === t || r.fn === t) {
		n.splice(i, 1);
		break;
	}
	return n.length === 0 && delete this._callbacks["$" + e], this;
}, j.prototype.emit = function(e) {
	this._callbacks = this._callbacks || {};
	for (var t = Array(arguments.length - 1), n = this._callbacks["$" + e], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
	if (n) {
		n = n.slice(0);
		for (var r = 0, i = n.length; r < i; ++r) n[r].apply(this, t);
	}
	return this;
}, j.prototype.emitReserved = j.prototype.emit, j.prototype.listeners = function(e) {
	return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
}, j.prototype.hasListeners = function(e) {
	return !!this.listeners(e).length;
};
//#endregion
//#region node_modules/engine.io-client/build/esm/globals.js
var N = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, t) => t(e, 0), P = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ie = "arraybuffer";
//#endregion
//#region node_modules/engine.io-client/build/esm/util.js
function ae(e, ...t) {
	return t.reduce((t, n) => (e.hasOwnProperty(n) && (t[n] = e[n]), t), {});
}
var oe = P.setTimeout, se = P.clearTimeout;
function F(e, t) {
	t.useNativeTimers ? (e.setTimeoutFn = oe.bind(P), e.clearTimeoutFn = se.bind(P)) : (e.setTimeoutFn = P.setTimeout.bind(P), e.clearTimeoutFn = P.clearTimeout.bind(P));
}
var ce = 1.33;
function le(e) {
	return typeof e == "string" ? ue(e) : Math.ceil((e.byteLength || e.size) * ce);
}
function ue(e) {
	let t = 0, n = 0;
	for (let r = 0, i = e.length; r < i; r++) t = e.charCodeAt(r), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (r++, n += 4);
	return n;
}
function de() {
	return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
//#endregion
//#region node_modules/engine.io-client/build/esm/contrib/parseqs.js
function fe(e) {
	let t = "";
	for (let n in e) e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
	return t;
}
function pe(e) {
	let t = {}, n = e.split("&");
	for (let e = 0, r = n.length; e < r; e++) {
		let r = n[e].split("=");
		t[decodeURIComponent(r[0])] = decodeURIComponent(r[1]);
	}
	return t;
}
//#endregion
//#region node_modules/engine.io-client/build/esm/transport.js
var me = class extends Error {
	constructor(e, t, n) {
		super(e), this.description = t, this.context = n, this.type = "TransportError";
	}
}, I = class extends j {
	constructor(e) {
		super(), this.writable = !1, F(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
	}
	onError(e, t, n) {
		return super.emitReserved("error", new me(e, t, n)), this;
	}
	open() {
		return this.readyState = "opening", this.doOpen(), this;
	}
	close() {
		return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
	}
	send(e) {
		this.readyState === "open" && this.write(e);
	}
	onOpen() {
		this.readyState = "open", this.writable = !0, super.emitReserved("open");
	}
	onData(e) {
		let t = w(e, this.socket.binaryType);
		this.onPacket(t);
	}
	onPacket(e) {
		super.emitReserved("packet", e);
	}
	onClose(e) {
		this.readyState = "closed", super.emitReserved("close", e);
	}
	pause(e) {}
	createUri(e, t = {}) {
		return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t);
	}
	_hostname() {
		let e = this.opts.hostname;
		return e.indexOf(":") === -1 ? e : "[" + e + "]";
	}
	_port() {
		return this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
	}
	_query(e) {
		let t = fe(e);
		return t.length ? "?" + t : "";
	}
}, he = class extends I {
	constructor() {
		super(...arguments), this._polling = !1;
	}
	get name() {
		return "polling";
	}
	doOpen() {
		this._poll();
	}
	pause(e) {
		this.readyState = "pausing";
		let t = () => {
			this.readyState = "paused", e();
		};
		if (this._polling || !this.writable) {
			let e = 0;
			this._polling && (e++, this.once("pollComplete", function() {
				--e || t();
			})), this.writable || (e++, this.once("drain", function() {
				--e || t();
			}));
		} else t();
	}
	_poll() {
		this._polling = !0, this.doPoll(), this.emitReserved("poll");
	}
	onData(e) {
		re(e, this.socket.binaryType).forEach((e) => {
			if (this.readyState === "opening" && e.type === "open" && this.onOpen(), e.type === "close") return this.onClose({ description: "transport closed by the server" }), !1;
			this.onPacket(e);
		}), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
	}
	doClose() {
		let e = () => {
			this.write([{ type: "close" }]);
		};
		this.readyState === "open" ? e() : this.once("open", e);
	}
	write(e) {
		this.writable = !1, ne(e, (e) => {
			this.doWrite(e, () => {
				this.writable = !0, this.emitReserved("drain");
			});
		});
	}
	uri() {
		let e = this.opts.secure ? "https" : "http", t = this.query || {};
		return !1 !== this.opts.timestampRequests && (t[this.opts.timestampParam] = de()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t);
	}
}, ge = !1;
try {
	ge = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {}
var _e = ge;
//#endregion
//#region node_modules/engine.io-client/build/esm/transports/polling-xhr.js
function ve() {}
var ye = class extends he {
	constructor(e) {
		if (super(e), typeof location < "u") {
			let t = location.protocol === "https:", n = location.port;
			n ||= t ? "443" : "80", this.xd = typeof location < "u" && e.hostname !== location.hostname || n !== e.port;
		}
	}
	doWrite(e, t) {
		let n = this.request({
			method: "POST",
			data: e
		});
		n.on("success", t), n.on("error", (e, t) => {
			this.onError("xhr post error", e, t);
		});
	}
	doPoll() {
		let e = this.request();
		e.on("data", this.onData.bind(this)), e.on("error", (e, t) => {
			this.onError("xhr poll error", e, t);
		}), this.pollXhr = e;
	}
}, L = class e extends j {
	constructor(e, t, n) {
		super(), this.createRequest = e, F(this, n), this._opts = n, this._method = n.method || "GET", this._uri = t, this._data = n.data === void 0 ? null : n.data, this._create();
	}
	_create() {
		var t;
		let n = ae(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
		n.xdomain = !!this._opts.xd;
		let r = this._xhr = this.createRequest(n);
		try {
			r.open(this._method, this._uri, !0);
			try {
				if (this._opts.extraHeaders) {
					r.setDisableHeaderCheck && r.setDisableHeaderCheck(!0);
					for (let e in this._opts.extraHeaders) this._opts.extraHeaders.hasOwnProperty(e) && r.setRequestHeader(e, this._opts.extraHeaders[e]);
				}
			} catch {}
			if (this._method === "POST") try {
				r.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
			} catch {}
			try {
				r.setRequestHeader("Accept", "*/*");
			} catch {}
			(t = this._opts.cookieJar) == null || t.addCookies(r), "withCredentials" in r && (r.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (r.timeout = this._opts.requestTimeout), r.onreadystatechange = () => {
				var e;
				r.readyState === 3 && ((e = this._opts.cookieJar) == null || e.parseCookies(r.getResponseHeader("set-cookie"))), r.readyState === 4 && (r.status === 200 || r.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
					this._onError(typeof r.status == "number" ? r.status : 0);
				}, 0));
			}, r.send(this._data);
		} catch (e) {
			this.setTimeoutFn(() => {
				this._onError(e);
			}, 0);
			return;
		}
		typeof document < "u" && (this._index = e.requestsCount++, e.requests[this._index] = this);
	}
	_onError(e) {
		this.emitReserved("error", e, this._xhr), this._cleanup(!0);
	}
	_cleanup(t) {
		if (!(this._xhr === void 0 || this._xhr === null)) {
			if (this._xhr.onreadystatechange = ve, t) try {
				this._xhr.abort();
			} catch {}
			typeof document < "u" && delete e.requests[this._index], this._xhr = null;
		}
	}
	_onLoad() {
		let e = this._xhr.responseText;
		e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
	}
	abort() {
		this._cleanup();
	}
};
if (L.requestsCount = 0, L.requests = {}, typeof document < "u") {
	if (typeof attachEvent == "function") attachEvent("onunload", be);
	else if (typeof addEventListener == "function") {
		let e = "onpagehide" in P ? "pagehide" : "unload";
		addEventListener(e, be, !1);
	}
}
function be() {
	for (let e in L.requests) L.requests.hasOwnProperty(e) && L.requests[e].abort();
}
var xe = (function() {
	let e = Ce({ xdomain: !1 });
	return e && e.responseType !== null;
})(), Se = class extends ye {
	constructor(e) {
		super(e);
		let t = e && e.forceBase64;
		this.supportsBinary = xe && !t;
	}
	request(e = {}) {
		return Object.assign(e, { xd: this.xd }, this.opts), new L(Ce, this.uri(), e);
	}
};
function Ce(e) {
	let t = e.xdomain;
	try {
		if (typeof XMLHttpRequest < "u" && (!t || _e)) return new XMLHttpRequest();
	} catch {}
	if (!t) try {
		return new P[["Active", "Object"].join("X")]("Microsoft.XMLHTTP");
	} catch {}
}
//#endregion
//#region node_modules/engine.io-client/build/esm/transports/websocket.js
var we = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative", Te = class extends I {
	get name() {
		return "websocket";
	}
	doOpen() {
		let e = this.uri(), t = this.opts.protocols, n = we ? {} : ae(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
		this.opts.extraHeaders && (n.headers = this.opts.extraHeaders);
		try {
			this.ws = this.createSocket(e, t, n);
		} catch (e) {
			return this.emitReserved("error", e);
		}
		this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
	}
	addEventListeners() {
		this.ws.onopen = () => {
			this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
		}, this.ws.onclose = (e) => this.onClose({
			description: "websocket connection closed",
			context: e
		}), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
	}
	write(e) {
		this.writable = !1;
		for (let t = 0; t < e.length; t++) {
			let n = e[t], r = t === e.length - 1;
			h(n, this.supportsBinary, (e) => {
				try {
					this.doWrite(n, e);
				} catch {}
				r && N(() => {
					this.writable = !0, this.emitReserved("drain");
				}, this.setTimeoutFn);
			});
		}
	}
	doClose() {
		this.ws !== void 0 && (this.ws.onerror = () => {}, this.ws.close(), this.ws = null);
	}
	uri() {
		let e = this.opts.secure ? "wss" : "ws", t = this.query || {};
		return this.opts.timestampRequests && (t[this.opts.timestampParam] = de()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
	}
}, R = P.WebSocket || P.MozWebSocket, Ee = {
	websocket: class extends Te {
		createSocket(e, t, n) {
			return we ? new R(e, t, n) : t ? new R(e, t) : new R(e);
		}
		doWrite(e, t) {
			this.ws.send(t);
		}
	},
	webtransport: class extends I {
		get name() {
			return "webtransport";
		}
		doOpen() {
			try {
				this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
			} catch (e) {
				return this.emitReserved("error", e);
			}
			this._transport.closed.then(() => {
				this.onClose();
			}).catch((e) => {
				this.onError("webtransport error", e);
			}), this._transport.ready.then(() => {
				this._transport.createBidirectionalStream().then((e) => {
					let t = A(2 ** 53 - 1, this.socket.binaryType), n = e.readable.pipeThrough(t).getReader(), r = E();
					r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
					let i = () => {
						n.read().then(({ done: e, value: t }) => {
							e || (this.onPacket(t), i());
						}).catch((e) => {});
					};
					i();
					let a = { type: "open" };
					this.query.sid && (a.data = `{"sid":"${this.query.sid}"}`), this._writer.write(a).then(() => this.onOpen());
				});
			});
		}
		write(e) {
			this.writable = !1;
			for (let t = 0; t < e.length; t++) {
				let n = e[t], r = t === e.length - 1;
				this._writer.write(n).then(() => {
					r && N(() => {
						this.writable = !0, this.emitReserved("drain");
					}, this.setTimeoutFn);
				});
			}
		}
		doClose() {
			var e;
			(e = this._transport) == null || e.close();
		}
	},
	polling: Se
}, De = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Oe = [
	"source",
	"protocol",
	"authority",
	"userInfo",
	"user",
	"password",
	"host",
	"port",
	"relative",
	"path",
	"directory",
	"file",
	"query",
	"anchor"
];
function z(e) {
	if (e.length > 8e3) throw "URI too long";
	let t = e, n = e.indexOf("["), r = e.indexOf("]");
	n != -1 && r != -1 && (e = e.substring(0, n) + e.substring(n, r).replace(/:/g, ";") + e.substring(r, e.length));
	let i = De.exec(e || ""), a = {}, o = 14;
	for (; o--;) a[Oe[o]] = i[o] || "";
	return n != -1 && r != -1 && (a.source = t, a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":"), a.authority = a.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), a.ipv6uri = !0), a.pathNames = ke(a, a.path), a.queryKey = Ae(a, a.query), a;
}
function ke(e, t) {
	let n = t.replace(/\/{2,9}/g, "/").split("/");
	return (t.slice(0, 1) == "/" || t.length === 0) && n.splice(0, 1), t.slice(-1) == "/" && n.splice(n.length - 1, 1), n;
}
function Ae(e, t) {
	let n = {};
	return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(e, t, r) {
		t && (n[t] = r);
	}), n;
}
//#endregion
//#region node_modules/engine.io-client/build/esm/socket.js
var B = typeof addEventListener == "function" && typeof removeEventListener == "function", V = [];
B && addEventListener("offline", () => {
	V.forEach((e) => e());
}, !1);
var H = class e extends j {
	constructor(e, t) {
		if (super(), this.binaryType = ie, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = Infinity, e && typeof e == "object" && (t = e, e = null), e) {
			let n = z(e);
			t.hostname = n.host, t.secure = n.protocol === "https" || n.protocol === "wss", t.port = n.port, n.query && (t.query = n.query);
		} else t.host && (t.hostname = z(t.host).host);
		F(this, t), this.secure = t.secure == null ? typeof location < "u" && location.protocol === "https:" : t.secure, t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach((e) => {
			let t = e.prototype.name;
			this.transports.push(t), this._transportsByName[t] = e;
		}), this.opts = Object.assign({
			path: "/engine.io",
			agent: !1,
			withCredentials: !1,
			upgrade: !0,
			timestampParam: "t",
			rememberUpgrade: !1,
			addTrailingSlash: !0,
			rejectUnauthorized: !0,
			perMessageDeflate: { threshold: 1024 },
			transportOptions: {},
			closeOnBeforeunload: !1
		}, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = pe(this.opts.query)), B && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
			this.transport && (this.transport.removeAllListeners(), this.transport.close());
		}, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
			this._onClose("transport close", { description: "network connection lost" });
		}, V.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
	}
	createTransport(e) {
		let t = Object.assign({}, this.opts.query);
		t.EIO = 4, t.transport = e, this.id && (t.sid = this.id);
		let n = Object.assign({}, this.opts, {
			query: t,
			socket: this,
			hostname: this.hostname,
			secure: this.secure,
			port: this.port
		}, this.opts.transportOptions[e]);
		return new this._transportsByName[e](n);
	}
	_open() {
		if (this.transports.length === 0) {
			this.setTimeoutFn(() => {
				this.emitReserved("error", "No transports available");
			}, 0);
			return;
		}
		let t = this.opts.rememberUpgrade && e.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
		this.readyState = "opening";
		let n = this.createTransport(t);
		n.open(), this.setTransport(n);
	}
	setTransport(e) {
		this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (e) => this._onClose("transport close", e));
	}
	onOpen() {
		this.readyState = "open", e.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
	}
	_onPacket(e) {
		if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
			case "open":
				this.onHandshake(JSON.parse(e.data));
				break;
			case "ping":
				this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
				break;
			case "error":
				let t = /* @__PURE__ */ Error("server error");
				t.code = e.data, this._onError(t);
				break;
			case "message":
				this.emitReserved("data", e.data), this.emitReserved("message", e.data);
				break;
		}
	}
	onHandshake(e) {
		this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
	}
	_resetPingTimeout() {
		this.clearTimeoutFn(this._pingTimeoutTimer);
		let e = this._pingInterval + this._pingTimeout;
		this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
			this._onClose("ping timeout");
		}, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
	}
	_onDrain() {
		this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
	}
	flush() {
		if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
			let e = this._getWritablePackets();
			this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
		}
	}
	_getWritablePackets() {
		if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1)) return this.writeBuffer;
		let e = 1;
		for (let t = 0; t < this.writeBuffer.length; t++) {
			let n = this.writeBuffer[t].data;
			if (n && (e += le(n)), t > 0 && e > this._maxPayload) return this.writeBuffer.slice(0, t);
			e += 2;
		}
		return this.writeBuffer;
	}
	_hasPingExpired() {
		if (!this._pingTimeoutTime) return !0;
		let e = Date.now() > this._pingTimeoutTime;
		return e && (this._pingTimeoutTime = 0, N(() => {
			this._onClose("ping timeout");
		}, this.setTimeoutFn)), e;
	}
	write(e, t, n) {
		return this._sendPacket("message", e, t, n), this;
	}
	send(e, t, n) {
		return this._sendPacket("message", e, t, n), this;
	}
	_sendPacket(e, t, n, r) {
		if (typeof t == "function" && (r = t, t = void 0), typeof n == "function" && (r = n, n = null), this.readyState === "closing" || this.readyState === "closed") return;
		n ||= {}, n.compress = !1 !== n.compress;
		let i = {
			type: e,
			data: t,
			options: n
		};
		this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush();
	}
	close() {
		let e = () => {
			this._onClose("forced close"), this.transport.close();
		}, t = () => {
			this.off("upgrade", t), this.off("upgradeError", t), e();
		}, n = () => {
			this.once("upgrade", t), this.once("upgradeError", t);
		};
		return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
			this.upgrading ? n() : e();
		}) : this.upgrading ? n() : e()), this;
	}
	_onError(t) {
		if (e.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") return this.transports.shift(), this._open();
		this.emitReserved("error", t), this._onClose("transport error", t);
	}
	_onClose(e, t) {
		if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
			if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), B && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
				let e = V.indexOf(this._offlineEventListener);
				e !== -1 && V.splice(e, 1);
			}
			this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0;
		}
	}
};
H.protocol = 4;
var je = class extends H {
	constructor() {
		super(...arguments), this._upgrades = [];
	}
	onOpen() {
		if (super.onOpen(), this.readyState === "open" && this.opts.upgrade) for (let e = 0; e < this._upgrades.length; e++) this._probe(this._upgrades[e]);
	}
	_probe(e) {
		let t = this.createTransport(e), n = !1;
		H.priorWebsocketSuccess = !1;
		let r = () => {
			n || (t.send([{
				type: "ping",
				data: "probe"
			}]), t.once("packet", (e) => {
				if (!n) if (e.type === "pong" && e.data === "probe") {
					if (this.upgrading = !0, this.emitReserved("upgrading", t), !t) return;
					H.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
						n || this.readyState !== "closed" && (l(), this.setTransport(t), t.send([{ type: "upgrade" }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush());
					});
				} else {
					let e = /* @__PURE__ */ Error("probe error");
					e.transport = t.name, this.emitReserved("upgradeError", e);
				}
			}));
		};
		function i() {
			n || (n = !0, l(), t.close(), t = null);
		}
		let a = (e) => {
			let n = /* @__PURE__ */ Error("probe error: " + e);
			n.transport = t.name, i(), this.emitReserved("upgradeError", n);
		};
		function o() {
			a("transport closed");
		}
		function s() {
			a("socket closed");
		}
		function c(e) {
			t && e.name !== t.name && i();
		}
		let l = () => {
			t.removeListener("open", r), t.removeListener("error", a), t.removeListener("close", o), this.off("close", s), this.off("upgrading", c);
		};
		t.once("open", r), t.once("error", a), t.once("close", o), this.once("close", s), this.once("upgrading", c), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
			n || t.open();
		}, 200) : t.open();
	}
	onHandshake(e) {
		this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
	}
	_filterUpgrades(e) {
		let t = [];
		for (let n = 0; n < e.length; n++) ~this.transports.indexOf(e[n]) && t.push(e[n]);
		return t;
	}
}, Me = class extends je {
	constructor(e, t = {}) {
		let n = typeof e == "object" ? e : t;
		(!n.transports || n.transports && typeof n.transports[0] == "string") && (n.transports = (n.transports || [
			"polling",
			"websocket",
			"webtransport"
		]).map((e) => Ee[e]).filter((e) => !!e)), super(e, n);
	}
};
Me.protocol;
//#endregion
//#region node_modules/socket.io-client/build/esm/url.js
function Ne(e, t = "", n) {
	let r = e;
	n ||= typeof location < "u" && location, e ??= n.protocol + "//" + n.host, typeof e == "string" && (e.charAt(0) === "/" && (e = e.charAt(1) === "/" ? n.protocol + e : n.host + e), /^(https?|wss?):\/\//.test(e) || (e = n === void 0 ? "https://" + e : n.protocol + "//" + e), r = z(e)), r.port || (/^(http|ws)$/.test(r.protocol) ? r.port = "80" : /^(http|ws)s$/.test(r.protocol) && (r.port = "443")), r.path = r.path || "/";
	let i = r.host.indexOf(":") === -1 ? r.host : "[" + r.host + "]";
	return r.id = r.protocol + "://" + i + ":" + r.port + t, r.href = r.protocol + "://" + i + (n && n.port === r.port ? "" : ":" + r.port), r;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/is-binary.js
var Pe = typeof ArrayBuffer == "function", Fe = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Ie = Object.prototype.toString, Le = typeof Blob == "function" || typeof Blob < "u" && Ie.call(Blob) === "[object BlobConstructor]", Re = typeof File == "function" || typeof File < "u" && Ie.call(File) === "[object FileConstructor]";
function U(e) {
	return Pe && (e instanceof ArrayBuffer || Fe(e)) || Le && e instanceof Blob || Re && e instanceof File;
}
function W(e, t) {
	if (!e || typeof e != "object") return !1;
	if (Array.isArray(e)) {
		for (let t = 0, n = e.length; t < n; t++) if (W(e[t])) return !0;
		return !1;
	}
	if (U(e)) return !0;
	if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1) return W(e.toJSON(), !0);
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t) && W(e[t])) return !0;
	return !1;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/binary.js
function ze(e) {
	let t = [], n = e.data, r = e;
	return r.data = G(n, t), r.attachments = t.length, {
		packet: r,
		buffers: t
	};
}
function G(e, t) {
	if (!e) return e;
	if (U(e)) {
		let n = {
			_placeholder: !0,
			num: t.length
		};
		return t.push(e), n;
	} else if (Array.isArray(e)) {
		let n = Array(e.length);
		for (let r = 0; r < e.length; r++) n[r] = G(e[r], t);
		return n;
	} else if (typeof e == "object" && !(e instanceof Date)) {
		let n = {};
		for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && (n[r] = G(e[r], t));
		return n;
	}
	return e;
}
function Be(e, t) {
	return e.data = K(e.data, t), delete e.attachments, e;
}
function K(e, t) {
	if (!e) return e;
	if (e && e._placeholder === !0) {
		if (typeof e.num == "number" && e.num >= 0 && e.num < t.length) return t[e.num];
		throw Error("illegal attachments");
	} else if (Array.isArray(e)) for (let n = 0; n < e.length; n++) e[n] = K(e[n], t);
	else if (typeof e == "object") for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && (e[n] = K(e[n], t));
	return e;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/index.js
var Ve = /* @__PURE__ */ s({
	Decoder: () => We,
	Encoder: () => Ue,
	PacketType: () => q,
	isPacketValid: () => Xe,
	protocol: () => 5
}), He = [
	"connect",
	"connect_error",
	"disconnect",
	"disconnecting",
	"newListener",
	"removeListener"
], q;
(function(e) {
	e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(q ||= {});
var Ue = class {
	constructor(e) {
		this.replacer = e;
	}
	encode(e) {
		return (e.type === q.EVENT || e.type === q.ACK) && W(e) ? this.encodeAsBinary({
			type: e.type === q.EVENT ? q.BINARY_EVENT : q.BINARY_ACK,
			nsp: e.nsp,
			data: e.data,
			id: e.id
		}) : [this.encodeAsString(e)];
	}
	encodeAsString(e) {
		let t = "" + e.type;
		return (e.type === q.BINARY_EVENT || e.type === q.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t;
	}
	encodeAsBinary(e) {
		let t = ze(e), n = this.encodeAsString(t.packet), r = t.buffers;
		return r.unshift(n), r;
	}
}, We = class e extends j {
	constructor(e) {
		super(), this.opts = Object.assign({
			reviver: void 0,
			maxAttachments: 10
		}, typeof e == "function" ? { reviver: e } : e);
	}
	add(e) {
		let t;
		if (typeof e == "string") {
			if (this.reconstructor) throw Error("got plaintext data when reconstructing a packet");
			t = this.decodeString(e);
			let n = t.type === q.BINARY_EVENT;
			n || t.type === q.BINARY_ACK ? (t.type = n ? q.EVENT : q.ACK, this.reconstructor = new Ge(t), t.attachments === 0 && super.emitReserved("decoded", t)) : super.emitReserved("decoded", t);
		} else if (U(e) || e.base64) if (this.reconstructor) t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
		else throw Error("got binary data when not reconstructing a packet");
		else throw Error("Unknown type: " + e);
	}
	decodeString(t) {
		let n = 0, r = { type: Number(t.charAt(0)) };
		if (q[r.type] === void 0) throw Error("unknown packet type " + r.type);
		if (r.type === q.BINARY_EVENT || r.type === q.BINARY_ACK) {
			let e = n + 1;
			for (; t.charAt(++n) !== "-" && n != t.length;);
			let i = t.substring(e, n);
			if (i != Number(i) || t.charAt(n) !== "-") throw Error("Illegal attachments");
			let a = Number(i);
			if (!qe(a) || a < 0) throw Error("Illegal attachments");
			if (a > this.opts.maxAttachments) throw Error("too many attachments");
			r.attachments = a;
		}
		if (t.charAt(n + 1) === "/") {
			let e = n + 1;
			for (; ++n && !(t.charAt(n) === "," || n === t.length););
			r.nsp = t.substring(e, n);
		} else r.nsp = "/";
		let i = t.charAt(n + 1);
		if (i !== "" && Number(i) == i) {
			let e = n + 1;
			for (; ++n;) {
				let e = t.charAt(n);
				if (e == null || Number(e) != e) {
					--n;
					break;
				}
				if (n === t.length) break;
			}
			r.id = Number(t.substring(e, n + 1));
		}
		if (t.charAt(++n)) {
			let i = this.tryParse(t.substr(n));
			if (e.isPayloadValid(r.type, i)) r.data = i;
			else throw Error("invalid payload");
		}
		return r;
	}
	tryParse(e) {
		try {
			return JSON.parse(e, this.opts.reviver);
		} catch {
			return !1;
		}
	}
	static isPayloadValid(e, t) {
		switch (e) {
			case q.CONNECT: return J(t);
			case q.DISCONNECT: return t === void 0;
			case q.CONNECT_ERROR: return typeof t == "string" || J(t);
			case q.EVENT:
			case q.BINARY_EVENT: return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && He.indexOf(t[0]) === -1);
			case q.ACK:
			case q.BINARY_ACK: return Array.isArray(t);
		}
	}
	destroy() {
		this.reconstructor &&= (this.reconstructor.finishedReconstruction(), null);
	}
}, Ge = class {
	constructor(e) {
		this.packet = e, this.buffers = [], this.reconPack = e;
	}
	takeBinaryData(e) {
		if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
			let e = Be(this.reconPack, this.buffers);
			return this.finishedReconstruction(), e;
		}
		return null;
	}
	finishedReconstruction() {
		this.reconPack = null, this.buffers = [];
	}
};
function Ke(e) {
	return typeof e == "string";
}
var qe = Number.isInteger || function(e) {
	return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function Je(e) {
	return e === void 0 || qe(e);
}
function J(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
function Ye(e, t) {
	switch (e) {
		case q.CONNECT: return t === void 0 || J(t);
		case q.DISCONNECT: return t === void 0;
		case q.EVENT: return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && He.indexOf(t[0]) === -1);
		case q.ACK: return Array.isArray(t);
		case q.CONNECT_ERROR: return typeof t == "string" || J(t);
		default: return !1;
	}
}
function Xe(e) {
	return Ke(e.nsp) && Je(e.id) && Ye(e.type, e.data);
}
//#endregion
//#region node_modules/socket.io-client/build/esm/on.js
function Y(e, t, n) {
	return e.on(t, n), function() {
		e.off(t, n);
	};
}
//#endregion
//#region node_modules/socket.io-client/build/esm/socket.js
var Ze = Object.freeze({
	connect: 1,
	connect_error: 1,
	disconnect: 1,
	disconnecting: 1,
	newListener: 1,
	removeListener: 1
}), Qe = class extends j {
	constructor(e, t, n) {
		super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, n && n.auth && (this.auth = n.auth), this._opts = Object.assign({}, n), this.io._autoConnect && this.open();
	}
	get disconnected() {
		return !this.connected;
	}
	subEvents() {
		if (this.subs) return;
		let e = this.io;
		this.subs = [
			Y(e, "open", this.onopen.bind(this)),
			Y(e, "packet", this.onpacket.bind(this)),
			Y(e, "error", this.onerror.bind(this)),
			Y(e, "close", this.onclose.bind(this))
		];
	}
	get active() {
		return !!this.subs;
	}
	connect() {
		return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
	}
	open() {
		return this.connect();
	}
	send(...e) {
		return e.unshift("message"), this.emit.apply(this, e), this;
	}
	emit(e, ...t) {
		if (Ze.hasOwnProperty(e)) throw Error("\"" + e.toString() + "\" is a reserved event name");
		if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) return this._addToQueue(t), this;
		let n = {
			type: q.EVENT,
			data: t
		};
		if (n.options = {}, n.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
			let e = this.ids++, r = t.pop();
			this._registerAckCallback(e, r), n.id = e;
		}
		let r = this.io.engine?.transport?.writable, i = this.connected && !this.io.engine?._hasPingExpired();
		return this.flags.volatile && !r || (i ? (this.notifyOutgoingListeners(n), this.packet(n)) : this.sendBuffer.push(n)), this.flags = {}, this;
	}
	_registerAckCallback(e, t) {
		let n = this.flags.timeout ?? this._opts.ackTimeout;
		if (n === void 0) {
			this.acks[e] = t;
			return;
		}
		let r = this.io.setTimeoutFn(() => {
			delete this.acks[e];
			for (let t = 0; t < this.sendBuffer.length; t++) this.sendBuffer[t].id === e && this.sendBuffer.splice(t, 1);
			t.call(this, /* @__PURE__ */ Error("operation has timed out"));
		}, n), i = (...e) => {
			this.io.clearTimeoutFn(r), t.apply(this, e);
		};
		i.withError = !0, this.acks[e] = i;
	}
	emitWithAck(e, ...t) {
		return new Promise((n, r) => {
			let i = (e, t) => e ? r(e) : n(t);
			i.withError = !0, t.push(i), this.emit(e, ...t);
		});
	}
	_addToQueue(e) {
		let t;
		typeof e[e.length - 1] == "function" && (t = e.pop());
		let n = {
			id: this._queueSeq++,
			tryCount: 0,
			pending: !1,
			args: e,
			flags: Object.assign({ fromQueue: !0 }, this.flags)
		};
		e.push((e, ...r) => (this._queue[0], e === null ? (this._queue.shift(), t && t(null, ...r)) : n.tryCount > this._opts.retries && (this._queue.shift(), t && t(e)), n.pending = !1, this._drainQueue())), this._queue.push(n), this._drainQueue();
	}
	_drainQueue(e = !1) {
		if (!this.connected || this._queue.length === 0) return;
		let t = this._queue[0];
		t.pending && !e || (t.pending = !0, t.tryCount++, this.flags = t.flags, this.emit.apply(this, t.args));
	}
	packet(e) {
		e.nsp = this.nsp, this.io._packet(e);
	}
	onopen() {
		typeof this.auth == "function" ? this.auth((e) => {
			this._sendConnectPacket(e);
		}) : this._sendConnectPacket(this.auth);
	}
	_sendConnectPacket(e) {
		this.packet({
			type: q.CONNECT,
			data: this._pid ? Object.assign({
				pid: this._pid,
				offset: this._lastOffset
			}, e) : e
		});
	}
	onerror(e) {
		this.connected || this.emitReserved("connect_error", e);
	}
	onclose(e, t) {
		this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks();
	}
	_clearAcks() {
		Object.keys(this.acks).forEach((e) => {
			if (!this.sendBuffer.some((t) => String(t.id) === e)) {
				let t = this.acks[e];
				delete this.acks[e], t.withError && t.call(this, /* @__PURE__ */ Error("socket has been disconnected"));
			}
		});
	}
	onpacket(e) {
		if (e.nsp === this.nsp) switch (e.type) {
			case q.CONNECT:
				e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", /* @__PURE__ */ Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
				break;
			case q.EVENT:
			case q.BINARY_EVENT:
				this.onevent(e);
				break;
			case q.ACK:
			case q.BINARY_ACK:
				this.onack(e);
				break;
			case q.DISCONNECT:
				this.ondisconnect();
				break;
			case q.CONNECT_ERROR:
				this.destroy();
				let t = Error(e.data.message);
				t.data = e.data.data, this.emitReserved("connect_error", t);
				break;
		}
	}
	onevent(e) {
		let t = e.data || [];
		e.id != null && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t));
	}
	emitEvent(e) {
		if (this._anyListeners && this._anyListeners.length) {
			let t = this._anyListeners.slice();
			for (let n of t) n.apply(this, e);
		}
		super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
	}
	ack(e) {
		let t = this, n = !1;
		return function(...r) {
			n || (n = !0, t.packet({
				type: q.ACK,
				id: e,
				data: r
			}));
		};
	}
	onack(e) {
		let t = this.acks[e.id];
		typeof t == "function" && (delete this.acks[e.id], t.withError && e.data.unshift(null), t.apply(this, e.data));
	}
	onconnect(e, t) {
		this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this._drainQueue(!0), this.emitReserved("connect");
	}
	emitBuffered() {
		this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
			this.notifyOutgoingListeners(e), this.packet(e);
		}), this.sendBuffer = [];
	}
	ondisconnect() {
		this.destroy(), this.onclose("io server disconnect");
	}
	destroy() {
		this.subs &&= (this.subs.forEach((e) => e()), void 0), this.io._destroy(this);
	}
	disconnect() {
		return this.connected && this.packet({ type: q.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
	}
	close() {
		return this.disconnect();
	}
	compress(e) {
		return this.flags.compress = e, this;
	}
	get volatile() {
		return this.flags.volatile = !0, this;
	}
	timeout(e) {
		return this.flags.timeout = e, this;
	}
	onAny(e) {
		return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
	}
	prependAny(e) {
		return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
	}
	offAny(e) {
		if (!this._anyListeners) return this;
		if (e) {
			let t = this._anyListeners;
			for (let n = 0; n < t.length; n++) if (e === t[n]) return t.splice(n, 1), this;
		} else this._anyListeners = [];
		return this;
	}
	listenersAny() {
		return this._anyListeners || [];
	}
	onAnyOutgoing(e) {
		return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
	}
	prependAnyOutgoing(e) {
		return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
	}
	offAnyOutgoing(e) {
		if (!this._anyOutgoingListeners) return this;
		if (e) {
			let t = this._anyOutgoingListeners;
			for (let n = 0; n < t.length; n++) if (e === t[n]) return t.splice(n, 1), this;
		} else this._anyOutgoingListeners = [];
		return this;
	}
	listenersAnyOutgoing() {
		return this._anyOutgoingListeners || [];
	}
	notifyOutgoingListeners(e) {
		if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
			let t = this._anyOutgoingListeners.slice();
			for (let n of t) n.apply(this, e.data);
		}
	}
};
//#endregion
//#region node_modules/socket.io-client/build/esm/contrib/backo2.js
function X(e) {
	e ||= {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
X.prototype.duration = function() {
	var e = this.ms * this.factor ** + this.attempts++;
	if (this.jitter) {
		var t = Math.random(), n = Math.floor(t * this.jitter * e);
		e = Math.floor(t * 10) & 1 ? e + n : e - n;
	}
	return Math.min(e, this.max) | 0;
}, X.prototype.reset = function() {
	this.attempts = 0;
}, X.prototype.setMin = function(e) {
	this.ms = e;
}, X.prototype.setMax = function(e) {
	this.max = e;
}, X.prototype.setJitter = function(e) {
	this.jitter = e;
};
//#endregion
//#region node_modules/socket.io-client/build/esm/manager.js
var $e = class extends j {
	constructor(e, t) {
		super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t ||= {}, t.path = t.path || "/socket.io", this.opts = t, F(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || Infinity), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor(t.randomizationFactor ?? .5), this.backoff = new X({
			min: this.reconnectionDelay(),
			max: this.reconnectionDelayMax(),
			jitter: this.randomizationFactor()
		}), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
		let n = t.parser || Ve;
		this.encoder = new n.Encoder(), this.decoder = new n.Decoder(), this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open();
	}
	reconnection(e) {
		return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
	}
	reconnectionAttempts(e) {
		return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
	}
	reconnectionDelay(e) {
		var t;
		return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) == null || t.setMin(e), this);
	}
	randomizationFactor(e) {
		var t;
		return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) == null || t.setJitter(e), this);
	}
	reconnectionDelayMax(e) {
		var t;
		return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) == null || t.setMax(e), this);
	}
	timeout(e) {
		return arguments.length ? (this._timeout = e, this) : this._timeout;
	}
	maybeReconnectOnOpen() {
		!this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
	}
	open(e) {
		if (~this._readyState.indexOf("open")) return this;
		this.engine = new Me(this.uri, this.opts);
		let t = this.engine, n = this;
		this._readyState = "opening", this.skipReconnect = !1;
		let r = Y(t, "open", function() {
			n.onopen(), e && e();
		}), i = (t) => {
			this.cleanup(), this._readyState = "closed", this.emitReserved("error", t), e ? e(t) : this.maybeReconnectOnOpen();
		}, a = Y(t, "error", i);
		if (!1 !== this._timeout) {
			let e = this._timeout, n = this.setTimeoutFn(() => {
				r(), i(/* @__PURE__ */ Error("timeout")), t.close();
			}, e);
			this.opts.autoUnref && n.unref(), this.subs.push(() => {
				this.clearTimeoutFn(n);
			});
		}
		return this.subs.push(r), this.subs.push(a), this;
	}
	connect(e) {
		return this.open(e);
	}
	onopen() {
		this.cleanup(), this._readyState = "open", this.emitReserved("open");
		let e = this.engine;
		this.subs.push(Y(e, "ping", this.onping.bind(this)), Y(e, "data", this.ondata.bind(this)), Y(e, "error", this.onerror.bind(this)), Y(e, "close", this.onclose.bind(this)), Y(this.decoder, "decoded", this.ondecoded.bind(this)));
	}
	onping() {
		this.emitReserved("ping");
	}
	ondata(e) {
		try {
			this.decoder.add(e);
		} catch (e) {
			this.onclose("parse error", e);
		}
	}
	ondecoded(e) {
		N(() => {
			this.emitReserved("packet", e);
		}, this.setTimeoutFn);
	}
	onerror(e) {
		this.emitReserved("error", e);
	}
	socket(e, t) {
		let n = this.nsps[e];
		return n ? this._autoConnect && !n.active && n.connect() : (n = new Qe(this, e, t), this.nsps[e] = n), n;
	}
	_destroy(e) {
		let t = Object.keys(this.nsps);
		for (let e of t) if (this.nsps[e].active) return;
		this._close();
	}
	_packet(e) {
		let t = this.encoder.encode(e);
		for (let n = 0; n < t.length; n++) this.engine.write(t[n], e.options);
	}
	cleanup() {
		this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
	}
	_close() {
		this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
	}
	disconnect() {
		return this._close();
	}
	onclose(e, t) {
		var n;
		this.cleanup(), (n = this.engine) == null || n.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect();
	}
	reconnect() {
		if (this._reconnecting || this.skipReconnect) return this;
		let e = this;
		if (this.backoff.attempts >= this._reconnectionAttempts) this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
		else {
			let t = this.backoff.duration();
			this._reconnecting = !0;
			let n = this.setTimeoutFn(() => {
				e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((t) => {
					t ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", t)) : e.onreconnect();
				}));
			}, t);
			this.opts.autoUnref && n.unref(), this.subs.push(() => {
				this.clearTimeoutFn(n);
			});
		}
	}
	onreconnect() {
		let e = this.backoff.attempts;
		this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
	}
}, Z = {};
function Q(e, t) {
	typeof e == "object" && (t = e, e = void 0), t ||= {};
	let n = Ne(e, t.path || "/socket.io"), r = n.source, i = n.id, a = n.path, o = Z[i] && a in Z[i].nsps, s = t.forceNew || t["force new connection"] || !1 === t.multiplex || o, c;
	return s ? c = new $e(r, t) : (Z[i] || (Z[i] = new $e(r, t)), c = Z[i]), n.query && !t.query && (t.query = n.queryKey), c.socket(n.path, t);
}
Object.assign(Q, {
	Manager: $e,
	Socket: Qe,
	io: Q,
	connect: Q
});
//#endregion
//#region src/utils/signalingClient.ts
var et = class {
	socket = null;
	config;
	namespace;
	constructor(e) {
		this.config = e, this.namespace = e.namespace || "/client";
	}
	async connect() {
		return new Promise((e, t) => {
			try {
				this.socket = Q(this.config.serverUrl + this.namespace, {
					transports: ["websocket", "polling"],
					reconnection: !0,
					reconnectionAttempts: 5,
					reconnectionDelay: 1e3
				}), this.socket.on("connect", () => {
					console.log("Connected to signaling server"), e(!0);
				}), this.socket.on("connect_error", (e) => {
					console.error("Connection error:", e), t(e);
				}), this.socket.on("disconnect", () => {
					console.log("Disconnected from signaling server");
				});
			} catch (e) {
				t(e);
			}
		});
	}
	async joinSession(e) {
		return new Promise((t, n) => {
			if (!this.socket) {
				n(/* @__PURE__ */ Error("Not connected to signaling server"));
				return;
			}
			this.socket.emit("join-session", { sessionId: e }, (e) => {
				t(e);
			});
		});
	}
	sendOffer(e, t) {
		if (!this.socket) throw Error("Not connected to signaling server");
		this.socket.emit("offer", {
			sessionId: e,
			offer: t
		});
	}
	sendIceCandidate(e, t) {
		if (!this.socket) throw Error("Not connected to signaling server");
		this.socket.emit("ice-candidate", {
			sessionId: e,
			candidate: t
		});
	}
	onAnswer(e) {
		if (!this.socket) throw Error("Not connected to signaling server");
		this.socket.on("answer", (t) => {
			e(t.answer);
		});
	}
	onIceCandidate(e) {
		if (!this.socket) throw Error("Not connected to signaling server");
		this.socket.on("ice-candidate", (t) => {
			e(t.candidate);
		});
	}
	disconnect() {
		this.socket &&= (this.socket.disconnect(), null);
	}
}, tt = class {
	pc = null;
	dataChannel = null;
	config;
	statsInterval = null;
	onStatsUpdate;
	constructor(e = {}) {
		this.config = e;
	}
	createConnection() {
		let e = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];
		return this.pc = new RTCPeerConnection({ iceServers: this.config.iceServers || e }), this.dataChannel = this.pc.createDataChannel("input", {
			ordered: !1,
			maxRetransmits: 0
		}), this.dataChannel.onopen = () => {
			console.log("Data channel opened");
		}, this.dataChannel.onclose = () => {
			console.log("Data channel closed");
		}, this.dataChannel.onerror = (e) => {
			console.error("Data channel error:", e);
		}, this.pc;
	}
	getPeerConnection() {
		return this.pc;
	}
	async createOffer() {
		if (!this.pc) throw Error("Peer connection not created");
		let e = await this.pc.createOffer();
		return await this.pc.setLocalDescription(e), e;
	}
	async setRemoteAnswer(e) {
		if (!this.pc) throw Error("Peer connection not created");
		await this.pc.setRemoteDescription(e);
	}
	async addIceCandidate(e) {
		if (!this.pc) throw Error("Peer connection not created");
		await this.pc.addIceCandidate(e);
	}
	sendData(e) {
		if (!this.dataChannel || this.dataChannel.readyState !== "open") {
			console.warn("Data channel not ready");
			return;
		}
		let t = typeof e == "string" ? e : JSON.stringify(e);
		this.dataChannel.send(t);
	}
	sendInput(e) {
		this.sendData({
			type: "input",
			data: e,
			timestamp: Date.now()
		});
	}
	requestQualityChange(e) {
		this.sendData({
			type: "quality_change",
			quality: e,
			timestamp: Date.now()
		});
	}
	startStats(e, t = 1e3) {
		this.onStatsUpdate = e, this.statsInterval = window.setInterval(async () => {
			if (this.pc) try {
				let e = await this.pc.getStats(), t = this.parseStats(e);
				this.onStatsUpdate && this.onStatsUpdate(t);
			} catch (e) {
				console.error("Error getting stats:", e);
			}
		}, t);
	}
	parseStats(e) {
		let t = 0, n = 0, r = 0, i = 0, a = "N/A";
		return e.forEach((e) => {
			let o = e;
			if (e.type === "inbound-rtp" && o.kind === "video") {
				let e = Number(o.bytesReceived ?? 0), t = Number(o.framesPerSecond ?? 0), a = Number(o.packetsLost ?? 0);
				n = Math.round(e * 8 / 1e3), i = t, r = a;
			}
			if (e.type === "track" && o.kind === "video") {
				let e = Number(o.frameWidth ?? 0), t = Number(o.frameHeight ?? 0);
				e > 0 && t > 0 && (a = `${e}x${t}`);
			}
			e.type === "candidate-pair" && o.state === "succeeded" && (t = Number(o.currentRoundTripTime ?? 0) * 1e3);
		}), {
			latency: Math.round(t),
			bitrate: n,
			packetLoss: r,
			frameRate: Math.round(i),
			resolution: a
		};
	}
	stopStats() {
		this.statsInterval &&= (clearInterval(this.statsInterval), null);
	}
	close() {
		this.stopStats(), this.dataChannel &&= (this.dataChannel.close(), null), this.pc &&= (this.pc.close(), null);
	}
}, nt = ({ signalingServerUrl: e, sessionId: a, autoConnect: o = !1 }) => {
	let [s, c] = i(!1), [l, u] = i(!1), [d, f] = i(null), [p, m] = i(null), [h, g] = i(null), _ = r(null), v = r(null), y = r(null), b = t(async () => {
		try {
			u(!0), f(null), v.current = new et({ serverUrl: e }), await v.current.connect();
			let t = await v.current.joinSession(a);
			if (!t.success) throw Error(t.message || "Failed to join session");
			m(t.session || null), y.current = new tt();
			let n = y.current.createConnection();
			n.onicecandidate = (e) => {
				e.candidate && v.current && v.current.sendIceCandidate(a, e.candidate);
			}, n.ontrack = (e) => {
				console.log("Received remote track"), _.current && e.streams[0] && (_.current.srcObject = e.streams[0]);
			}, n.onconnectionstatechange = () => {
				console.log("Connection state:", n.connectionState), n.connectionState === "connected" ? (c(!0), u(!1), y.current?.startStats(g)) : (n.connectionState === "failed" || n.connectionState === "closed") && (c(!1), f("Connection failed"));
			}, v.current.onAnswer(async (e) => {
				console.log("Received answer"), await y.current?.setRemoteAnswer(e);
			}), v.current.onIceCandidate(async (e) => {
				console.log("Received ICE candidate"), await y.current?.addIceCandidate(e);
			});
			let r = await y.current.createOffer();
			v.current.sendOffer(a, r);
		} catch (e) {
			console.error("Connection error:", e), f(e instanceof Error ? e.message : "Connection failed"), u(!1);
		}
	}, [e, a]), x = t(() => {
		y.current &&= (y.current.close(), null), v.current &&= (v.current.disconnect(), null), _.current && (_.current.srcObject = null), c(!1), u(!1), m(null), g(null);
	}, []), S = t((e) => {
		y.current?.sendInput(e);
	}, []), C = t((e) => {
		y.current?.requestQualityChange(e);
	}, []);
	return n(() => (o && b(), () => {
		x();
	}), []), {
		connected: s,
		connecting: l,
		error: d,
		sessionInfo: p,
		stats: h,
		videoRef: _,
		connect: b,
		disconnect: x,
		sendInput: S,
		changeQuality: C
	};
}, rt = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), it = /* @__PURE__ */ o(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === re ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case v: return "Fragment";
				case b: return "Profiler";
				case y: return "StrictMode";
				case w: return "Suspense";
				case ee: return "SuspenseList";
				case ne: return "Activity";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case _: return "Portal";
				case S: return e.displayName || "Context";
				case x: return (e._context.displayName || "Context") + ".Consumer";
				case C:
					var n = e.render;
					return e = e.displayName, e ||= (e = n.displayName || n.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case te: return n = e.displayName || null, n === null ? t(e.type) || "Memo" : n;
				case T:
					n = e._payload, e = e._init;
					try {
						return t(e(n));
					} catch {}
			}
			return null;
		}
		function n(e) {
			return "" + e;
		}
		function r(e) {
			try {
				n(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var r = t.error, i = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return r.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", i), n(e);
			}
		}
		function i(e) {
			if (e === v) return "<>";
			if (typeof e == "object" && e && e.$$typeof === T) return "<...>";
			try {
				var n = t(e);
				return n ? "<" + n + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function a() {
			var e = E.A;
			return e === null ? null : e.getOwner();
		}
		function o() {
			return Error("react-stack-top-frame");
		}
		function s(e) {
			if (D.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function l(e, t) {
			function n() {
				A || (A = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function u() {
			var e = t(this.type);
			return j[e] || (j[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function d(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: g,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: u
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function f(e, n, i, o, c, u) {
			var f = n.children;
			if (f !== void 0) if (o) if (O(f)) {
				for (o = 0; o < f.length; o++) p(f[o]);
				Object.freeze && Object.freeze(f);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else p(f);
			if (D.call(n, "key")) {
				f = t(e);
				var m = Object.keys(n).filter(function(e) {
					return e !== "key";
				});
				o = 0 < m.length ? "{key: someKey, " + m.join(": ..., ") + ": ...}" : "{key: someKey}", P[f + o] || (m = 0 < m.length ? "{" + m.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", o, f, m, f), P[f + o] = !0);
			}
			if (f = null, i !== void 0 && (r(i), f = "" + i), s(n) && (r(n.key), f = "" + n.key), "key" in n) for (var h in i = {}, n) h !== "key" && (i[h] = n[h]);
			else i = n;
			return f && l(i, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), d(e, f, i, a(), c, u);
		}
		function p(e) {
			m(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === T && (e._payload.status === "fulfilled" ? m(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function m(e) {
			return typeof e == "object" && !!e && e.$$typeof === g;
		}
		var h = c("react"), g = Symbol.for("react.transitional.element"), _ = Symbol.for("react.portal"), v = Symbol.for("react.fragment"), y = Symbol.for("react.strict_mode"), b = Symbol.for("react.profiler"), x = Symbol.for("react.consumer"), S = Symbol.for("react.context"), C = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), ee = Symbol.for("react.suspense_list"), te = Symbol.for("react.memo"), T = Symbol.for("react.lazy"), ne = Symbol.for("react.activity"), re = Symbol.for("react.client.reference"), E = h.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, D = Object.prototype.hasOwnProperty, O = Array.isArray, k = console.createTask ? console.createTask : function() {
			return null;
		};
		h = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var A, j = {}, M = h.react_stack_bottom_frame.bind(h, o)(), N = k(i(o)), P = {};
		e.Fragment = v, e.jsx = function(e, t, n) {
			var r = 1e4 > E.recentlyCreatedOwnerStacks++;
			return f(e, t, n, !1, r ? Error("react-stack-top-frame") : M, r ? k(i(e)) : N);
		}, e.jsxs = function(e, t, n) {
			var r = 1e4 > E.recentlyCreatedOwnerStacks++;
			return f(e, t, n, !0, r ? Error("react-stack-top-frame") : M, r ? k(i(e)) : N);
		};
	})();
})), $ = (/* @__PURE__ */ o(((e, t) => {
	process.env.NODE_ENV === "production" ? t.exports = rt() : t.exports = it();
})))(), at = ({ signalingServerUrl: t, sessionId: n, autoConnect: r = !1, showControls: a = !0, showStats: o = !0, className: s = "", onConnect: c, onDisconnect: l, onError: u }) => {
	let [d, f] = i("high"), { connected: p, connecting: m, error: h, sessionInfo: g, stats: _, videoRef: v, connect: y, disconnect: b, changeQuality: x } = nt({
		signalingServerUrl: t,
		sessionId: n,
		autoConnect: r
	}), S = async () => {
		await y(), c?.();
	}, C = () => {
		b(), l?.();
	}, w = (e) => {
		f(e), x(e);
	};
	return e.useEffect(() => {
		h && u?.(h);
	}, [h, u]), /* @__PURE__ */ (0, $.jsxs)("div", {
		className: `stream-player ${s}`,
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "video-container",
				children: [
					/* @__PURE__ */ (0, $.jsx)("video", {
						ref: v,
						autoPlay: !0,
						playsInline: !0,
						muted: !1,
						className: "video-element"
					}),
					!p && /* @__PURE__ */ (0, $.jsx)("div", {
						className: "connection-overlay",
						children: m ? /* @__PURE__ */ (0, $.jsxs)("div", {
							className: "connecting",
							children: [/* @__PURE__ */ (0, $.jsx)("div", { className: "spinner" }), /* @__PURE__ */ (0, $.jsx)("p", { children: "Connecting to session..." })]
						}) : /* @__PURE__ */ (0, $.jsxs)("div", {
							className: "not-connected",
							children: [
								/* @__PURE__ */ (0, $.jsx)("h3", { children: "Not Connected" }),
								/* @__PURE__ */ (0, $.jsxs)("p", { children: ["Session ID: ", n] }),
								h && /* @__PURE__ */ (0, $.jsx)("p", {
									className: "error",
									children: h
								}),
								/* @__PURE__ */ (0, $.jsx)("button", {
									onClick: S,
									className: "connect-button",
									children: "Connect"
								})
							]
						})
					}),
					o && p && _ && /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "stats-overlay",
						children: [
							/* @__PURE__ */ (0, $.jsxs)("div", {
								className: "stat",
								children: [/* @__PURE__ */ (0, $.jsx)("span", {
									className: "label",
									children: "Latency:"
								}), /* @__PURE__ */ (0, $.jsxs)("span", {
									className: "value",
									children: [_.latency, "ms"]
								})]
							}),
							/* @__PURE__ */ (0, $.jsxs)("div", {
								className: "stat",
								children: [/* @__PURE__ */ (0, $.jsx)("span", {
									className: "label",
									children: "Bitrate:"
								}), /* @__PURE__ */ (0, $.jsxs)("span", {
									className: "value",
									children: [(_.bitrate / 1e3).toFixed(1), " Mbps"]
								})]
							}),
							/* @__PURE__ */ (0, $.jsxs)("div", {
								className: "stat",
								children: [/* @__PURE__ */ (0, $.jsx)("span", {
									className: "label",
									children: "FPS:"
								}), /* @__PURE__ */ (0, $.jsx)("span", {
									className: "value",
									children: _.frameRate
								})]
							}),
							/* @__PURE__ */ (0, $.jsxs)("div", {
								className: "stat",
								children: [/* @__PURE__ */ (0, $.jsx)("span", {
									className: "label",
									children: "Resolution:"
								}), /* @__PURE__ */ (0, $.jsx)("span", {
									className: "value",
									children: _.resolution
								})]
							})
						]
					})
				]
			}),
			a && /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "controls",
				children: [/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "quality-controls",
					children: [
						/* @__PURE__ */ (0, $.jsx)("label", { children: "Quality:" }),
						/* @__PURE__ */ (0, $.jsx)("button", {
							onClick: () => w("high"),
							className: d === "high" ? "active" : "",
							disabled: !p,
							children: "High (1080p60)"
						}),
						/* @__PURE__ */ (0, $.jsx)("button", {
							onClick: () => w("medium"),
							className: d === "medium" ? "active" : "",
							disabled: !p,
							children: "Medium (720p60)"
						}),
						/* @__PURE__ */ (0, $.jsx)("button", {
							onClick: () => w("low"),
							className: d === "low" ? "active" : "",
							disabled: !p,
							children: "Low (540p60)"
						})
					]
				}), /* @__PURE__ */ (0, $.jsx)("div", {
					className: "connection-controls",
					children: p ? /* @__PURE__ */ (0, $.jsx)("button", {
						onClick: C,
						className: "disconnect-button",
						children: "Disconnect"
					}) : /* @__PURE__ */ (0, $.jsx)("button", {
						onClick: S,
						className: "connect-button",
						disabled: m,
						children: m ? "Connecting..." : "Connect"
					})
				})]
			}),
			g && /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "session-info",
				children: [/* @__PURE__ */ (0, $.jsxs)("p", { children: ["VM: ", g.vmId] }), g.metadata?.hostname && /* @__PURE__ */ (0, $.jsxs)("p", { children: ["Host: ", g.metadata.hostname] })]
			})
		]
	});
}, ot = () => {
	let [e, a] = i([]), [o, s] = i(!1), c = r(null), l = t((e) => ({
		connected: e.connected,
		id: e.id,
		index: e.index,
		buttons: Array.from(e.buttons),
		axes: Array.from(e.axes),
		timestamp: e.timestamp
	}), []), u = t(() => {
		let e = navigator.getGamepads(), t = [];
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			r && t.push(l(r));
		}
		a(t), s(t.length > 0), c.current = requestAnimationFrame(u);
	}, [l]), d = t((e) => {
		console.log("Gamepad connected:", e.gamepad.id);
	}, []), f = t((e) => {
		console.log("Gamepad disconnected:", e.gamepad.id);
	}, []);
	return n(() => {
		if (!("getGamepads" in navigator)) {
			console.warn("Gamepad API not supported");
			return;
		}
		return window.addEventListener("gamepadconnected", d), window.addEventListener("gamepaddisconnected", f), c.current = requestAnimationFrame(u), () => {
			window.removeEventListener("gamepadconnected", d), window.removeEventListener("gamepaddisconnected", f), c.current && cancelAnimationFrame(c.current);
		};
	}, [
		u,
		d,
		f
	]), {
		gamepads: e,
		connected: o,
		activeGamepad: e.length > 0 ? e[0] : null
	};
}, st = ({ enabled: e, onInput: i, captureElement: a, showGamepadStatus: o = !1 }) => {
	let { gamepads: s, connected: c, activeGamepad: l } = ot(), u = r(null), d = r(!1), f = t((t) => {
		e && (t.preventDefault(), i({
			type: "keyboard",
			key: t.key.toLowerCase(),
			code: t.code,
			action: "press"
		}));
	}, [e, i]), p = t((t) => {
		e && (t.preventDefault(), i({
			type: "keyboard",
			key: t.key.toLowerCase(),
			code: t.code,
			action: "release"
		}));
	}, [e, i]), m = t((t) => {
		!e || !d.current || i({
			type: "mouse_move",
			dx: t.movementX,
			dy: t.movementY
		});
	}, [e, i]), h = t((t) => {
		e && (t.preventDefault(), i({
			type: "mouse_button",
			button: [
				"left",
				"middle",
				"right"
			][t.button] || "left",
			action: "press"
		}));
	}, [e, i]), g = t((t) => {
		e && (t.preventDefault(), i({
			type: "mouse_button",
			button: [
				"left",
				"middle",
				"right"
			][t.button] || "left",
			action: "release"
		}));
	}, [e, i]), _ = t((t) => {
		e && (t.preventDefault(), i({
			type: "mouse_wheel",
			dx: t.deltaX,
			dy: t.deltaY
		}));
	}, [e, i]), v = t(() => {
		e && (a?.current || document.body).requestPointerLock?.();
	}, [e, a]), y = t(() => {
		d.current = document.pointerLockElement !== null;
	}, []);
	return n(() => {
		if (!e || !l) return;
		let t = u.current;
		l.buttons.forEach((e, n) => {
			let r = t?.buttons[n]?.pressed || !1, a = e.pressed;
			r !== a && i({
				type: "gamepad",
				action_type: "button",
				button: n,
				pressed: a,
				value: e.value
			});
		});
		let n = .15;
		l.axes.forEach((e, r) => {
			let a = t?.axes[r] || 0, o = Math.abs(e) > n ? e : 0;
			Math.abs(o - (Math.abs(a) > n ? a : 0)) > .01 && i({
				type: "gamepad",
				action_type: "axis",
				axis: r,
				value: o
			});
		}), u.current = l;
	}, [
		l,
		e,
		i
	]), n(() => {
		if (!e) return;
		let t = a?.current || document;
		return t.addEventListener("keydown", f), t.addEventListener("keyup", p), t.addEventListener("mousemove", m), t.addEventListener("mousedown", h), t.addEventListener("mouseup", g), t.addEventListener("wheel", _), t.addEventListener("click", v), document.addEventListener("pointerlockchange", y), () => {
			t.removeEventListener("keydown", f), t.removeEventListener("keyup", p), t.removeEventListener("mousemove", m), t.removeEventListener("mousedown", h), t.removeEventListener("mouseup", g), t.removeEventListener("wheel", _), t.removeEventListener("click", v), document.removeEventListener("pointerlockchange", y), document.pointerLockElement && document.exitPointerLock();
		};
	}, [
		e,
		a,
		f,
		p,
		m,
		h,
		g,
		_,
		v,
		y
	]), o ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "gamepad-status",
		children: [/* @__PURE__ */ (0, $.jsx)("h4", { children: "Gamepad Status" }), c ? /* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("p", { children: "✓ Gamepad Connected" }), s.map((e) => /* @__PURE__ */ (0, $.jsxs)("p", { children: [
			e.index,
			": ",
			e.id
		] }, e.index))] }) : /* @__PURE__ */ (0, $.jsx)("p", { children: "No gamepad detected" })]
	}) : null;
};
//#endregion
export { st as InputHandler, et as SignalingClient, at as StreamPlayer, tt as WebRTCClient, ot as useController, nt as useStreamConnection };
