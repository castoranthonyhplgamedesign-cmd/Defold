-- Defold GUI rendering. Coordinates stay in source design space, including during rotation.
local G=require 'modules.constants'
local Board=require 'modules.board'
local M={};M.__index=M
local colors={vmath.vector4(1,.125,.149,1),vmath.vector4(.078,.412,.894,1),vmath.vector4(.094,.788,.031,1),vmath.vector4(1,.925,.086,1)}
local function white(a)return vmath.vector4(1,1,1,a or 1)end
local function back(k) local t=k-1;return 1+2.70158*t*t*t+1.70158*t*t end
function M.new()
 local self=setmetatable({nodes={},ballnodes={},particles={},w=540,h=960,s=1},M);return self
end
function M:node(key,texture,layer,atlas)
 local n=self.nodes[key]
 if not n then
  n=gui.new_box_node(vmath.vector3(),vmath.vector3(1,1,0));gui.set_adjust_mode(n,gui.ADJUST_STRETCH);gui.set_layer(n,layer or 'board')
  if texture then gui.set_texture(n,atlas or 'art');gui.play_flipbook(n,texture) end
  self.nodes[key]=n
 end
 return n
end
function M:rect(key,x,y,w,h,color,layer,texture,atlas,angle)
 local n=self:node(key,texture,layer,atlas)
 gui.set_position(n,vmath.vector3(x*540/self.w,960-y*960/self.h,0));gui.set_size(n,vmath.vector3(w*540/self.w,h*960/self.h,0));gui.set_color(n,color or white());gui.set_enabled(n,w>0 and h>0)
 if angle then gui.set_rotation(n,vmath.quat_rotation_z(-angle)) end
 return n
end
function M:design(key,x,y,w,h,texture,layer,color,hud,atlas,angle)
 return self:rect(key,self.ox+x*self.s,(hud and self.oh or self.oy)+y*self.s,w*self.s,h*self.s,color,layer,texture,atlas,angle)
end
function M:hide(key) if self.nodes[key] then gui.set_enabled(self.nodes[key],false) end end
function M:layout(w,h)
 self.w=w;self.h=h;self.s=math.min(w/G.FIT.w,h/G.FIT.h);self.ox=(w-G.FIT.w*self.s)/2-G.FIT.x*self.s
 self.oy=h-(G.FIT.y+G.FIT.h)*self.s;self.oh=(self.oy-G.FIT.y*self.s)/2
end
function M:input(x,y) return (x-self.ox)/self.s,(y-self.oy)/self.s end
function M:ball(b,layer)
 local nodes=self.ballnodes[b.id]
 if not nodes then nodes={};self.ballnodes[b.id]=nodes end
 local r=Board.radius(#b.rings);local scale=(b.scale or 1)*(1-G.VIEW_INSET/r)
 local basekey=b.id..'_base';local base_n=math.max(1,#b.rings);local size=math.ceil(Board.radius(base_n)+10)*2*scale
 local node=self:design(basekey,b.x,b.y,size,size,'base_'..base_n,layer,nil,false,'rings');gui.set_layer(node,layer);nodes[basekey]=true
 for i=1,G.MAX_RINGS do
  local key=b.id..'_r'..i
  if b.rings[i] then
   local size=math.ceil(Board.radius(i)+10)*2*scale
   local n=self:design(key,b.x,b.y,size,size,'ring_'..b.rings[i]..'_'..i,layer,nil,false,'rings');gui.play_flipbook(n,'ring_'..b.rings[i]..'_'..i);gui.set_layer(n,layer);nodes[key]=true
  else self:hide(key) end
 end
 gui.play_flipbook(node,'base_'..base_n)
end
function M:delete_ball(id)
 local nodes=self.ballnodes[id];if not nodes then return end
 for key in pairs(nodes) do gui.delete_node(self.nodes[key]);self.nodes[key]=nil end;self.ballnodes[id]=nil
end
function M:hand(game,dt)
 local alpha=0;local x=0;local p=0;local off=0;local direction=0
 local t=game.hand_t or 0
 if game.hand_on then
  t=(t+dt)%7.01;game.hand_t=t
  local function sine(k)return (1-math.cos(math.pi*k))/2 end
  if t<.5 then off=(1-t/.5)^3;alpha=1-off
  elseif t<.6 then alpha=1
  elseif t<.78 then alpha=1;p=sine((t-.6)/.18)
  elseif t<3.38 then
   alpha=1;p=1;local u=t-.78
   if u<.6 then x=240*sine(u/.6);direction=1 elseif u<.8 then x=240 elseif u<1.8 then x=240*(1-2*sine((u-.8)));direction=-1 elseif u<2 then x=-240 else x=-240*(1-sine((u-2)/.6));direction=1 end
  elseif t<3.56 then alpha=1;p=1-sine((t-3.38)/.18)
  elseif t<4.01 then off=((t-3.56)/.45)^3;alpha=1-off end
 end
 local cx=math.max(G.BOARD_LEFT+240,math.min(G.BOARD_RIGHT-240,game.hand_x or 540));local size=265*(1-.1*p)*(1+.08*off)
 -- Pivot is the source fingertip (0.3,0.097), so press/tilt do not displace it.
 local hx=cx+x+45*off;local hy=G.SPAWN_Y+20+45*off;local a=-.14*p
 local dx=(.5-.3)*size;local dy=(.5-.097)*size
 self:design('hand',hx+dx*math.cos(a)-dy*math.sin(a),hy+dx*math.sin(a)+dy*math.cos(a),size,size,'hand','hand',white(alpha),false,nil,a)
 for side=-1,1,2 do for i=0,1 do
  local target=direction==0 and .6 or (direction==side and 1 or .3)
  game.arrow_alpha=game.arrow_alpha or {[-1]=.6,[1]=.6};game.arrow_alpha[side]=game.arrow_alpha[side]+(target-game.arrow_alpha[side])*math.min(1,dt*10)
  local tip=cx+side*(190+i*100)
  self:design('arrow'..side..i,tip-side*50,G.SPAWN_Y,100,64,'arrow','hand',white(alpha*game.arrow_alpha[side]*(i==0 and 1 or .45)),false,nil,side<0 and math.pi or 0)
 end end
 local ringtime=t-.6
 if game.hand_on and ringtime>=0 and ringtime<.3 then
  local k=1-(1-ringtime/.3)^3
  self:design('tap',hx,hy,140*k,140*k,'ring_3_1','hand',white(1-k),false,'rings')
 else self:hide('tap') end
end
function M:particles_update(board,dt)
 for _,burst in ipairs(board.bursts) do
  local count=burst.count
  for i=1,count do
   local a=2*math.pi*(i+math.random())/count;local speed=burst.kind=='merge' and (30+math.random()*60) or (120+math.random()*400)
   local edge=burst.kind=='merge' and burst.r or 0
   self.particles[#self.particles+1]={x=burst.x+math.cos(a)*edge,y=burst.y+math.sin(a)*edge,vx=math.cos(a)*speed,vy=math.sin(a)*speed,t=0,life=burst.kind=='merge' and .25 or .55,color=burst.color,kind=burst.kind}
  end
 end;board.bursts={}
 local alive={};for _,p in ipairs(self.particles) do p.t=p.t+dt
  if p.t<p.life then p.x=p.x+p.vx*dt;p.y=p.y+p.vy*dt;if p.kind~='merge' then p.vy=p.vy+G.CLEAR_FX_GRAVITY*dt end;alive[#alive+1]=p end
 end;self.particles=alive
 for i,p in ipairs(alive) do
  local k=p.t/p.life;local c=p.kind=='merge' and vmath.vector4(1,.82,.12,1-math.max(0,(k-.5)*2)) or colors[p.color+1]
  self:design('particle'..i,p.x,p.y,(p.kind=='merge' and 18 or 16)*(1-k),(p.kind=='merge' and 7 or 16)*(1-k),p.kind=='merge' and 'pill' or 'dot','fx',c)
 end
 for i=#alive+1,(self.last_particles or 0) do self:hide('particle'..i) end;self.last_particles=#alive
end
function M:draw(game,dt)
 local b=game.board;local w,h=self.w,self.h;local s=self.s
 local bg=math.max(w/2000,h/2000)*2000
 self:rect('bg',w/2,h/2,bg,bg,white(),'background','bg')
 local top=self.oh+G.CEILING_Y*s
 self:rect('container',self.ox+540*s,(top+h)/2,864*s,h-top,white(G.BOARD_ALPHA),'board','board')
 self:design('rope',540,G.LINE_Y,864,12,'rope','rope')
 self:rect('bar',w/2,top/2,w,top,vmath.vector4(.0863,.3882,.8549,1),'hud')
 self:rect('barline',w/2,top-4*s,w,8*s,vmath.vector4(.0275,.2392,.5765,1),'hud')
 local k=G.HUD_BOARD_SCALE
 self:design('nextboard',G.NEXT_X,G.HUD_BOARD_TOP+598*k/2,551*k,598*k,'next','hud',nil,true)
 if game.hud then
  self:design('restart',180,103.91-107*184/1254+92,184,184,'restart','hud',nil,true)
  self:design('goal',529,G.HUD_BOARD_TOP+601*k/2,1459*k,601*k,'goal','hud',nil,true)
  local n=self.nodes.goaltext
  if not n then n=gui.new_text_node(vmath.vector3(),'CLEAR RINGS TO\nGET THE GIFT!');gui.set_font(n,'font');gui.set_layer(n,'hudcontent');gui.set_adjust_mode(n,gui.ADJUST_STRETCH);gui.set_color(n,vmath.vector4(0,0,0,1));self.nodes.goaltext=n end
  gui.set_position(n,vmath.vector3((self.ox+529*s)*540/w,960-(self.oh+(G.HUD_BOARD_TOP+127)*s)*960/h,0));gui.set_scale(n,vmath.vector3(s*540/w,s*960/h,1))
 end
 local seen={}
 for _,ball in ipairs(b.balls) do if ball.alive and #ball.rings>0 and not (game.reason=='win' and ball==game.current) then self:ball(ball,(ball.body or b.intro) and 'balls' or (ball==game.next and 'hudcontent' or 'player'));seen[ball.id]=true end end
 -- Explicit layer selection: Lua's `and/or` expressions must return the layer name.
 for _,ball in ipairs(b.balls) do if seen[ball.id] then local layer=(ball.body or b.intro) and 'balls' or (ball==game.next and 'hudcontent' or 'player');for key in pairs(self.ballnodes[ball.id]) do gui.set_layer(self.nodes[key],layer) end end end
 for id in pairs(self.ballnodes) do if not seen[id] then self:delete_ball(id) end end
 local gift=b.gift;local gs=G.BOX_W*373/291
 if game.reason~='win' then self:design('gift',gift.x,gift.y+(186.5-240.5)*gs/373,gs,gs,'gift','gift',nil,false,nil,gift.a or 0) else self:hide('gift') end
 local active=0
 for _,f in ipairs(b.flights) do if f.active then
  active=active+1;local t=math.min(1,(b.time-f.start)/G.RING_FLIGHT_MS);local e=t*t*(3-2*t)
  local x=f.from.x+(f.to.x-f.from.x)*e;local y=f.from.y+(f.to.y-f.from.y)*e-math.sin(t*math.pi)*G.RING_FLIGHT_ARC
  local r=f.r0+(G.RING_HOLE+G.RING_PITCH*(#f.to.rings+.5)-f.r0)*e
  self:design('flight'..active,x,y,2*r,2*r,'ring_'..f.color..'_1','fx',nil,false,'rings')
 end end
 for i=active+1,(self.last_flights or 0) do self:hide('flight'..i) end;self.last_flights=active
 self:particles_update(b,dt);self:hand(game,dt)
 local danger=game.ended and 0 or b.danger
 game.shown_danger=math.max(danger,(game.shown_danger or 0)+(danger-(game.shown_danger or 0))*math.min(1,dt*12))
 game.danger_phase=(game.danger_phase or math.pi-.001)+dt*math.pi*2*(2+6*game.shown_danger)
 local pulse=.5+.5*math.sin(game.danger_phase-math.pi/2)
 self:design('glow',540,G.LINE_Y,864,18,nil,'rope',vmath.vector4(1,.102,.18,math.min(1,game.shown_danger*3)*(.35+.65*pulse)))
 self:rect('vignette',w/2,h/2,w,h,white(math.max(0,(game.shown_danger-.75)/.25)*(.6+.4*pulse)),'danger','vignette')
 if danger>0 then local beat=math.floor((game.danger_phase+math.pi)/(2*math.pi));if beat~=game.warn_beat then game.warn_beat=beat;require('modules.bridge').call('sfx','warn') end end
 if game.ended then self:ending(game) end
end
function M:ending(game)
 local t=game.end_time;local w,h=self.w,self.h;local small=math.min(w,h)
 if game.phase=='endcard' then
  self:rect('dim',w/2,h/2,w,h,vmath.vector4(.1176,.1176,.1176,.9),'dim')
  local k=back(math.min(1,game.card_time/.4));self:rect('logo',w/2,h/2,small*.66*k,small*.66*328/650*k,white(),'endcard','logo')
  self:hide('failbadge');self:hide('win-gift');self:hide('win-sheet');return
 end
 if game.reason=='fail' then
  self:rect('dim',w/2,h/2,w,h,vmath.vector4(.1176,.1176,.1176,.9*math.min(1,t/.25)),'dim')
  local size=small*.72*back(math.min(1,t/.5));self:rect('failbadge',w/2,h/2,size,size,white(t>1.4 and math.max(0,1-(t-1.4)/.25) or 1),'beat','fail')
 elseif game.reason=='win' then
  local gift=game.win_start;local fly=1-(1-math.min(1,t/.5))^3;local grow=back(math.min(1,t/.5));local big=small*.52
  local gx0=self.ox+gift.x*self.s;local gy0=self.oy+gift.y*self.s;local cy=h/2+big*(395+240.5-541.5)/373
  local x=gx0+(w/2-gx0)*fly;local y=gy0+(cy-gy0)*fly;local size=G.BOX_W*373/291*self.s+(big-G.BOX_W*373/291*self.s)*grow
  local alpha=t>2.44 and math.max(0,1-(t-2.44)/.25) or 1
  if t<1.04 then
   local angle=t>.5 and math.sin((t-.5)/.18*math.pi)*.14 or gift.a*(1-fly)
   self:rect('win-gift',x,y+(186.5-240.5)*size/373,size,size,white(alpha),'beat','gift',nil,angle)
  else
   self:hide('win-gift');local frame=math.min(11,math.floor((t-1.04)*24));local n=self:rect('win-sheet',x+(256-(69+186))*size/373,y+(384-(395+240.5))*size/373,size*512/373,size*768/373,white(alpha),'beat','open_'..frame,'giftanim');gui.play_flipbook(n,'open_'..frame)
  end
 end
end
return M
