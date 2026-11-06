System["register"]("chunks:///_virtual/HandAnim.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (d) {
  var f, g, j, k, m, p, q, u, v, w;
  return {
    'setters': [function (x) {
      var dQ = b;
      f = x["applyDecoratedDescriptor"], g = x["inheritsLoose"], j = x["initializerDefineProperty"], k = x["assertThisInitialized"];
    }
    , function (x) {
      var dR = b;
      m = x["cclegacy"], p = x["_decorator"], q = x["UITransform"], u = x["tween"], v = x["Vec3"], w = x["Component"];
    }
    ], 'execute': function () {
      var dS = b, x, z, A, B, C;
      m['_RF']["push"]({
      }
      , "11aa0TpPd9Et477OkBF+fLY", "HandAnim", void 0x0);
      var D = p["ccclass"], E = p["property"];
      d('HandAnim', D("HandAnim")((A = f((z = function (F) {
        var dU = dS;
        function G() {
          var dT = b;
          for (var I, J = arguments["length"], K = new Array(J), L = 0x0;
          L < J;
          L++)  K[L] = arguments[L];
          return I = F["call"]["apply"](F, [this]["concat"](K)) || this, j(I, "tapIntensity", A, k(I)), j(I, "tapDistance", B, k(I)), j(I, "useScaleSquash", C, k(I)), I["idle"] = null, I["tap"] = null, I["originalPos"] = new v(), I["currentTween"] = null, I;
        }
        g(G, F);
        var H = G["prototype"];
        return H["start"] = function () {
          var dV = dU;
          this["node"]["getComponent"](q)["priority"] = 0xf4240, this["idle"] = this['node']["getChildByName"]("idle"), this["tap"] = this['node']["getChildByName"]("tap"), this["idle"]["getComponent"](q)['priority'] = 0x186a0, this["tap"]["getComponent"](q)["priority"] = 0x186a0, this["idle"] && this["tap"] ? (this["originalPos"] = this["node"]["position"]["clone"](), this["tap"]["active"] = !0x1, this["idle"]["active"] = !0x0, this["startTapAnimation"]()) : console["error"]("HandAnim: Missing idle or tap child nodes!");
        }
        , H["startTapAnimation"] = function () {
          var dW = dU, I = this;
          this["currentTween"] && this["currentTween"]["stop"](), this["node"]["setPosition"](this["originalPos"]), this["node"]["setRotationFromEuler"](0x0, 0x0, 0x0), this['switchToSprite'](this["idle"]), this["currentTween"] = u(this['node'])["delay"](0.8)['repeatForever'](u()["call"](function () {
            var dX = dW;
            I["switchToSprite"](I["idle"]);
          }
          )['to'](0.2, {
            'position': new v(this["originalPos"]['x'], this["originalPos"]['y'] + 0.3 * this["tapDistance"], this["originalPos"]['z']), 'eulerAngles': new v(-0xf, 0x0, 0x0) }
          , {
            'easing': "quadOut" }
          )["call"](function () {
            var dY = dW;
            I['switchToSprite'](I["tap"]);
          }
          )['to'](0.1, {
            'position': new v(this['originalPos']['x'], this['originalPos']['y'] - this["tapDistance"], this["originalPos"]['z']), 'eulerAngles': new v(0x14, 0x0, 0x0) }
          , {
            'easing': "quadIn" }
          )["call"](function () {
            var dZ = dW;
            I["useScaleSquash"] && u(I["node"])['to'](0.05, {
              'scale': new v(1.1, 0.9, 0x1) }
            )['to'](0.08, {
              'scale': new v(0.95, 1.05, 0x1) }
            )['to'](0.12, {
              'scale': v['ONE'] }
            )["start"]();
          }
          )['to'](0.15, {
            'position': new v(this['originalPos']['x'], this["originalPos"]['y'] - 0.2 * this["tapDistance"], this['originalPos']['z']), 'eulerAngles': new v(-0x5, 0x0, 0x0) }
          , {
            'easing': "quadOut" }
          )["call"](function () {
            var e0 = dW;
            I["switchToSprite"](I["idle"]);
          }
          )['to'](0.25, {
            'position': this["originalPos"]["clone"](), 'eulerAngles': v['ZERO'] }
          , {
            'easing': "quadInOut" }
          )["delay"](0.4))["start"]();
        }
        , H["updatePositionAndAnimate"] = function (I) {
          var e1 = dU;
          this['originalPos'] = I["clone"](), this["node"]["setPosition"](this["originalPos"]), this["startTapAnimation"]();
        }
        , H["switchToSprite"] = function (I) {
          var e2 = dU;
          I === this["idle"] ? (this["idle"]["active"] = !0x0, this["tap"]["active"] = !0x1) : (this["idle"]['active'] = !0x1, this["tap"]["active"] = !0x0);
        }
        , H['play'] = function () {
          var e3 = dU;
          this["startTapAnimation"]();
        }
        , H["stop"] = function () {
          var e4 = dU;
          this["currentTween"] && (this["currentTween"]['stop'](), this["currentTween"] = null), this["switchToSprite"](this["idle"]), this["node"]["position"] = this['originalPos'], this["node"]['eulerAngles'] = v['ZERO'], this["node"]["scale"] = v["ONE"];
        }
        , H["update"] = function (I) {
        }
        , G;
      }
      (w))["prototype"], "tapIntensity", [E], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 1.2;
        }
      }
      ), B = f(z['prototype'], "tapDistance", [E], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0.3;
        }
      }
      ), C = f(z['prototype'], 'useScaleSquash', [E], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return !0x0;
        }
      }
      ), x = z)) || x), m["_RF"]["pop"]();
    }
  }
  ;
}
)
