local Grid=require 'modules.grid'
local Rack=require 'modules.rack'
local Belt=require 'modules.belt'
local M={};M.__index=M
local function contains(a,v)for _,c in ipairs(a)do if c==v then return true end end;return false end
function M.new(C,level,cells,shades,regions,opts,platform)
 local grid=Grid.new(level,cells,shades,regions);local rack=Rack.new(C,grid.counts);local belt=Belt.new(C,rack)
 local s=setmetatable({C=C,grid=grid,rack=rack,belt=belt,phase=C.OPENING_GAMEPLAY_ANIMATION and 'intro'or 'play',wave=1,time=0,grain=770/level.cols,mechanic=opts.mechanic or C.MECHANIC,click_limit=opts.click_limit or 9999,time_limit=opts.time_limit or 9999,clicks=0,progress=0,jam=0,stall=0,intake=0,quiet=0,drain=0,trail={},impacts={},P=platform,frames=0},M)
 grid:set_cuttable(C.BUCKETS.waves[1]);rack:colors(C.BUCKETS.waves[1],1100)
 grid.exit=function(c,shade,col)return belt:accept(c,shade,155+(col+.5)*s.grain)end
 belt.waiting=function(c)return grid.funnel[c]end
 rack.onfull=function()if s.phase=='intro'or s.phase=='play'then s:sound('sfx-bells');s:sound('sfx-woosh')end end
 s:event('LOADED');s:event('DISPLAYED');s:life('gameReady');if s.phase=='play'then s:start()end
 return s
end
function M:event(name)self.P('event',name)end
function M:life(name)self.P('life',name)end
function M:sound(name)self.P('sfx',name)end
function M:say(word)self.praise=word;self.praise_at=self.time end
function M:start()
 self.phase='play';self:life('gameStart');self:say('WAVE 1');self:targets();self.hand=true;self.hand_at=self.time
end
function M:targets()
 local patches=self.grid:patches();local fronts,queued=self.rack:needed(),self.rack:queued();local wave=self.C.BUCKETS.waves[self.wave];local best,bt,wrong,blocked
 for _,p in ipairs(patches)do if contains(wave,p.color)then
  local tier=not p.drains and(p.openBelow and 3 or 4)or(contains(fronts,p.color)and 0 or(contains(queued,p.color)and 1 or 2))
  if (self.belt:percent()<=50 or tier==0)and(not best or tier<bt or(tier==bt and(p.maxRow>best.maxRow or(p.maxRow==best.maxRow and p.size>best.size))))then best,bt=p,tier end
  if not contains(fronts,p.color)and(not wrong or p.size>wrong.size)then wrong=p end
  if not p.openBelow and(not blocked or p.minRow<blocked.minRow)then blocked=p end
 end end
 local function point(p)return p and{x=155+(p%self.grid.cols+.5)*self.grain,y=188.5+(math.floor(p/self.grid.cols)+.5)*self.grain}or nil end
 self.targets_state={right=best and point(best.bottom),wrong=wrong and point(wrong.cell),blocked=blocked and point(blocked.cell)}
 self.hint=nil
 if best then
  if self.mechanic=='cut'then
   local a,b=best.minCol-1.5,best.maxCol+2.5;local minimum=150/self.grain;if b-a<minimum then local mid=(a+b)/2;a,b=mid-minimum/2,mid+minimum/2 end
   a=math.max(.5,a);b=math.min(self.grid.cols-.5,b);local y=188.5+(best.minRow+.5)*self.grain
   self.hint={x1=155+a*self.grain,y1=y,x2=155+b*self.grain,y2=y};self.targets_state.swipe=self.hint
  else local p=point(best.bottom);self.hint={x1=p.x,y1=p.y,x2=p.x,y2=p.y}end
 end
 self.frontkey=table.concat(fronts,',')
end
function M:ending(reason)
 if self.reason then return end;self.reason=reason;self.phase='ending';self.ended_at=self.time;self.hand=false;self.swipe=nil;self:life('gameEnd')
 if reason=='solved'then self:event('CHALLENGE_SOLVED');self.card_due=self.time+self.C.TIMING.winEndcardDelay
 elseif reason=='jam'or reason=='softlock'then self:event('CHALLENGE_FAILED');self:sound('sfx-fail');self.card_due=self.time+self.C.TIMING.failEndcardDelay
 else self:card()end
end
function M:card()
 if self.phase=='endcard'then return end;self.phase='endcard';self.card_at=self.time;self.card_due=nil;self.P('cta');self.P('endcard');self:event('ENDCARD_SHOWN');self.P('finish');self:sound('sfx-win')
end
function M:count()
 self.clicks=self.clicks+1
 if not self.started_at then self.started_at=self.time;self:event('CHALLENGE_STARTED')end
end
function M:feedback(released)
 local share=released/self.grid.total;local T=self.C.TIMING
 if share>=T.praiseShares[1]then local i=1;while i<#T.praiseShares and share>=T.praiseShares[i+1]do i=i+1 end;self:say(T.praiseWords[i]);self.shake_at=self.time;self.shake_duration=T.bigDropShake;self.shake_strength=T.bigDropShakeIntensity end
end
function M:applyswipe()
 local sw=self.swipe;if not sw or not sw.armed or #sw.points<4 then return end
 self.grid:cutbelow(sw.points,self.C.TIMING);sw.points={sw.points[#sw.points-1],sw.points[#sw.points]}
 local n=self.grid.lastCut+self.grid.lastDrop
 if n>0 then if sw.released==0 then self.pending=self.time+400 end;sw.released=sw.released+n;self.swipe_moved=true end
end
function M:input(p)
 if self.phase~='play'then return end
 local x,y=p.x,p.y;local T=self.C.TIMING
 if p.type=='down'then
  if self.swipe then self:input({type='up',x=x,y=y})end
  if self.mechanic=='cut'then
   self:count();if self.clicks>=self.click_limit then self:ending('limit');return end
   self.swipe={points={(x-155)/self.grain,(y-188.5)/self.grain},fromx=x,fromy=y,armed=false,released=0};self.hand=false;self.trail={{x=x,y=y,t=self.time}}
  else local c,r=math.floor((x-155)/self.grain),math.floor((y-188.5)/self.grain);local cell=self.grid:near(c,r,6)
   if cell>=0 then local color=self.grid.cells[cell];self.impacts[#self.impacts+1]={x=x,y=y,color=color,at=self.time};if #self.impacts>4 then table.remove(self.impacts,1)end;self:count();self.grid:cut(cell,c,r,T);self.grid:crumble(self.C.BUCKETS.waves[self.wave],T);self.pending=self.time+400;self.pending_drop=self.grid.lastDrop;self.hand=false;self.hand_due=self.time+self.C.TUTORIAL_DELAY*1000;self:targets();if self.clicks>=self.click_limit then self:ending('limit')end end
  end
 elseif self.swipe and(p.type=='move'or p.type=='up'or p.type=='cancel')then
  local sw=self.swipe
  if p.type~='cancel'then
   if ((x-sw.fromx)^2+(y-sw.fromy)^2)^.5>=60 then sw.armed=true end
   sw.points[#sw.points+1]=(x-155)/self.grain;sw.points[#sw.points+1]=(y-188.5)/self.grain;self.trail[#self.trail+1]={x=x,y=y,t=self.time};if #self.trail>96 then table.remove(self.trail,1)end
  end
  if p.type=='up'or p.type=='cancel'then self:applyswipe();self.swipe=nil
   if sw.released>0 then self.grid:crumble(self.C.BUCKETS.waves[self.wave],T);self:feedback(sw.released);self:targets()end
   self.hand_due=self.time+self.C.TUTORIAL_DELAY*1000
  end
 end
end
function M:update(ms)
 ms=math.min(ms,50);self.time=self.time+ms;self.frames=self.frames+1;local T=self.C.TIMING;local g=self.grid
 if self.phase=='intro'and self.time>=T.revealDelay+T.revealMs then self:start()end
 self:applyswipe();local speed=(self.phase=='play'or self.phase=='ending')and g.remaining==0 and T.fastForward or 1;local moved=false;local movedpic=0
 for i=1,speed do moved=g:step(ms,self.C.SAND.gravity/self.grain,T.maxFallSpeed)or moved;movedpic=math.max(movedpic,g.movedInPicture);self.belt:update(ms);self.rack:update(ms,function(c)return g.counts[c]+(self.belt.counts[c]or 0)end)end
 if self.pending then if self.time>self.pending then self.pending=nil;self.pending_drop=nil elseif movedpic>=T.fallingMoves then self:sound('sfx-click');if self.pending_drop then self:feedback(self.pending_drop)end;self.pending=nil;self.pending_drop=nil end end
 self.P('flow',{delta=ms,cut=self.phase=='play'and(self.swipe_moved or movedpic>=T.fallingMoves),sand=self.phase=='play'and((moved and g.looseTotal-g.loosePicture>0)or #self.belt.grains+#self.belt.fall>0)});self.swipe_moved=false
 local accepted,refused=self.belt.accepted,self.belt.refused;self.belt.accepted=0;self.belt.refused=0
 if self.phase=='play'then
  while self.progress<3 and g.exitedPicture/g.total>=(self.progress+1)*.25 do self.progress=self.progress+1;self:event('CHALLENGE_PASS_'..self.progress*25)end
  local complete=true;for _,c in ipairs(self.C.BUCKETS.waves[self.wave])do if g.counts[c]+(self.belt.counts[c]or 0)>0 then complete=false end end
  if self.wave<#self.C.BUCKETS.waves and complete and not self.rack:has_colors(self.C.BUCKETS.waves[self.wave])then self.wave=self.wave+1;g:set_cuttable(self.C.BUCKETS.waves[self.wave]);self.rack:colors(self.C.BUCKETS.waves[self.wave],420);self:targets();self:say('WAVE '..self.wave);self.hand=true;self.hand_at=self.time end
  if table.concat(self.rack:needed(),',')~=self.frontkey then self:targets()end
  if self.rack:allfilled()then self:ending('solved')
  elseif g.remaining==0 and g.loosePicture==0 then self.drain=self.drain+ms;if self.drain>=T.drainCap then self:ending('solved')end
  else
   self.drain=0;self.jam=self.belt:jammed()and self.jam+ms*speed or 0;if self.jam>=T.jamGrace then self:ending('jam')end
   self.quiet=refused>0 and 0 or self.quiet+ms*speed;self.intake=self.intake+accepted
   if self.quiet>T.stallQuiet or self.intake>=self.C.BELT.capacity*self.C.BELT.stallPercent/100 then self.stall=0;self.intake=0 else self.stall=self.stall+ms*speed end
   if self.C.BELT.stallSeconds>0 and self.stall>=self.C.BELT.stallSeconds*1000 then self:ending('softlock')end
  end
  if self.started_at and self.time-self.started_at>=self.time_limit*1000 then self:ending('time')end
  if self.hand_due and self.time>=self.hand_due and not self.swipe then self.hand=true;self.hand_at=self.time;self.hand_due=nil end
 end
 if self.card_due and self.time>=self.card_due then self:card()end
 if self.phase=='endcard'then local age=self.time-self.card_at;if age>=233 and not self.secondpop then self.secondpop=true;self:sound('sfx-win')end;if age>=500 and not self.cardpop then self.cardpop=true;self:sound('sfx-endcard')end end
 while self.trail[1]and self.time-self.trail[1].t>260 do table.remove(self.trail,1)end
end
function M:snapshot()
 local g=self.grid;return {state=self.phase,wave=self.wave,activeColors=self.C.BUCKETS.waves[self.wave],counted=self.clicks,clickLimit=self.click_limit,remaining=g.remaining,total=g.total,removedPct=g.exitedPicture/g.total*100,lastCut=g.lastCut,lastDrop=g.lastDrop,loose=g.looseTotal,funnel=g.looseTotal-g.loosePicture,belt=self.belt:percent(),beltLoad=self.belt:load(),bucketsDone=self.rack.completed,accounted=g.remaining+g.looseTotal+#self.belt.grains+#self.belt.fall+self.rack.filled,integrity=self.rack:integrity(),frame=self.frames,handVisible=self.hand or false,ended=self.reason~=nil,endReason=self.reason or '',targets=self.targets_state or{},mechanic=self.mechanic,time=self.time,fronts=self.rack:needed()}
end
return M
