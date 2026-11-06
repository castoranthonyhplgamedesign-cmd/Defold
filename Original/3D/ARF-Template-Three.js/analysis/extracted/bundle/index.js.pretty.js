window.oasjidx = 20;
var a = ['error', 'height', 'Application', 'parentElement', '2027IFpPYr', '1aMnHkC', 'getBoundingClientRect', './application.js', 'width', 'register', 'start', '127733rYGgjD', '136599wTedyh', '4DcFatr', 'import', 'GameCanvas', '539382MqHBMv', '1FZoDuS', '342795uOsfcu', '89ARqTEO', '313417uATcdG', 'then', '760798YWbZrj', 'catch'];
function b(c, d) { c = c - 0x198; var e = a[c]; return e; }
var m = b;
(function (c, d) { var l = b; while (!![]) {
    try {
        var e = parseInt("1FZoDuS") * parseInt("313417uATcdG") + parseInt("89ARqTEO") * parseInt("2027IFpPYr") + parseInt("127733rYGgjD") * parseInt("4DcFatr") + -parseInt("136599wTedyh") + -parseInt("539382MqHBMv") * -parseInt("1aMnHkC") + -parseInt("342795uOsfcu") + -parseInt("760798YWbZrj");
        if (e === d)
            break;
        else
            c['push'](c['shift']());
    }
    catch (f) {
        c['push'](c['shift']());
    }
} }(a, 0x4a346), System["register"](["./application.js"], function (c, d) {
    'use strict';
    var e, f, g, h, i;
    function j(k) { var n = b; return System["import"](k); }
    return { 'setters': [function (k) { var o = b; e = k["Application"]; }], 'execute': function () { var p = b; f = document['getElementById']("GameCanvas"), g = f["parentElement"], h = g["getBoundingClientRect"](), f["width"] = h["width"], f["height"] = h['height'], i = new e(), j('cc')['then'](function (k) { return i['init'](k); })["then"](function () { var q = p; return i["start"](); })["catch"](function (k) { var r = p; console["error"](k); }); } };
}));
