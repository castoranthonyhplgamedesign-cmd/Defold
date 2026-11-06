System["register"]("chunks:///_virtual/Path.ts", ["./rollupPluginModLoBabelHelpers.js", 'cc', "./EventManager.ts"], function (j) {
  var k, m, q, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M;
  return {
    'setters': [function (N) {
      var e5 = b;
      k = N["applyDecoratedDescriptor"], m = N['inheritsLoose'], q = N["createForOfIteratorHelperLoose"], x = N["initializerDefineProperty"], y = N["assertThisInitialized"];
    }
    , function (N) {
      var e6 = b;
      z = N["cclegacy"], A = N["_decorator"], B = N["Prefab"], C = N["Node"], D = N['Label'], E = N["ProgressBar"], F = N["Quat"], G = N["instantiate"], H = N["Vec3"], I = N['MeshRenderer'], J = N["Color"], K = N["Component"];
    }
    , function (N) {
      var e7 = b;
      L = N["EventManager"], M = N["GameEvents"];
    }
    ], 'execute': function () {
      var e8 = b, Q, U, V, W, X, Y, Z, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, aa, ab, ac;
      z["_RF"]['push']({
      }
      , "fa558v9xxlPMaJi/Q5gaNAW", "Path", void 0x0);
      var ad = A["ccclass"], ae = A["property"];
      j("Path", (Q = ad("Path"), U = ae(B), V = ae(C), W = ae(B), X = ae(D), Y = ae(E), Q((a1 = k((a0 = function (af) {
        var ea = e8;
        function ag() {
          var e9 = b;
          for (var ai, aj = arguments["length"], ak = new Array(aj), al = 0x0;
          al < aj;
          al++)  ak[al] = arguments[al];
          return ai = af['call']["apply"](af, [this]['concat'](ak)) || this, x(ai, "debugPrefab", a1, y(ai)), x(ai, "pointsNode", a2, y(ai)), ai["rawPoints"] = [], ai["pathPoints"] = [], x(ai, "spacing", a3, y(ai)), x(ai, 'curveSmoothing', a4, y(ai)), ai["blocksOnPath"] = [], ai["segmentProgress"] = new Map(), x(ai, "segmentSpacing", a5, y(ai)), x(ai, "segmentSpeed", a6, y(ai)), ai["pathRotations"] = [], x(ai, "rotationSmoothing", a7, y(ai)), x(ai, "guidePrefab", a8, y(ai)), x(ai, 'guideArrowSpacing', a9, y(ai)), x(ai, "guideArrowSpeed", aa, y(ai)), ai["guideArrows"] = [], ai["blockGroup"] = new Map(), ai['nextGroupId'] = 0x0, x(ai, "percLabel", ab, y(ai)), x(ai, "percBar", ac, y(ai)), ai["desiredProgresses"] = new Map(), ai["pausedSegments"] = new Set(), ai["pausedGroups"] = new Set(), ai["percentage"] = 0x0, ai;
        }
        m(ag, af);
        var ah = ag['prototype'];
        return ah["allocateGroupId"] = function () {
          return this['nextGroupId']++;
        }
        , ah['reverseRotation'] = function (ai) {
          var eb = ea, aj = new F();
          F["fromEuler"](aj, 0x0, 0xb4, 0x0);
          var ak = new F();
          return F["multiply"](ak, aj, ai), ak;
        }
        , ah["instantiateGuideArrows"] = function () {
          var ec = ea;
          if (this["guideArrows"] = this["node"]["getChildByName"]("GuideArrows")["children"], this['guideArrows']["forEach"](function (aq) {
            var ed = ec;
            return aq["destroy"]();
          }
          ), this["guideArrows"] = [], !(this["pathPoints"]['length'] < 0x2)) {
            var ai = this['node']["getChildByName"]("GuideArrows");
            ai || (ai = new C("GuideArrows"), this["node"]["addChild"](ai));
            for (var aj = this["getTotalPathLength"](), ak = Math["max"](0x1, Math["floor"](aj / this["guideArrowSpacing"])), al = 0x0;
            al < ak;
            al++) {
              var am = al / ak, an = this['getPositionAtProgress'](am), ao = this['getRotationAtProgress'](am), ap = G(this["guidePrefab"]);
              ap["setParent"](ai), ap["worldPosition"] = an, ap['worldRotation'] = ao, ap["progress"] = am, this["guideArrows"]["push"](ap);
            }
          }
        }
        , ah['updateGuideArrows'] = function (ai) {
          var ee = ea;
          if (0x0 !== this['guideArrows']["length"])  for (var aj, ak = this["getTotalPathLength"](), al = this["guideArrowSpeed"] * ai / ak, am = q(this["guideArrows"]);
          !(aj = am())["done"];
          ) {
            var an = aj['value'], ao = an['progress'] + al;
            ao > 0x1 && (ao -= 0x1), an['progress'] = ao, an["worldPosition"] = this["getPositionAtProgress"](ao);
            var ap = this['getRotationAtProgress'](ao);
            an["worldRotation"] = this['reverseRotation'](ap);
          }
        }
        , ah["generatePath"] = function () {
          var ef = ea;
          this["rawPoints"] = this["pointsNode"]["children"]["map"](function (ai) {
            var eg = ef;
            return ai["getWorldPosition"]()["clone"]();
          }
          ), this['createEquallySpacedPathPoints']();
        }
        , ah["addSnakeToPath"] = function (ai, aj) {
          var eh = ea, ak = this, al = this["getTotalPathLength"](), am = this["segmentSpacing"] / al;
          ai["forEach"](function (an, ao) {
            var ei = eh, ap = ((aj - ao * am) % 0x1 + 0x1) % 0x1;
            ak["addSegmentToPath"](an, ap);
          }
          );
        }
        , ah["getSegmentProgress"] = function (ai) {
          var ej = ea;
          return this["segmentProgress"]["get"](ai) || 0x0;
        }
        , ah["addSegmentToPath"] = function (ai, aj, ak) {
          var ek = ea;
          if (void 0x0 === aj && (aj = 0x0), void 0x0 === ak && (ak = -0x1), !this["blocksOnPath"]["some"](function (ar) {
            return ar === ai;
          }
          )) {
            this["blocksOnPath"]["push"](ai), this["segmentProgress"]['set'](ai, aj), this["desiredProgresses"]["set"](ai, aj), this["blockGroup"]['set'](ai, ak), ai["setParent"](this["node"]["getChildByName"]("Blocks"), !0x0), 'Head' === ai["name"] && (ai['getChildByName']('Head')["active"] = !0x1, ai["getChildByName"]("Default")['active'] = !0x0);
            for (var al, am = this['segmentSpacing'] / this['getTotalPathLength'](), an = q(this["blocksOnPath"]);
            !(al = an())["done"];
            ) {
              var ao, ap = al["value"];
              if (ap !== ai && (null != (ao = this['blockGroup']["get"](ap)) ? ao : -0x1) !== ak) {
                var aq = (this['segmentProgress']["get"](ap) || 0x0) - aj;
                if (aq < 0x0 && (aq += 0x1), aq > 0x0 && aq < 0x3 * am) {
                  this['pausedGroups']['add'](ak);
                  break;
                }
              }
            }
          }
        }
        , ah["updateSegmentsOnPath"] = function (ai) {
          var el = ea, aj = this;
          if (0x0 !== this["blocksOnPath"]["length"])  for (var ak, al = this["getTotalPathLength"](), am = this['segmentSpeed'] * ai / al, an = this['segmentSpacing'] / al, ao = function (au, av) {
            var em = el;
            for (var aw, ax, ay = null != (aw = aj['blockGroup']["get"](au)) ? aw : -0x1, az = 0x1 / 0x0, aA = q(aj["blocksOnPath"]);
            !(ax = aA())["done"];
            ) {
              var aB, aC = ax["value"];
              if (aC !== au && (null != (aB = aj["blockGroup"]["get"](aC)) ? aB : -0x1) !== ay) {
                var aD = (aj["segmentProgress"]["get"](aC) || 0x0) - av;
                aD < 0x0 && (aD += 0x1), aD > 0x0 && aD < 0.99 && aD < az && (az = aD);
              }
            }
            return az;
          }
          , ap = q(this["blocksOnPath"]);
          !(ak = ap())["done"];
          ) {
            var aq = ak["value"], ar = this["segmentProgress"]["get"](aq) || 0x0, as = ao(aq, ar), at = am;
            as <= an ? at = 0x0 : as < an + am && (at = as - an), at > 0x0 && ((ar += at) > 0x1 && (ar -= 0x1), this['segmentProgress']['set'](aq, ar)), aq["worldPosition"] = this["getPositionAtProgress"](ar), aq["worldRotation"] = this["reverseRotation"](this['getRotationAtProgress'](ar));
          }
        }
        , ah["removeSegmentFromPath"] = function (ai) {
          var en = ea, aj = this['blocksOnPath']["indexOf"](ai);
          -0x1 !== aj && (this['blocksOnPath']['splice'](aj, 0x1), this["segmentProgress"]['delete'](ai), this['blockGroup']["delete"](ai), this["pausedSegments"]["delete"](ai)), ai["destroy"]();
        }
        , ah["clearSegments"] = function () {
          var eo = ea;
          this["blocksOnPath"] = [], this["segmentProgress"]["clear"](), this["pausedSegments"]["clear"]();
        }
        , ah["getPositionAtProgress"] = function (ai) {
          var ep = ea;
          if (0x0 === this["pathPoints"]["length"])  return new H();
          ai = (ai % 0x1 + 0x1) % 0x1;
          var aj = this["pathPoints"]["length"], ak = ai * aj, al = Math['floor'](ak) % aj, am = (al + 0x1) % aj, an = ak - Math["floor"](ak), ao = new H();
          return H["lerp"](ao, this["pathPoints"][al], this["pathPoints"][am], an), ao;
        }
        , ah["getDirectionAtProgress"] = function (ai) {
          var eq = ea;
          if (this["pathPoints"]["length"] < 0x2)  return new H(0x0, 0x0, 0x1);
          var aj = ((ai + 0.01) % 0x1 + 0x1) % 0x1, ak = ((ai - 0.01) % 0x1 + 0x1) % 0x1, al = this['getPositionAtProgress'](aj), am = this["getPositionAtProgress"](ak), an = new H();
          return H["subtract"](an, al, am), an['normalize'](), an;
        }
        , ah['getRotationAtProgress'] = function (ai) {
          var er = ea;
          if (this["pathPoints"]["length"] < 0x2)  return new F();
          var aj = this["getDirectionAtProgress"](ai), ak = new F();
          return F["fromViewUp"](ak, aj, H['UP']), ak;
        }
        , ah["getInterpolatedRotation"] = function (ai) {
          var es = ea;
          if (0x0 === this["pathRotations"]["length"])  return this["getRotationAtProgress"](ai);
          var aj = ai * (this["pathRotations"]["length"] - 0x1), ak = Math["floor"](aj), al = Math["min"](ak + 0x1, this['pathRotations']['length'] - 0x1), am = aj - ak, an = this['pathRotations'][ak], ao = this["pathRotations"][al], ap = new F();
          return F["slerp"](ap, an, ao, am), ap;
        }
        , ah["isOnPath"] = function (ai) {
          var et = ea;
          return -0x1 !== this["blocksOnPath"]["indexOf"](ai);
        }
        , ah["getTotalPathLength"] = function () {
          var eu = ea;
          if (this["pathPoints"]["length"] < 0x2)  return 0x0;
          for (var ai = 0x0, aj = 0x0;
          aj < this["pathPoints"]["length"] - 0x1;
          aj++)  ai += H['distance'](this["pathPoints"][aj], this['pathPoints'][aj + 0x1]);
          return ai += H['distance'](this["pathPoints"][this["pathPoints"]["length"] - 0x1], this['pathPoints'][0x0]);
        }
        , ah["catmullRomSpline"] = function (ai, aj, ak, al, am) {
          var an = am * am, ao = an * am, ap = 0.5 * (0x2 * aj['x'] + (-ai['x'] + ak['x']) * am + (0x2 * ai['x'] - 0x5 * aj['x'] + 0x4 * ak['x'] - al['x']) * an + (-ai['x'] + 0x3 * aj['x'] - 0x3 * ak['x'] + al['x']) * ao), aq = 0.5 * (0x2 * aj['y'] + (-ai['y'] + ak['y']) * am + (0x2 * ai['y'] - 0x5 * aj['y'] + 0x4 * ak['y'] - al['y']) * an + (-ai['y'] + 0x3 * aj['y'] - 0x3 * ak['y'] + al['y']) * ao), ar = 0.5 * (0x2 * aj['z'] + (-ai['z'] + ak['z']) * am + (0x2 * ai['z'] - 0x5 * aj['z'] + 0x4 * ak['z'] - al['z']) * an + (-ai['z'] + 0x3 * aj['z'] - 0x3 * ak['z'] + al['z']) * ao);
          return new H(ap, aq, ar);
        }
        , ah['getCurvePoint'] = function (ai) {
          var ev = ea;
          if (this["rawPoints"]['length'] < 0x2)  return new H();
          var aj = this["rawPoints"]["length"], ak = Math["floor"](ai), al = ai - ak, am = this["rawPoints"][(ak - 0x1 + aj) % aj], an = this["rawPoints"][ak % aj], ao = this["rawPoints"][(ak + 0x1) % aj], ap = this["rawPoints"][(ak + 0x2) % aj];
          return this['catmullRomSpline'](am, an, ao, ap, al);
        }
        , ah["calculateCurveLength"] = function (ai) {
          var ew = ea;
          void 0x0 === ai && (ai = 0x64);
          for (var aj = 0x0, ak = this["getCurvePoint"](0x0), al = 0x1;
          al <= ai;
          al++) {
            var am = al / ai * this["rawPoints"]["length"], an = this["getCurvePoint"](am);
            aj += H["distance"](ak, an), ak = an;
          }
          return aj;
        }
        , ah["getPointAtArcLength"] = function (ai, aj, ak) {
          var ex = ea;
          void 0x0 === ak && (ak = 0x64);
          for (var al = 0x0, am = this['getCurvePoint'](0x0), an = 0x1;
          an <= ak;
          an++) {
            var ao = an / ak * this["rawPoints"]['length'], ap = this["getCurvePoint"](ao), aq = H['distance'](am, ap);
            if (al + aq >= ai) {
              var ar = (ai - al) / aq, as = new H();
              return H["lerp"](as, am, ap, ar), as;
            }
            al += aq, am = ap;
          }
          return this["getCurvePoint"](this['rawPoints']["length"]);
        }
        , ah["createCurvedPathPoints"] = function () {
          var ey = ea;
          if (!(this["rawPoints"]["length"] < 0x2)) {
            if (0x2 !== this["rawPoints"]['length']) {
              var ai = this["calculateCurveLength"](0xc8), aj = Math["max"](0x2, Math['floor'](ai / this['spacing']));
              this["pathPoints"] = [];
              for (var ak = 0x0;
              ak <= aj;
              ak++) {
                var al = ak / aj * ai, am = this["getPointAtArcLength"](al, ai, 0xc8);
                this['pathPoints']["push"](am);
              }
              this["pathPoints"]["length"] > 0x0 && this["pathPoints"]["push"](this["pathPoints"][0x0]['clone']());
            }
            else  this["createEquallySpacedPathPoints"]();
          }
        }
        , ah["cubicBezier"] = function (ai, aj, ak, al, am) {
          var an = 0x1 - am, ao = an * an, ap = am * am, aq = ao * an * ai['x'] + 0x3 * ao * am * aj['x'] + 0x3 * an * ap * ak['x'] + ap * am * al['x'], ar = ao * an * ai['y'] + 0x3 * ao * am * aj['y'] + 0x3 * an * ap * ak['y'] + ap * am * al['y'], as = ao * an * ai['z'] + 0x3 * ao * am * aj['z'] + 0x3 * an * ap * ak['z'] + ap * am * al['z'];
          return new H(aq, ar, as);
        }
        , ah["visualizeCurve"] = function () {
          var ez = ea;
          new I();
          for (var ai = [], aj = 0x0;
          aj <= 0x1f4;
          aj++) {
            var ak = aj / 0x1f4 * this['rawPoints']['length'], al = this['getCurvePoint'](ak);
            ai["push"](al);
          }
          console["log"]("Curve visualization has " + ai["length"] + " points");
        }
        , ah['createEquallySpacedPathPoints'] = function () {
          var eA = ea;
          if (!(this["rawPoints"]["length"] < 0x2)) {
            for (var ai = 0x0, aj = [], ak = 0x0;
            ak < this["rawPoints"]["length"];
            ak++) {
              var al = this['rawPoints'][ak], am = this['rawPoints'][(ak + 0x1) % this['rawPoints']['length']], an = H["distance"](al, am);
              aj["push"](an), ai += an;
            }
            var ao = Math["max"](0x2, Math["floor"](ai / this['spacing'])), ap = ai / ao;
            this["pathPoints"] = [];
            for (var aq = 0x0, ar = 0x0, as = 0x0;
            as < ao;
            as++) {
              for (var at = as * ap;
              ar < aj['length'] && aq + aj[ar] < at;
              )  aq += aj[ar], ar++;
              var au = (at - aq) / aj[ar], av = this["rawPoints"][ar], aw = this["rawPoints"][(ar + 0x1) % this["rawPoints"]["length"]], ax = new H();
              H["lerp"](ax, av, aw, au), this["pathPoints"]["push"](ax);
            }
          }
        }
        , ah["debugPath"] = function () {
          var eB = ea, ai = this;
          this["pointsNode"]["active"] = !0x1, this["node"]['children']["forEach"](function (aj) {
            var eC = eB;
            aj["name"] !== ai["pointsNode"]["name"] && aj !== ai["pointsNode"] && aj["destroy"]();
          }
          ), this['pathPoints']["forEach"](function (aj, ak) {
            var eD = eB, al = G(ai["debugPrefab"]);
            al["setParent"](ai["node"]), al["setWorldPosition"](aj), al['name'] = "pathPoint_" + ak;
          }
          ), console["log"]('Created\x20' + this["pathPoints"]['length'] + " curved path points");
        }
        , ah["start"] = function () {
          var eE = ea, ai = this;
          this["generatePath"](), this["instantiateGuideArrows"](), L['instance']['on'](M["BLOCK_DESTROYED"], function (aj) {
            var eF = eE;
            ai["removeSegmentFromPath"](aj);
          }
          , this);
        }
        , ah['calcPercentage'] = function () {
          var eG = ea, ai = this["getTotalPathLength"](), aj = this["blocksOnPath"]['length'], ak = 0.5 * aj;
          this['percentage'] = 0x0 === ai || 0x0 === aj ? 0x0 : ak / ai * 0x64, this["percLabel"]["string"] = Math["round"](this["percentage"]) + '%', this["percBar"]['progress'] = this['percentage'] / 0x64;
          var al, am, an, ao, ap, aq, ar, as, at = this["percentage"] / 0x64, au = (al = 0x78 * (0x1 - at), ao = (an = (am = 0x1) * 0x1) * (0x1 - Math["abs"](al / 0x3c % 0x2 - 0x1)), aq = 0x0, ar = 0x0, as = 0x0, al < 0x3c ? (aq = an, ar = ao, as = 0x0) : al < 0x78 ? (aq = ao, ar = an, as = 0x0) : al < 0xb4 ? (aq = 0x0, ar = an, as = ao) : al < 0xf0 ? (aq = 0x0, ar = ao, as = an) : al < 0x12c ? (aq = ao, ar = 0x0, as = an) : (aq = an, ar = 0x0, as = ao), new J(0xff * (aq + (ap = am - an)), 0xff * (ar + ap), 0xff * (as + ap), 0xff));
          this["percBar"]['barSprite']["color"] = au;
        }
        , ah['update'] = function (ai) {
          var eH = ea;
          this['updateSegmentsOnPath'](ai), this["updateGuideArrows"](ai), this['calcPercentage']();
        }
        , ag;
      }
      (K))["prototype"], "debugPrefab", [U], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), a2 = k(a0["prototype"], 'pointsNode', [V], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), a3 = k(a0["prototype"], "spacing", [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0.1;
        }
      }
      ), a4 = k(a0['prototype'], "curveSmoothing", [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x0;
        }
      }
      ), a5 = k(a0["prototype"], "segmentSpacing", [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0.5;
        }
      }
      ), a6 = k(a0["prototype"], 'segmentSpeed', [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x2;
        }
      }
      ), a7 = k(a0["prototype"], "rotationSmoothing", [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0.95;
        }
      }
      ), a8 = k(a0["prototype"], 'guidePrefab', [W], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), a9 = k(a0["prototype"], 'guideArrowSpacing', [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x2;
        }
      }
      ), aa = k(a0['prototype'], "guideArrowSpeed", [ae], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x1;
        }
      }
      ), ab = k(a0["prototype"], "percLabel", [X], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), ac = k(a0['prototype'], "percBar", [Y], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), Z = a0)) || Z)), z["_RF"]['pop']();
    }
  }
  ;
}
)
