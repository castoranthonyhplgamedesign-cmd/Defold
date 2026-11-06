System["register"]("chunks:///_virtual/RNG.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc'], function (d) {
  var f, g, h, j, k, l, m, p, q;
  return {
    'setters': [function (v) {
      var eI = b;
      f = v["applyDecoratedDescriptor"], g = v["inheritsLoose"], h = v["createClass"], j = v["initializerDefineProperty"], k = v['assertThisInitialized'];
    }
    , function (v) {
      var eJ = b;
      l = v["cclegacy"], m = v['_decorator'], p = v["CCFloat"], q = v["Component"];
    }
    ], 'execute': function () {
      var eK = b, w, x, z, A, B, C;
      l["_RF"]["push"]({
      }
      , "aa0982Vum9KV7ooGEGqdhKy", 'RNG', void 0x0);
      var D = m["ccclass"], E = m['property'];
      d("RNG", (w = D('RNG'), x = E(p), w(((C = function (F) {
        var eM = eK;
        function G() {
          var eL = b;
          for (var H, I = arguments["length"], J = new Array(I), K = 0x0;
          K < I;
          K++)  J[K] = arguments[K];
          return H = F["call"]["apply"](F, [this]["concat"](J)) || this, j(H, "seed", B, k(H)), H['rng'] = void 0x0, H;
        }
        return g(G, F), G['prototype']["onLoad"] = function () {
          var eN = eM, H, I;
          G['_instance'] = this, this['rng'] = (H = this["seed"], I = H, function () {
            var eO = eN;
            I += 0x6d2b79f5;
            var J = Math['imul'](I ^ I >>> 0xf, 0x1 | I);
            return (((J ^= J + Math["imul"](J ^ J >>> 0x7, 0x3d | J)) ^ J >>> 0xe) >>> 0x0) / 0x100000000;
          }
          );
        }
        , h(G, null, [{
          'key': "instance", 'get': function () {
            var eP = eM;
            return this["_instance"];
          }
        }
        ]), G;
      }
      (q))["_instance"] = void 0x0, B = f((A = C)["prototype"], 'seed', [x], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x4d2;
        }
      }
      ), z = A)) || z)), l['_RF']["pop"]();
    }
  }
  ;
}
)
