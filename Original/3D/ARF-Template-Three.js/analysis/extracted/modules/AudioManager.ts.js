System["register"]("chunks:///_virtual/AudioManager.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc'], function (c) {
  var d, f, g, h, j, k;
  return {
    'setters': [function (l) {
      var c6 = b;
      d = l['inheritsLoose'], f = l["createClass"];
    }
    , function (l) {
      var c7 = b;
      g = l["cclegacy"], h = l['_decorator'], j = l['AudioSource'], k = l["Component"];
    }
    ], 'execute': function () {
      var c8 = b, l, m;
      g["_RF"]['push']({
      }
      , "69cae2Tl0tD0Yqwg06jqN6N", "AudioManager", void 0x0);
      var p = h["ccclass"];
      h["property"], c('AudioManager', p("AudioManager")(((m = function (q) {
        var ca = c8;
        function v() {
          var c9 = b;
          for (var x, y = arguments["length"], z = new Array(y), A = 0x0;
          A < y;
          A++)  z[A] = arguments[A];
          return (x = q["call"]["apply"](q, [this]["concat"](z)) || this)["audioSource"] = null, x;
        }
        d(v, q);
        var w = v["prototype"];
        return w["onLoad"] = function () {
          var cb = ca;
          v["_instance"] = this, this["audioSource"] = this['node']['getComponent'](j);
        }
        , w['play'] = function (x, y) {
          var cc = ca;
          void 0x0 === y && (y = 0x1), this['audioSource']["playOneShot"](x, y);
        }
        , w["playBGM"] = function () {
          var cd = ca;
          this["audioSource"]["play"](), this["audioSource"]["loop"] = !0x0, this['audioSource']["volume"] = 0x1;
        }
        , w["stop"] = function () {
          var ce = ca;
          this["audioSource"]['stop'](), this["audioSource"]['loop'] = !0x1, this["audioSource"]["volume"] = 0x0;
        }
        , f(v, null, [{
          'key': 'instance', 'get': function () {
            var cf = ca;
            return this["_instance"];
          }
        }
        ]), v;
      }
      (k))['_instance'] = void 0x0, l = m)) || l), g['_RF']['pop']();
    }
  }
  ;
}
)
