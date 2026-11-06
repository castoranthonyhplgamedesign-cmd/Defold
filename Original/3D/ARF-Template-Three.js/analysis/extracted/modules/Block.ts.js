System["register"]('chunks:///_virtual/Block.ts', ["./rollupPluginModLoBabelHelpers.js", 'cc'], function (d) {
  var f, g, h, j, k, m, p, q;
  return {
    'setters': [function (s) {
      var cg = b;
      f = s['applyDecoratedDescriptor'], g = s["inheritsLoose"], h = s["initializerDefineProperty"], j = s["assertThisInitialized"];
    }
    , function (s) {
      var ch = b;
      k = s['cclegacy'], m = s["_decorator"], p = s['Vec3'], q = s["Component"];
    }
    ], 'execute': function () {
      var ci = b, v, w, x, z, A;
      k["_RF"]["push"]({
      }
      , "84d47cVs2hCxp3TqBUMUuXo", "Block", void 0x0);
      var B = m["ccclass"], C = m["property"];
      d("Block", (v = B("Block"), w = C(String), v((A = f((z = function (D) {
        var ck = ci;
        function E() {
          var cj = b;
          for (var G, H = arguments["length"], I = new Array(H), J = 0x0;
          J < H;
          J++)  I[J] = arguments[J];
          return G = D['call']["apply"](D, [this]['concat'](I)) || this, h(G, "color", A, j(G)), G["targetPos"] = new p(), G["inTransit"] = !0x1, G["joinProgress"] = 0x0, G;
        }
        g(E, D);
        var F = E["prototype"];
        return F['start'] = function () {
        }
        , F["update"] = function (G) {
        }
        , E;
      }
      (q))["prototype"], "color", [w], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return '';
        }
      }
      ), x = z)) || x)), k['_RF']["pop"]();
    }
  }
  ;
}
)
