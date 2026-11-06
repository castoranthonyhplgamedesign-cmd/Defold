System["register"]("chunks:///_virtual/Tunnel.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc', './Cannon.ts', "./EventManager.ts"], function (g) {
  var j, k, m, q, v, w, x, y, z, A, B, D, E, F, G;
  return {
    'setters': [function (H) {
      var eQ = b;
      j = H["applyDecoratedDescriptor"], k = H["inheritsLoose"], m = H["createClass"], q = H["initializerDefineProperty"], v = H["assertThisInitialized"];
    }
    , function (H) {
      var eR = b;
      w = H["cclegacy"], x = H['_decorator'], y = H['Label'], z = H['Vec3'], A = H["tween"], B = H["UIOpacity"], D = H["Component"];
    }
    , function (H) {
      var eS = b;
      E = H["Cannon"];
    }
    , function (H) {
      var eT = b;
      F = H["EventManager"], G = H['GameEvents'];
    }
    ], 'execute': function () {
      var eU = b, H, I, J, K, M;
      w["_RF"]['push']({
      }
      , "73c7a1WIqtIwYCWx1wSTWb1", "Tunnel", void 0x0);
      var N = x["ccclass"], O = x["property"];
      g("Tunnel", (H = N("Tunnel"), I = O(y), H((M = j((K = function (P) {
        var eW = eU;
        function Q() {
          var eV = b;
          for (var S, T = arguments["length"], U = new Array(T), V = 0x0;
          V < T;
          V++)  U[V] = arguments[V];
          return S = P["call"]["apply"](P, [this]["concat"](U)) || this, q(S, "cannonCountLabel", M, v(S)), S;
        }
        k(Q, P);
        var R = Q['prototype'];
        return R["start"] = function () {
          var eX = eW, S = this;
          this["refresh"](), F["instance"]['on'](G["CANNON_DESTROYED"], function (T) {
            var eY = eX;
            S["onCannonDestroyed"](T);
          }
          , this);
        }
        , R["onCannonDestroyed"] = function (S) {
          var eZ = eW, T = this;
          S["isChildOf"](this["node"]) && (S["destroy"](), this["scheduleOnce"](function () {
            var f0 = eZ;
            T['cannons']["forEach"](function (U, V) {
              var f1 = f0, W = new z(0x0, 0.43, 2.2 * (0x1 - V)), X = z["ONE"];
              V > 0x1 && (X = z["ZERO"]), A(U)['to'](0.3, {
                'scale': X, 'position': W }
              , {
                'easing': "smooth" }
              )['call'](function () {
                T['refresh']();
              }
              )['start']();
            }
            );
          }
          , 0x0));
        }
        , R['refresh'] = function () {
          var f2 = eW, S = this['cannons']["slice"](0x1)["length"];
          this["cannonCountLabel"]['string'] = S["toString"](), 0x0 === S && A(this["cannonCountLabel"]["getComponent"](B))['to'](0.3, {
            'opacity': 0x0 }
          )['start'](), this["cannons"]['sort'](function (T, U) {
            var f3 = f2;
            return U["worldPositionZ"] - T["worldPositionZ"];
          }
          )['forEach'](function (T, U) {
            var f4 = f2, V = T["getComponent"](E);
            0x0 === U ? (A(V['ammoLabel']['getComponent'](B))['to'](0.3, {
              'opacity': 0xff }
            , {
              'easing': 'fade' }
            )["start"](), V["detectionBox"]["node"]["active"] = !0x0) : (V['ammoLabel']['getComponent'](B)["opacity"] = 0x0, V["detectionBox"]["node"]["active"] = !0x1), U > 0x1 && T["setScale"](z["ZERO"]);
          }
          );
        }
        , m(Q, [{
          'key': "cannons", 'get': function () {
            var f5 = eW;
            return this["node"]["getChildByName"]("Cannons")["children"];
          }
        }
        ]), Q;
      }
      (D))["prototype"], "cannonCountLabel", [I], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), J = K)) || J)), w["_RF"]["pop"]();
    }
  }
  ;
}
)
