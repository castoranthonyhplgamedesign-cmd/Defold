System['register']("chunks:///_virtual/Analytics.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc'], function (c) {
  var d, f, g, h, i;
  return {
    'setters': [function (j) {
      var bP = b;
      d = j["inheritsLoose"], f = j["createClass"];
    }
    , function (j) {
      var bQ = b;
      g = j["cclegacy"], h = j['_decorator'], i = j["Component"];
    }
    ], 'execute': function () {
      var bR = b, j, k;
      g["_RF"]["push"]({
      }
      , "3d2c2e27l1A+qa6hF/Y6ALE", "Analytics", void 0x0);
      var l = h["ccclass"];
      h['property'], c("analyticsEvents", function (m) {
        var bS = bR;
        return m['LOADING'] = "LOADING", m['LOADED'] = "LOADED", m["DISPLAYED"] = "DISPLAYED", m['CHALLENGE_STARTED'] = "CHALLENGE_STARTED", m["CHALLENGE_FAILED"] = "CHALLENGE_FAILED", m["CHALLENGE_RETRY"] = "CHALLENGE_RETRY", m['CHALLENGE_PASS_25'] = "CHALLENGE_PASS_25", m["CHALLENGE_PASS_50"] = 'CHALLENGE_PASS_50', m['CHALLENGE_PASS_75'] = "CHALLENGE_PASS_75", m["CHALLENGE_SOLVED"] = 'CHALLENGE_SOLVED', m["CTA_CLICKED"] = "CTA_CLICKED", m["ENDCARD_SHOWN"] = "ENDCARD_SHOWN", m;
      }
      ({
      }
      )), c("Analytics", l("Analytics")(((k = function (m) {
        var bU = bR;
        function o() {
          var bT = b;
          return m["apply"](this, arguments) || this;
        }
        d(o, m);
        var p = o['prototype'];
        return p["onLoad"] = function () {
          o['_instance'] = this;
        }
        , p["dispatchEvent"] = function (q, r) {
          var bV = bU;
          window["ALPlayableAnalytics"] && 'function' == typeof window["ALPlayableAnalytics"]["trackEvent"] ? window["ALPlayableAnalytics"]["trackEvent"](q) : window["dispatchEvent"](new Event(q));
        }
        , f(o, null, [{
          'key': 'instance', 'get': function () {
            var bW = bU;
            return this["_instance"];
          }
        }
        ]), o;
      }
      (i))["_instance"] = void 0x0, j = k)) || j), g["_RF"]["pop"]();
    }
  }
  ;
}
)
