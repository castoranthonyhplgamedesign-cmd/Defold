System["register"]("chunks:///_virtual/CTAButtonHandler.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc', "./Analytics.ts"], function (f) {
  var g, h, j, k, m, q, v, w, x, z, A, B, C;
  return {
    'setters': [function (D) {
      var cx = b;
      g = D["applyDecoratedDescriptor"], h = D["inheritsLoose"], j = D['initializerDefineProperty'], k = D["assertThisInitialized"];
    }
    , function (D) {
      var cy = b;
      m = D['cclegacy'], q = D["_decorator"], v = D["CCString"], w = D["find"], x = D["AudioSource"], z = D["sys"], A = D["Component"];
    }
    , function (D) {
      var cz = b;
      B = D['Analytics'], C = D["analyticsEvents"];
    }
    ], 'execute': function () {
      var cA = b, D, E, F, G, H, I, J;
      m["_RF"]["push"]({
      }
      , "215a55p2fpL3L6lcswjxo3B", 'CTAButtonHandler', void 0x0);
      var K = q['ccclass'], M = q["property"];
      f("CTAButtonHandler", (D = K("CTAButtonHandler"), E = M({
        'type': v, 'tooltip': 'The\x20app\x20store\x20URL\x20to\x20open\x20on\x20click.' }
      ), F = M(v), D((I = g((H = function (N) {
        var cC = cA;
        function O() {
          var cB = b;
          for (var Q, T = arguments["length"], U = new Array(T), V = 0x0;
          V < T;
          V++)  U[V] = arguments[V];
          return Q = N["call"]["apply"](N, [this]["concat"](U)) || this, j(Q, "playStoreURL", I, k(Q)), j(Q, "appStoreURL", J, k(Q)), Q["isMraidReady"] = !0x1, Q;
        }
        h(O, N);
        var P = O["prototype"];
        return P["onLoad"] = function () {
          var cD = cC;
          "undefined" != typeof mraid ? (console["log"]('MRAID\x20environment\x20detected.'), 'loading' === mraid['getState']() ? (console["log"]("MRAID is loading. Waiting for the 'ready' event..."), mraid["addEventListener"]("ready", this["onMraidReady"]["bind"](this))) : this['onMraidReady']()) : console["warn"]("MRAID library not found. Clicks will use a fallback 'window.open'.");
        }
        , P["onMraidReady"] = function () {
          var cE = cC;
          console["log"]("MRAID is ready. Click-through will use mraid.open()."), this["isMraidReady"] = !0x0;
        }
        , P["onStoreButtonClicked"] = function () {
          var cF = cC, Q;
          console['log']("Store button clicked!"), B["instance"]["dispatchEvent"](C["CTA_CLICKED"]);
          var T = null == (Q = w("Canvas-001/GameCamera")) ? void 0x0 : Q["getComponent"](x);
          T && T["stop"]();
          var U = this["playStoreURL"];
          U = z['os'] === z['OS']["OSX"] || z['os'] === z['OS']["IOS"] ? this["appStoreURL"] : this["playStoreURL"], this["isMraidReady"] ? (console["log"]('Calling\x20mraid.open()\x20with\x20URL:', U), mraid["open"](U)) : (console["log"]("FALLBACK: MRAID not available. Opening URL with window.open: " + U), window["open"](U, "_blank"));
        }
        , O;
      }
      (A))['prototype'], "playStoreURL", [E], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          var cG = cA;
          return "https://play.google.com/store/apps/details?id=com.game.goolny.stickers";
        }
      }
      ), J = g(H['prototype'], "appStoreURL", [F], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return '';
        }
      }
      ), G = H)) || G)), m["_RF"]["pop"]();
    }
  }
  ;
}
)
