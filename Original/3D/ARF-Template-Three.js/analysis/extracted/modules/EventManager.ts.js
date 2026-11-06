System['register']("chunks:///_virtual/EventManager.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc'], function (d) {
  var f, g, h;
  return {
    'setters': [function (i) {
      var cH = b;
      f = i["createClass"];
    }
    , function (i) {
      var cI = b;
      g = i["cclegacy"], h = i["EventTarget"];
    }
    ], 'execute': function () {
      var cJ = b;
      g["_RF"]["push"]({
      }
      , '6ca45TLQiFNX5gCWmOlNhHN', 'EventManager', void 0x0), d("EventManager", function () {
        var cK = cJ;
        function i() {
        }
        return f(i, null, [{
          'key': "instance", 'get': function () {
            var cL = cK;
            return this["_instance"] || (this["_instance"] = new h()), this["_instance"];
          }
        }
        ]), i;
      }
      ())["_instance"] = null, d("GameEvents", {
        'BLOCK_REACHED_POINT': "block-reached-point", 'BLOCK_DESTROYED': "block-destroyed", 'CANNON_DESTROYED': "cannon-destroyed" }
      ), g["_RF"]["pop"]();
    }
  }
  ;
}
)
