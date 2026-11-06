package.path='./?.lua;'..package.path
local F=dofile('qa/fixture.lua');local Grid=require 'modules.grid';local Game=require 'modules.game'
local function read(p)local f=assert(io.open(p,'rb'));local s=f:read('*a');f:close();return s end
local cells,shades,regions=read('assets/data/cells.bin'),read('assets/data/shades.bin'),read('assets/data/regions.bin')
local function grid()return Grid.new(F.level,cells,shades,regions)end
local function checksum(a,n)local sum=0;for p=0,n-1 do sum=(sum+a[p]*(p%65521+1))%2147483647 end;return sum end
for _,mode in ipairs({'tap','cut'})do
 local g=grid();g:set_cuttable(F.config.BUCKETS.waves[1]);g.exit=function()return true end;local T=F.config.TIMING
 if mode=='tap'then local best;for _,p in ipairs(g:patches())do if p.color==10 and(not best or p.maxRow>best.maxRow or(p.maxRow==best.maxRow and p.size>best.size))then best=p end end;local p=best.bottom;g:cut(p,p%g.cols,math.floor(p/g.cols),T)
 else g:cutbelow({0,145,g.cols-1,145},T)end;g:crumble(F.config.BUCKETS.waves[1],T)
 for frame=0,240 do
  if frame%30==0 then print(table.concat({mode,frame,g.remaining,g.looseTotal,g.exitedPicture,checksum(g.cells,g.n),checksum(g.loose,g.n)},','))end
  g:step(1000/60,F.config.SAND.gravity/(770/g.cols),T.maxFallSpeed)
 end
end
local function game(opts)
 local events={};local s=Game.new(F.config,F.level,cells,shades,regions,opts,function(name,data)if name=='event'then events[data]=(events[data]or 0)+1 end end)
 for i=1,120 do s:update(1000/60)end;assert(s.phase=='play');return s,events
end
local function consistent(s)local q=s:snapshot();assert(q.accounted==q.total,'grain conservation');assert(q.integrity=='','bucket reservations');for c=1,11 do assert(s.grid.counts[c]>=0)end end
local s,e=game({mechanic='cut',click_limit=5});for i=1,5 do s:input({type='down',x=20,y=20});s:input({type='up',x=20,y=20})end
assert(s.phase=='endcard'and s.clicks==5 and s.grid.remaining==s.grid.total,'swipe tap does not cut; limit ends immediately');assert(e.CHALLENGE_STARTED==1 and e.ENDCARD_SHOWN==1);consistent(s)
s,e=game({mechanic='tap',click_limit=5});s:input({type='down',x=10,y=10});assert(s.clicks==0,'off-picture tap ignored');local target=s.targets_state.right;s:input({type='down',x=target.x,y=target.y});assert(s.clicks==1 and s.grid.remaining<s.grid.total)
for i=1,600 do s:update(1000/60);consistent(s)end
s,e=game({mechanic='cut',time_limit=.1});s:input({type='down',x=20,y=20});for i=1,8 do s:update(1000/60)end;assert(s.reason=='time'and s.phase=='endcard');assert(not e.CHALLENGE_FAILED and not e.CHALLENGE_SOLVED)
s,e=game({mechanic='cut'});s:ending('jam');for i=1,65 do s:update(1000/60)end;assert(s.phase=='endcard'and e.CHALLENGE_FAILED==1)
s,e=game({mechanic='cut'});s:ending('solved');for i=1,60 do s:update(1000/60)end;assert(s.phase=='endcard'and e.CHALLENGE_SOLVED==1)
-- Saturated conveyor fixtures exercise the watchers, rather than invoking endings.
s,e=game({mechanic='cut'});for i=1,F.config.BELT.capacity do s.belt.grains[i]={s=0,lane=0,color=1,shade=0}end;s.belt.counts[1]=F.config.BELT.capacity
for i=1,230 do s:update(1000/60)end;assert(s.reason=='jam'and e.CHALLENGE_FAILED==1,'actual jam grace watcher')
s,e=game({mechanic='cut'});for i=1,F.config.BELT.capacity do s.belt.grains[i]={s=0,lane=0,color=i==1 and 10 or 1,shade=0}end;s.belt.counts[1]=F.config.BELT.capacity-1;s.belt.counts[10]=1;s.rack.reserve=function()return nil end
for i=1,310 do s.belt.refused=1;s:update(1000/60)end;assert(s.reason=='softlock'and e.CHALLENGE_FAILED==1,'actual blocked-intake stall watcher')
-- A complete real three-wave solve using the original hint policy.
s,e=game({mechanic='cut'});local nextcut=0;local waves={};
for frame=1,24000 do
 if s.phase=='play'and not s.swipe and s.time>=nextcut and s.hint then local h=s.hint;s:input({type='down',x=h.x1,y=h.y1});s:input({type='move',x=h.x2,y=h.y2});s:input({type='up',x=h.x2,y=h.y2});nextcut=s.time+650 end
 s:update(1000/60);consistent(s);waves[s.wave]=true
 if s.phase=='endcard'then break end
end
assert(s.reason=='solved','hint solve ended with '..tostring(s.reason)..' wave '..s.wave);assert(waves[1]and waves[2]and waves[3]);assert(e.CHALLENGE_SOLVED==1)
print('PASS gameplay: tap/cut eligibility, 5-click limit, timer, fail, win, conservation, reservations, three-wave full solve; '..s.rack.completed..' buckets, '..math.floor(s.time)..'ms')
