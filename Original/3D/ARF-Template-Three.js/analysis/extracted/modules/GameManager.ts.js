System["register"]("chunks:///_virtual/GameManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', "./Arrow.ts", './Path.ts', "./Block.ts", './EventManager.ts', "./Cannon.ts", './AudioManager.ts', "./Analytics.ts", "./HandAnim.ts", "./CTAButtonHandler.ts"], function (j) {
  var q, x, F, G, J, K, L, Q, U, V, W, X, Y, Z, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al;
  return {
    'setters': [function (am) {
      var cM = b;
      q = am['applyDecoratedDescriptor'], x = am["initializerDefineProperty"], F = am["inheritsLoose"], G = am['createForOfIteratorHelperLoose'], J = am["createClass"], K = am["assertThisInitialized"];
    }
    , function (am) {
      var cN = b;
      L = am["cclegacy"], Q = am["_decorator"], U = am["Material"], V = am['Camera'], W = am["Node"], X = am["Prefab"], Y = am["AudioClip"], Z = am["MeshRenderer"], a0 = am['instantiate'], a1 = am["ParticleSystem"], a2 = am["input"], a3 = am["Input"], a4 = am['tween'], a5 = am["Color"], a6 = am["geometry"], a7 = am["PhysicsSystem"], a8 = am["Vec3"], a9 = am["Quat"], aa = am["Component"];
    }
    , function (am) {
      var cO = b;
      ab = am["Arrow"];
    }
    , function (am) {
      var cP = b;
      ac = am["Path"];
    }
    , function (am) {
      var cQ = b;
      ad = am["Block"];
    }
    , function (am) {
      var cR = b;
      ae = am["EventManager"], af = am["GameEvents"];
    }
    , function (am) {
      ag = am['Cannon'];
    }
    , function (am) {
      var cS = b;
      ah = am["AudioManager"];
    }
    , function (am) {
      var cT = b;
      ai = am["Analytics"], aj = am["analyticsEvents"];
    }
    , function (am) {
      var cU = b;
      ak = am["HandAnim"];
    }
    , function (am) {
      var cV = b;
      al = am["CTAButtonHandler"];
    }
    ], 'execute': function () {
      var cW = b, am, ao, ap, aq, ar, as, at, au, av, aw, ax, ay, az, aA, aB, aC, aD, aE, aF, aG, aH, aI, aJ, aK, aL, aM, aN, aO, aP, aQ, aR, aS, aT, aU, aV, aW, aX, aY, aZ, b0, b1, b2, b3, b4;
      L['_RF']["push"]({
      }
      , "258a4K+Yi5OdL4pvHYehKLm", 'GameManager', void 0x0);
      var b5 = Q['ccclass'], b6 = Q["property"], b7 = (am = b5("ColorObject"), ao = b6(String), ap = b6(U), am((as = q((ar = function () {
        var cX = cW;
        x(this, "name", as, this), x(this, 'material', at, this);
      }
      )['prototype'], 'name', [ao], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return '';
        }
      }
      ), at = q(ar["prototype"], "material", [ap], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aq = ar)) || aq);
      j("GameManager", (au = b5('GameManager'), av = b6(V), aw = b6(ac), ax = b6(W), ay = b6(W), az = b6([b7]), aA = b6(X), aB = b6(Y), aC = b6(Y), aD = b6(Y), aE = b6(Y), aF = b6(Y), aG = b6(W), aH = b6(Number), aI = b6(W), aJ = b6(W), aK = b6(Number), aL = b6(U), au((aO = q((aN = function (b8) {
        var cZ = cW;
        function b9() {
          var cY = b;
          for (var bb, bc = arguments['length'], bd = new Array(bc), be = 0x0;
          be < bc;
          be++)  bd[be] = arguments[be];
          return bb = b8['call']["apply"](b8, [this]['concat'](bd)) || this, x(bb, "camera", aO, K(bb)), x(bb, "path", aP, K(bb)), x(bb, "arrowParent", aQ, K(bb)), x(bb, "cannonParent", aR, K(bb)), x(bb, 'colors', aS, K(bb)), bb['transitSnakes'] = [], x(bb, 'blockExplosion', aT, K(bb)), x(bb, "tapSound", aU, K(bb)), x(bb, "blockDestroySound", aV, K(bb)), x(bb, "wrongSound", aW, K(bb)), x(bb, 'cannonChangeSound', aX, K(bb)), x(bb, "winSound", aY, K(bb)), x(bb, 'handNode', aZ, K(bb)), bb["firstTouch"] = !0x0, bb["tutorial"] = !0x0, x(bb, "timer", b0, K(bb)), bb["canTimer"] = !0x1, bb['canIdle'] = !0x1, bb["idleTimer"] = 0x5, x(bb, "HUDNode", b1, K(bb)), x(bb, "CTANode", b2, K(bb)), x(bb, 'redirectClicks', b3, K(bb)), x(bb, "whiteMat", b4, K(bb)), bb['clicks'] = 0x0, bb;
        }
        F(b9, b8);
        var ba = b9["prototype"];
        return ba['start'] = function () {
          var d0 = cZ, bb = this;
          this["registerEvents"](), this["initializeArrows"](), this["initializeCannons"](), ai["instance"]["dispatchEvent"](aj["DISPLAYED"]), this["scheduleOnce"](function () {
            var d1 = d0;
            bb["updateArrowHighlight"]();
          }
          , 0x0);
        }
        , ba["updateArrowHighlight"] = function () {
          var d2 = cZ;
          this["getValidArrows"]()["forEach"](function (bb) {
            var d3 = d2;
            bb["children"][0x0]["children"][0x0]["children"][0x0]["active"] = !0x0;
          }
          );
        }
        , ba["initializeCannons"] = function () {
          var d4 = cZ, bb = this;
          this["cannonParent"]['getComponentsInChildren'](ag)["map"](function (bc) {
            var d5 = d4;
            return bc["node"];
          }
          )["forEach"](function (bc) {
            var d6 = d4, bd = bc["getComponent"](ag)["color"], be = bb["getMaterialByColorName"](bd);
            bc['getComponentInChildren'](Z)["material"] = be;
          }
          );
        }
        , ba['getBlockStats'] = function () {
          var d7 = cZ, bb = this["arrowParent"]['getComponentsInChildren'](ad), bc = {
          }
          ;
          for (var bd in (bb["forEach"](function (be) {
            var d8 = d7, bf = be["color"];
            bc[bf] = (bc[bf] || 0x0) + 0x1;
          }
          ), console["log"]("=== Block Statistics ==="), console["log"]("Total blocks: " + bb["length"]), console["log"]("--- Breakdown by color ---"), bc))  bc["hasOwnProperty"](bd) && console["log"](bd + ':\x20' + bc[bd] + '\x20block(s)');
        }
        , ba["divvyBulletsByColor"] = function (bb) {
          var d9 = cZ, bc = [], bd = [], be = [], bf = 0x0;
          for (var bg in bb)  bb["hasOwnProperty"](bg) && (bd["push"](bg), be['push'](bb[bg]), bf += bb[bg]);
          for (var bh = Math['ceil'](bf / 0x11), bi = []["concat"](be), bj = 0x0;
          bj < 0x11 && this["hasRemainingBullets"](bi);
          ) {
            for (var bk = 0x0, bl = 0x0;
            bl < bi['length'];
            bl++)  bi[bl] > bi[bk] && (bk = bl);
            var bm = bd[bk], bo = Math["min"](bi[bk], bh);
            bc["push"]({
              'color': bm, 'count': bo }
            ), bi[bk] -= bo, bj++;
          }
          for (var bp = 0x0, bq = 0x0;
          bq < bi['length'];
          bq++) {
            for (;
            bi[bq] > 0x0 && bp < bc["length"];
            )  bc[bp]['count']++, bi[bq]--, bp++;
            bp = 0x0;
          }
          bc["sort"](function (bA, bB) {
            var da = d9;
            return bA["color"]["localeCompare"](bB["color"]);
          }
          ), console["log"]("=== Cannon Distribution (One Color Each) ==="), console["log"]("Total cannons: " + bc['length']);
          for (var br = 0x0, bs = 0x0;
          bs < bc["length"];
          bs++) {
            var bt = bc[bs];
            br += bt["count"], console["log"]('Cannon\x20' + (bs + 0x1) + ':\x20' + bt["color"] + " - " + bt["count"] + '\x20bullet(s)');
          }
          console['log']("Total bullets distributed: " + br);
          for (var bu = {
          }
          , bv = 0x0;
          bv < bc["length"];
          bv++) {
            var bw = bc[bv];
            bu[bw['color']] = (bu[bw['color']] || 0x0) + bw["count"];
          }
          for (var bx in (console["log"]("=== Verification ==="), bb))  if (bb['hasOwnProperty'](bx)) {
            var by = bb[bx], bz = bu[bx] || 0x0;
            console["log"](bx + ": needed " + by + ", have " + bz + '\x20' + (bz === by ? '✓' : '✗'));
          }
          return bc;
        }
        , ba["hasRemainingBullets"] = function (bb) {
          var db = cZ;
          for (var bc = 0x0;
          bc < bb["length"];
          bc++)  if (bb[bc] > 0x0)  return !0x0;
          return !0x1;
        }
        , ba['getMaterialByColorName'] = function (bb) {
          var dc = cZ, bc = this['colors']["find"](function (bd) {
            var dd = dc;
            return bd["name"] === bb;
          }
          );
          return bc ? bc["material"] : null;
        }
        , ba['initializeArrows'] = function () {
          var dh = cZ;
          for (var bb = this, bc = function () {
            var de = b, be = bb["arrows"][bd], bf = be["getComponent"](ab), bg = bf["cells"], bh = bf["color"];
            if (0x0 === bg["length"])  return console["error"]('NO\x20CELLS\x20FOR\x20ARROW\x20AT\x20INDEX:\x20' + bd), 0x1;
            var bi = bb['getMaterialByColorName'](bh);
            be["children"][0x0]["getComponent"](ad)["color"] = bh;
            for (var bj = 0x1;
            bj < bg["length"];
            bj++) {
              var bk = bg[bj], bl = bg[bj + 0x1], bm = bg[bj - 0x1], bo = new a8(), bp = new a8();
              bl ? (a8["subtract"](bo, bk, bm), bo["normalize"](), a8["subtract"](bp, bl, bk), bp["normalize"]()) : (a8["subtract"](bo, bk, bm), bo["normalize"]());
              var bq = a8["dot"](bo, bp) < 0.99 && bl, br = a0(bf["blockPrefab"]);
              if (br["setParent"](be), br['getComponent'](ad)["color"] = bh, br["setPosition"](bg[bj]), bq) {
                br["getChildByName"]("Default")["active"] = !0x1, br["getChildByName"]('Corner')["active"] = !0x0;
                var bs = new a8();
                a8["cross"](bs, bo, bp);
                var bt = Math["round"](bo['x']), bu = Math['round'](bo['z']), bv = bs['y'] > 0x0, bw = 0x0;
                0x1 === bt && 0x0 === bu && (bw = bv ? 0x0 : 0x5a), -0x1 === bt && 0x0 === bu && (bw = bv ? 0xb4 : 0x10e), 0x0 === bt && 0x1 === bu && (bw = bv ? 0x10e : 0x0), 0x0 === bt && -0x1 === bu && (bw = bv ? 0x5a : 0xb4);
                var bx = new a9();
                a9["fromEuler"](bx, 0x0, bw, 0x0), br['getChildByName']("Corner")["setRotation"](bx);
              }
              else {
                var by = new a9();
                a9["fromViewUp"](by, bo, a8['UP']), br["setRotation"](by);
              }
            }
            bi ? (be["getComponentsInChildren"](Z)["filter"](function (bz) {
              var df = de;
              return 'White' !== bz["node"]["name"];
            }
            )['forEach'](function (bz) {
              var dg = de;
              bz["material"] = bi;
            }
            ), be["children"][0x0]["children"][0x0]["children"][0x0]["children"][0x0]["getComponent"](Z)["material"] = bb["whiteMat"]) : console["error"]("Material not found for color: " + bh);
          }
          , bd = 0x0;
          bd < this['arrows']["length"];
          bd++)  bc();
        }
        , ba["onBlockDestroyed"] = function (bb) {
          var di = cZ, bc = this;
          ah['instance']["play"](this["blockDestroySound"], 0x3);
          var bd = a0(this['blockExplosion']);
          bd["setParent"](this["node"]), bd["setWorldPosition"](bb['getWorldPosition']()["clone"]());
          var be = bb["getComponent"](ad)["color"], bf = this["getMaterialByColorName"](be)["getProperty"]("mainColor");
          bd["getComponent"](a1)['startColor']["color"] = bf, bd["getComponent"](a1)['play'](), this["scheduleOnce"](function () {
            var dj = di;
            bc["checkGameOver"]();
          }
          , 0x0);
        }
        , ba["registerEvents"] = function () {
          var dk = cZ, bb = this;
          a2['on'](a3["EventType"]['TOUCH_END'], this["onTouchEnd"], this), a2['on'](a3["EventType"]["TOUCH_CANCEL"], this["onTouchEnd"], this), ae["instance"]['on'](af["BLOCK_DESTROYED"], function (bc) {
            bb['onBlockDestroyed'](bc);
          }
          , this), ae['instance']['on'](af['BLOCK_REACHED_POINT'], function (bc) {
            bb['onBlockReachedPoint'](bc);
          }
          , this), ae["instance"]['on'](af["CANNON_DESTROYED"], this["onCannonDestroyed"], this);
        }
        , ba['onCannonDestroyed'] = function () {
          var dl = cZ;
          ah["instance"]["play"](this["cannonChangeSound"], 1.5);
        }
        , ba["onBlockReachedPoint"] = function (bb) {
          var dm = cZ, bc = this, bd = bb['getComponent'](ad);
          this["path"]["addSegmentToPath"](bb, bd["joinProgress"]), this['scheduleOnce'](function () {
            var dn = dm;
            bc["updateArrowHighlight"]();
          }
          , 0x0);
        }
        , ba['onTouchEnd'] = function (bb) {
          var dp = cZ, bc = this;
          if (this['path']["percentage"] >= 0x5a) {
            ah["instance"]['play'](this['wrongSound']);
            var bd = this["path"]["percLabel"];
            a4(bd)['to'](0.25, {
              'color': a5["RED"] }
            )['to'](0.25, {
              'color': a5['WHITE'] }
            )['to'](0.25, {
              'color': a5['RED'] }
            )['to'](0.25, {
              'color': a5["WHITE"] }
            )["start"]();
          }
          else {
            var be = new a6[("Ray")]();
            if (this['camera']["screenPointToRay"](bb["getLocationX"](), bb["getLocationY"](), be), a7['instance']["raycastClosest"](be)) {
              var bf = a7["instance"]["raycastClosestResult"]["collider"]['node'], bg = bf["parent"]['getComponent'](ab);
              if (bg && !bg["moving"]) {
                var bh = this["findPathPointInArrowDir"](bf["parent"]);
                if (bh) {
                  if (this["canArrowMove"](bg)) {
                    var bi = []["concat"](bg['segments']), bj = bi["map"](function (bs) {
                      var dq = dp;
                      return [bs["worldPosition"]["clone"]()];
                    }
                    ), bk = this["path"]["allocateGroupId"](), bl = {
                      'segments': bi, 'histories': bj, 'targetPoint': bh, 'done': !0x1, 'headArrivedAt': null, 'groupId': bk }
                    ;
                    this["firstTouch"] && (this["firstTouch"] = !0x1, ah["instance"]["playBGM"](), ai["instance"]['dispatchEvent'](aj['CHALLENGE_STARTED'])), this["tutorial"] && (this['canTimer'] = this["canIdle"] = !0x0, this["tutorial"] = !0x1), ah["instance"]["play"](this['tapSound']), bi["forEach"](function (bs) {
                      var bt = bs['getComponent'](ad);
                      bt && (bt['inTransit'] = !0x0);
                    }
                    ), bg["turnCornersToBlocks"](), bg['moving'] = !0x0, this['transitSnakes']["push"](bl), this['handNode']["active"] = !0x1, this['idleTimer'] = 0x5;
                    var bm = a8["distance"](bi[0x0]["worldPosition"], bh), bo = Math["min"](0.8, Math["max"](0.16, 0.05 * bm));
                    a4(bi[0x0])['to'](bo, {
                      'worldPosition': bh }
                    )["call"](function () {
                      var dr = dp, bs = bc["findClosestProgressOnPath"](bh);
                      bl['headArrivedAt'] = Date["now"](), bc['path']["addSegmentToPath"](bi[0x0], bs, bk);
                    }
                    )["start"](), this["clicks"]++, this["redirectClicks"] > 0x0 && this["clicks"] >= this["redirectClicks"] && this['node']['getComponent'](al)["onStoreButtonClicked"]();
                  }
                  else {
                    ah["instance"]["play"](this["wrongSound"]);
                    var bp = bg['node']["children"][0x0], bq = bg["direction"]["clone"]()["normalize"]()["multiplyScalar"](0.25), br = bp["position"]["clone"]()["add"](bq);
                    a4(bp)['to'](0.1, {
                      'position': br }
                    )['to'](0.2, {
                      'position': new a8(0x0, 0x0, 0x0) }
                    , {
                      'easing': "bounceOut" }
                    )["start"]();
                  }
                }
              }
            }
          }
        }
        , ba['canArrowMove'] = function (bb) {
          var ds = cZ, bc = new a6['Ray']();
          bc['d'] = bb["direction"]["clone"](), bc['o'] = bb["node"]["getWorldPosition"]()['clone'](), a7['instance']["raycast"](bc);
          var bd = a7['instance']["raycastResults"];
          if (bd && bd["length"] > 0x0)  for (var be = 0x0;
          be < bd["length"];
          be++) {
            var bf, bg = null == (bf = bd[be]["collider"]['node']["parent"]) ? void 0x0 : bf["getComponent"](ab);
            if (bg && !bg["moving"])  return !0x1;
          }
          return !0x0;
        }
        , ba["findClosestProgressOnPath"] = function (bb) {
          var dt = cZ;
          if (!bb)  return 0x0;
          if (0x0 === this["path"]["pathPoints"]["length"])  return 0x0;
          for (var bc = 0x0, bd = 0x1 / 0x0, be = 0x0;
          be < this['path']["pathPoints"]["length"];
          be++) {
            var bf = a8['distance'](bb, this['path']['pathPoints'][be]);
            bf < bd && (bd = bf, bc = be);
          }
          return bc / this['path']['pathPoints']["length"];
        }
        , ba["findPathPointInArrowDir"] = function (bb) {
          var du = cZ, bc = bb["getComponent"](ab)["direction"]['clone']()["normalize"](), bd = bb["worldPosition"]['clone']();
          if (this["path"] && 0x0 !== this['path']["pathPoints"]["length"]) {
            for (var be, bf = null, bg = -0x1 / 0x0, bh = G(this["path"]['pathPoints']);
            !(be = bh())["done"];
            ) {
              var bi = be["value"], bj = new a8();
              a8["subtract"](bj, bi, bd), bj['normalize']();
              var bk = a8["dot"](bj, bc);
              bk > bg && (bg = bk, bf = bi);
            }
            return bf;
          }
        }
        , ba["activateCTA"] = function () {
          var dv = cZ;
          ah['instance']["stop"](), ai['instance']["dispatchEvent"](aj["ENDCARD_SHOWN"]), this["canIdle"] = this["canTimer"] = !0x1, this["HUDNode"]['active'] = !0x1, a4(this["CTANode"])['to'](0.4, {
            'scale': a8["ONE"] }
          , {
            'easing': "quadOut" }
          )['start']();
        }
        , ba["getValidArrows"] = function () {
          var dw = cZ, bb = this;
          return this['arrows']["filter"](function (bc) {
            var dx = dw;
            return bc['children']["length"] > 0x0 && bb["canArrowMove"](bc['getComponent'](ab)) && !bc['getComponent'](ab)["moving"];
          }
          )['sort'](function (bc, bd) {
            var dy = dw;
            return a8["distance"](bc["worldPosition"], a8["ZERO"]) - a8["distance"](bd["worldPosition"], a8["ZERO"]);
          }
          );
        }
        , ba['clearEmptyArrows'] = function () {
          var dz = cZ;
          this["arrows"]['forEach'](function (bb) {
            var dA = dz;
            0x0 === bb["children"]["length"] && bb["destroy"]();
          }
          );
        }
        , ba["cleanupCannons"] = function () {
          var dB = cZ, bb = []["concat"](this["path"]['blocksOnPath'], this["arrowParent"]["getComponentsInChildren"](ad)["map"](function (bd) {
            var dC = dB;
            return bd["node"];
          }
          )), bc = new Set(bb["map"](function (bd) {
            var dD = dB;
            return bd["getComponent"](ad)["color"];
          }
          ));
          this["cannonParent"]["children"]["map"](function (bd) {
            var dE = dB;
            return bd['getChildByName']('Cannons')["children"][0x0];
          }
          )["forEach"](function (bd) {
            var dF = dB;
            if (bd && bd['isValid']) {
              var be, bf = null == (be = bd['getComponent'](ag)) ? void 0x0 : be['color'];
              bf && !bc["has"](bf) && ae["instance"]["emit"](af["CANNON_DESTROYED"], bd);
            }
          }
          );
        }
        , ba['restartTutorial'] = function () {
          var dG = cZ;
          if (0x0 !== this['arrows']['length']) {
            var bb = new Set(this["cannonParent"]['getComponentsInChildren'](ag)["filter"](function (bf) {
              var dH = dG;
              return bf["detectionBox"]['node']["active"];
            }
            )['map'](function (bf) {
              return bf['color'];
            }
            )), bc = this["getValidArrows"]()["filter"](function (bf) {
              var dI = dG, bg, bh = null == (bg = bf["getComponent"](ab)) ? void 0x0 : bg['color'];
              return bb["has"](bh);
            }
            ), bd = bc['reduce'](function (bf, bg) {
              var dJ = dG, bh = bg["getWorldPosition"](), bi = bf["getWorldPosition"]();
              return bh['x'] < bi['x'] ? bg : bf;
            }
            , bc[0x0])["children"][0x1]["getWorldPosition"]()["clone"](), be = this['handNode']["getComponent"](ak);
            be["stop"](), be["originalPos"] = bd, this["handNode"]["setWorldPosition"](bd), this["handNode"]["active"] = !0x0, be["startTapAnimation"](), this["canIdle"] = !0x1, this['idleTimer'] = 0x5, this["tutorial"] = !0x0;
          }
        }
        , ba['checkGameOver'] = function () {
          var dK = cZ;
          0x0 === this["arrows"]["length"] && 0x0 === this["path"]["blocksOnPath"]['length'] && this["activateCTA"]();
        }
        , ba['update'] = function (bb) {
          var dL = cZ, bc = this;
          if (this["canTimer"] && (this["timer"] -= bb, this["timer"] < 0x0))  this["activateCTA"]();
          else {
            this["canIdle"] && this['canTimer'] && (this["idleTimer"] -= bb, this["idleTimer"] < 0x0 && this['restartTutorial']());
            for (var bd, be = function () {
              var dM = dL, bg = bd['value'];
              if (!bg || bg["done"])  return 0x0;
              var bh = bg["segments"], bi = bg['histories'], bj = bg["groupId"];
              if (!bh[0x0] || !bh[0x0]['isValid'])  return bg['done'] = !0x0, bc["transitSnakes"] = bc['transitSnakes']["filter"](function (bM) {
                return bM !== bg;
              }
              ), 0x0;
              if (bi[0x0]["push"](bh[0x0]['worldPosition']["clone"]()), bi[0x0]["length"] >= 0x2) {
                var bk = bi[0x0], bl = new a8();
                a8["subtract"](bl, bk[bk["length"] - 0x1], bk[bk["length"] - 0x2]), bl["length"]() > 0.001 && (bl['normalize'](), bh[0x0]["forward"] = bl);
              }
              for (var bm = 0x1;
              bm < bh["length"];
              bm++)  if (bh[bm] && bh[bm]["isValid"]) {
                for (var bo = bi[bm - 0x1], bp = 0x0, bq = bo[0x0]['clone'](), br = bo["length"] - 0x1;
                br > 0x0;
                br--) {
                  var bs = a8["distance"](bo[br], bo[br - 0x1]);
                  if ((bp += bs) > 0x1) {
                    var bt = (bp - 0x1) / bs;
                    bq = new a8(), a8['lerp'](bq, bo[br], bo[br - 0x1], 0x1 - bt);
                    break;
                  }
                  bq = bo[0x0]["clone"]();
                }
                var bu = new a8();
                a8["lerp"](bu, bh[bm]["worldPosition"], bq, 0x14 * bb), bh[bm]['worldPosition'] = bu;
                var bv = new a8();
                a8["subtract"](bv, bh[bm - 0x1]["worldPosition"], bh[bm]['worldPosition']), bv["length"]() > 0.001 && (bv['normalize'](), bh[bm]["forward"] = bv), bi[bm]["push"](bh[bm]["worldPosition"]["clone"]());
                for (var bw = bc["path"]['getTotalPathLength'](), bx = bc['path']['segmentSpacing'] / bw, by = 0x1;
                by < bh["length"];
                by++)  if (!bc["path"]["isOnPath"](bh[by])) {
                  var bz = bh[by - 0x1];
                  if (!bc["path"]['isOnPath'](bz))  break;
                  var bA = bc['path']["getSegmentProgress"](bz), bB = ((bA - bx) % 0x1 + 0x1) % 0x1, bC = bA - bc["findClosestProgressOnPath"](bg["targetPoint"]);
                  bC < 0x0 && (bC += 0x1), bC >= bx && bc['path']["addSegmentToPath"](bh[by], bB, bj);
                }
              }
              if ((bh["every"](function (bM) {
                var dN = dM;
                return bc["path"]["isOnPath"](bM);
              }
              ) && (bh['forEach'](function (bM) {
                var dO = dM;
                bM["getComponent"](ad)["inTransit"] = !0x1;
              }
              ), bc['scheduleOnce'](function () {
                bc['updateArrowHighlight']();
              }
              , 0x0), bg["done"] = !0x0, bc["transitSnakes"] = bc['transitSnakes']["filter"](function (bM) {
                return bM !== bg;
              }
              )), null !== bg["headArrivedAt"]) && (Date["now"]() - bg["headArrivedAt"]) / 0x3e8 >= 0.5)  for (var bD, bE = G(bh);
              !(bD = bE())["done"];
              ) {
                var bF = bD['value'];
                if (!bc["path"]["isOnPath"](bF)) {
                  if (!bF || !bF['isValid'])  continue;
                  var bG = bc["findClosestProgressOnPath"](bF["worldPosition"]);
                  bc["path"]["addSegmentToPath"](bF, bG, bj);
                }
              }
              for (var bH = 0x0;
              bH < bi['length'];
              bH++) {
                for (var bI = 0x0, bJ = bi[bH], bK = 0x0, bL = bJ["length"] - 0x1;
                bL > 0x0;
                bL--)  if ((bI += a8['distance'](bJ[bL], bJ[bL - 0x1])) > 0x2) {
                  bK = bL;
                  break;
                }
                bK > 0x0 && (bi[bH] = bJ['slice'](bK));
              }
            }
            , bf = G(this["transitSnakes"]);
            !(bd = bf())["done"];
            )  be();
            this['clearEmptyArrows'](), this["cleanupCannons"]();
          }
        }
        , J(b9, [{
          'key': "arrows", 'get': function () {
            var dP = cZ;
            return this["arrowParent"]["children"];
          }
        }
        ]), b9;
      }
      (aa))["prototype"], 'camera', [av], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aP = q(aN['prototype'], "path", [aw], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aQ = q(aN["prototype"], "arrowParent", [ax], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aR = q(aN["prototype"], 'cannonParent', [ay], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aS = q(aN["prototype"], "colors", [az], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return [];
        }
      }
      ), aT = q(aN['prototype'], 'blockExplosion', [aA], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aU = q(aN["prototype"], "tapSound", [aB], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aV = q(aN["prototype"], 'blockDestroySound', [aC], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aW = q(aN["prototype"], "wrongSound", [aD], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aX = q(aN["prototype"], 'cannonChangeSound', [aE], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aY = q(aN["prototype"], "winSound", [aF], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aZ = q(aN["prototype"], "handNode", [aG], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), b0 = q(aN['prototype'], "timer", [aH], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x3c;
        }
      }
      ), b1 = q(aN["prototype"], "HUDNode", [aI], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), b2 = q(aN['prototype'], "CTANode", [aJ], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), b3 = q(aN["prototype"], "redirectClicks", [aK], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return 0x0;
        }
      }
      ), b4 = q(aN["prototype"], "whiteMat", [aL], {
        'configurable': !0x0, 'enumerable': !0x0, 'writable': !0x0, 'initializer': function () {
          return null;
        }
      }
      ), aM = aN)) || aM)), L["_RF"]['pop']();
    }
  }
  ;
}
)
