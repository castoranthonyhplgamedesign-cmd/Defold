System["register"]("chunks:///_virtual/Cannon.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc', "./Block.ts", "./EventManager.ts"], function (g) {
  var j, k, q, v, w, x, y, z, A, B, C, D, E, F, G, H;
  return {
    'setters': [function (I) {
      var cl = b;
      j = I['applyDecoratedDescriptor'], k = I["inheritsLoose"], q = I["initializerDefineProperty"], v = I["assertThisInitialized"];
    }
    , function (I) {
      var cm = b;
      w = I["cclegacy"], x = I["_decorator"], y = I["Prefab"], z = I["BoxCollider"], A = I["Label"], B = I["instantiate"], C = I['tween'], D = I['Vec3'], E = I["Component"];
    }
    , function (I) {
      var cn = b;
      F = I["Block"];
    }
    , function (I) {
      var co = b;
      G = I['EventManager'], H = I["GameEvents"];
    }
    ], 'execute': function () {
      var cp = b, I, J, K, M, Q, R, S, T, U, V, W, X, Y;
      w["_RF"]['push']({
      }
      , "23711t3h+FBD6N09s+vYBi3", "Cannon", void 0x0);
      var Z = x['ccclass'], a0 = x["property"];
      g("Cannon", (I = Z("Cannon"), J = a0(y), K = a0(String), M = a0(z), Q = a0(Number), R = a0(A), I((U = j((T = function (a1) {
        var cr = cp;
        function a2() {
          var cq = b;
          for (var a4, a5 = arguments['length'], a6 = new Array(a5), a7 = 0x0;
          a7 < a5;
          a7++)  a6[a7] = arguments[a7];
          return a4 = a1["call"]["apply"](a1, [this]['concat'](a6)) || this, q(a4, "projectilePrefab", U, v(a4)), q(a4, "color", V, v(a4)), q(a4, "detectionBox", W, v(a4)), q(a4, "ammo", X, v(a4)), q(a4, "ammoLabel", Y, v(a4)), a4;
        }
        k(a2, a1);
        var a3 = a2['prototype'];
        return a3["start"] = function () {
          var cs = cr;
          this["ammoLabel"]["string"] = this["ammo"]["toString"](), this["detectionBox"]['on']('onCollisionEnter', this["onDetectionEnter"], this);
        }
        , a3['onDetectionEnter'] = function (a4) {
          var ct = cr, a5 = a4["otherCollider"]['node'], a6 = a5['getComponent'](F);
          a6 && a6["color"] === this["color"] && !a6["inTransit"] && this["destroyBlock"](a5);
        }
        , a3["destroyBlock"] = function (a4) {
          var cu = cr, a5 = this, a6 = B(this["projectilePrefab"]);
          a6['setParent'](this["node"]), C(this["node"])["stop"](), C(this["node"])['to'](0.05, {
            'scale': new D(1.15, 1.15, 1.15) }
          , {
            'easing': "backOut" }
          )['to'](0.1, {
            'scale': D['ONE'] }
          , {
            'easing': "bounceOut" }
          )['start'](), C(a6)['to'](0.1, {
            'worldPosition': this["detectionBox"]['node']["getWorldPosition"]()["clone"]() }
          , {
            'easing': 'linear' }
          )["call"](function () {
            var cv = cu;
            a6["destroy"](), a5["ammo"]--, a5["ammoLabel"]["string"] = a5["ammo"]["toString"](), 0x0 === a5["ammo"] && (a5['detectionBox']["destroy"](), G["instance"]["emit"](H['CANNON_DESTROYED'], a5["node"]));
          }
          )["start"](), C(a4)['to'](0.1, {
            'scale': D["ZERO"] }
          )['call'](function () {
            var cw = cu;
            G["instance"]["emit"](H["BLOCK_DESTROYED"], a4);
          }
          )["start"]();
        }
        , a3["update"] = function (a4) {
        }
        , a2;
      }
      (E))["prototype"], "projectilePrefab", [J], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), V = j(T['prototype'], "color", [K], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return '';
        }
      }
      ), W = j(T["prototype"], "detectionBox", [M], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), X = j(T['prototype'], "ammo", [Q], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x4;
        }
      }
      ), Y = j(T["prototype"], "ammoLabel", [R], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), S = T)) || S)), w["_RF"]['pop']();
    }
  }
  ;
}
)
