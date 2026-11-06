System["register"]("chunks:///_virtual/Arrow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (d) {
  var g, h, j, k, m, p, q, v, w, x, y;
  return {
    'setters': [function (z) {
      var bX = b;
      g = z["applyDecoratedDescriptor"], h = z['inheritsLoose'], j = z["createClass"], k = z['initializerDefineProperty'], m = z["assertThisInitialized"];
    }
    , function (z) {
      var bY = b;
      p = z['cclegacy'], q = z["_decorator"], v = z["Vec3"], w = z["Prefab"], x = z['BoxCollider'], y = z["Component"];
    }
    ], 'execute': function () {
      var bZ = b, B, D, E, F, G, H, I, J, K, L, M;
      p['_RF']["push"]({
      }
      , '37b22a7CuRKMZ4IdHQmF3sZ', "Arrow", void 0x0);
      var N = q['ccclass'], O = q["property"];
      d("Arrow", (B = N("Arrow"), D = O(v), E = O(String), F = O([v]), G = O(w), B((J = g((I = function (P) {
        var c1 = bZ;
        function Q() {
          var c0 = b;
          for (var S, T = arguments["length"], U = new Array(T), V = 0x0;
          V < T;
          V++)  U[V] = arguments[V];
          return S = P["call"]['apply'](P, [this]['concat'](U)) || this, k(S, "direction", J, m(S)), k(S, 'color', K, m(S)), k(S, "cells", L, m(S)), k(S, "blockPrefab", M, m(S)), S["moving"] = !0x1, S;
        }
        h(Q, P);
        var R = Q["prototype"];
        return R["toggleColliders"] = function (S) {
          var c2 = c1;
          this["node"]["getComponentsInChildren"](x)["forEach"](function (T) {
            var c3 = c2;
            T["enabled"] = S;
          }
          );
        }
        , R['turnCornersToBlocks'] = function () {
          var c4 = c1;
          for (var S = this["node"]["children"], T = 0x1;
          T < S["length"];
          T++)  S[T]['getChildByName']("Default")["active"] = !0x0, S[T]["getChildByName"]("Corner")['active'] = !0x1;
        }
        , R["start"] = function () {
        }
        , j(Q, [{
          'key': "segments", 'get': function () {
            var c5 = c1;
            return this["node"]['children'];
          }
        }
        ]), Q;
      }
      (y))["prototype"], 'direction', [D], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return new v(0x0, 0x0, 0x0);
        }
      }
      ), K = g(I['prototype'], "color", [E], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return '';
        }
      }
      ), L = g(I["prototype"], "cells", [F], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return [];
        }
      }
      ), M = g(I["prototype"], "blockPrefab", [G], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), H = I)) || H)), p["_RF"]['pop']();
    }
  }
  ;
}
)
