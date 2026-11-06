-- Defold owns every rendered pixel; original HD art is masked by grain ownership.
local M={};M.__index=M
local floor,min,max=math.floor,math.min,math.max
local function white(a)return vmath.vector4(1,1,1,a or 1)end
local function back(t)local k=t-1;return 1+2.70158*k*k*k+1.70158*k*k end
function M.new(C,grid)
 local self=setmetatable({C=C,grid=grid,nodes={},bands={},lut={},sizes={},sparkles={},w=540,h=960,s=1},M)
 for _,slot in ipairs(C.CHANGABLE_TEXTURES)do self.sizes[slot.uuid]=slot.originalSize end
 for c,rgb in ipairs(C.SAND.palette)do self.lut[c]={};for shade=0,7 do local off=(shade/7*2-1)*min(1,C.SAND.grainShade)*255;local function byte(x)return min(255,max(0,floor(x+off+.5)))end;self.lut[c][shade]=string.char(byte(rgb[1]),byte(rgb[2]),byte(rgb[3]),255)end end
 local art=image.load(sys.load_resource('/assets/images/sand-picture-hd.png'));self.artw=art.width;self.arth=art.height
 local owners=sys.load_resource('/assets/data/owners.bin');local raw=art.buffer;local bandrows=math.ceil(art.height/16)
 for y0=0,art.height-1,bandrows do
  local y1=min(art.height,y0+bandrows);local b={y0=y0,y1=y1,runs={},name='hd'..#self.bands,lastrev=-1};local start=y0*art.width;local stop=y1*art.width;local p=start
  while p<stop do local o=owners:byte(p*2+1)+owners:byte(p*2+2)*256;local q=p+1
   while q<stop and owners:byte(q*2+1)+owners:byte(q*2+2)*256==o do q=q+1 end
   local color=raw:sub(p*4+1,q*4);local gray={}
   for j=1,#color,4 do local r,g,bl,a=color:byte(j,j+3);local l=floor(89+.65*(.299*r+.587*g+.114*bl)+.5);gray[#gray+1]=string.char(l,l,l,a)end
   b.runs[#b.runs+1]={o=o,color=color,gray=table.concat(gray),empty=string.rep('\0',(q-p)*4)};p=q
  end
  gui.new_texture(b.name,art.width,y1-y0,'rgba',string.rep('\0',art.width*(y1-y0)*4),false)
  self.bands[#self.bands+1]=b
 end
 self.cw=floor(C.LAYOUT.sandArea.w/(770/grid.cols)+.5);self.ch=math.ceil((C.LAYOUT.sandArea.bottom-C.LAYOUT.sandArea.y)/(770/grid.cols));self.blank={}
 for i=1,self.cw*self.ch do self.blank[i]='\0\0\0\0'end
 gui.new_texture('grains',self.cw,self.ch,'rgba',table.concat(self.blank),false)
 return self
end
function M:layout(w,h)self.w=w;self.h=h;self.s=min(w/1080,h/1920);self.ox=(w-1080*self.s)/2;self.oy=(h-1920*self.s)/2 end
function M:node(key,texture,layer,dynamic,text)
 local n=self.nodes[key]
 if not n then
  if text then n=gui.new_text_node(vmath.vector3(),text);gui.set_font(n,'font')else n=gui.new_box_node(vmath.vector3(),vmath.vector3(1,1,0))end
  gui.set_adjust_mode(n,gui.ADJUST_STRETCH);gui.set_layer(n,layer);self.nodes[key]=n
  if texture then gui.set_texture(n,dynamic and texture or 'art');if not dynamic then gui.play_flipbook(n,texture)end end
 end;return n
end
function M:rect(key,x,y,w,h,texture,layer,alpha,angle,dynamic)
 local n=self:node(key,texture,layer,dynamic)
 if texture and not dynamic then gui.play_flipbook(n,texture)end
 gui.set_position(n,vmath.vector3(x+(self.shakex or 0),1920-y+(self.shakey or 0),0))
 gui.set_size(n,vmath.vector3(w,h,0));gui.set_color(n,white(alpha));gui.set_enabled(n,w>0 and h>0 and(alpha or 1)>0)
 gui.set_rotation(n,vmath.quat_rotation_z(-(angle or 0)));return n
end
function M:text(key,label,x,y,size,layer,alpha,scale)
 local n=self:node(key,nil,layer,false,label);gui.set_text(n,label);gui.set_position(n,vmath.vector3(x,1920-y,0))
 gui.set_scale(n,vmath.vector3(size/64*(scale or 1),size/64*(scale or 1),1));gui.set_color(n,vmath.vector4(0,0,0,alpha or 1));gui.set_outline(n,white(alpha));gui.set_enabled(n,(alpha or 1)>0);return n
end
function M:hide(key)if self.nodes[key]then gui.set_enabled(self.nodes[key],false)end end
function M:line(key,x1,y1,x2,y2,width,layer,alpha)
 local dx,dy=x2-x1,y2-y1;return self:rect(key,(x1+x2)/2,(y1+y2)/2,(dx*dx+dy*dy)^.5,width,nil,layer,alpha,math.atan2(dy,dx))
end
function M:burst(x,y,count,logo,at)
 local colors=logo and{{1,.824,.227},{1,1,1},{.133,.78,.753},{.72,.83,.165},{1,.54,.11}}or{{1,1,1},{1,.886,.478},{1,.953,.722}}
 for i=1,count do local a=math.pi*2*(i-1)/count+math.random()*.5;local reach=logo and 860*(.42+math.random()*.22)or 70+math.random()*70
  self.sparkles[#self.sparkles+1]={x=x,y=y,dx=math.cos(a)*reach,dy=math.sin(a)*reach*(logo and .7 or 1),size=logo and 46+math.random()*40 or 18+math.random()*20,color=colors[(i-1)%#colors+1],at=at,logo=logo}
 end
end
function M:picture(game)
 local g,C=self.grid,self.C;local reveal=game.phase=='intro';local T=C.TIMING
 local elapsed=game.time-T.revealDelay;local radius=T.revealSquare*.75+max(0,elapsed-T.revealHold)*(math.sqrt((g.cols*.5)^2+(g.pr*.75)^2)+7-T.revealSquare*.75)/(T.revealMs-T.revealHold)
 local revealed={};if reveal then
  for by=0,math.ceil(g.pr/7)-1 do for bx=0,math.ceil(g.cols/7)-1 do local dx=(bx+.5)*7-g.cols*.5;local dy=(by+.5)*7-g.pr*.75
   local square=bx>=math.floor((g.cols*.5-10.5)/7+.5)and bx<=math.floor((g.cols*.5+10.5)/7+.5)-1 and by>=math.floor((g.pr*.75-21)/7+.5)and by<=math.floor(g.pr*.75/7+.5)-1
   revealed[by*100+bx]=elapsed>=0 and(square or(elapsed>=T.revealHold and dx*dx+dy*dy<=radius*radius))
  end end
 end
 local dirty={};for r in pairs(g.changed)do local y0=max(0,(r-1)*4);local y1=min(self.arth,(r+2)*4);for i,b in ipairs(self.bands)do if b.y0<y1 and b.y1>y0 then dirty[i]=true end end end;g.changed={}
 for i,b in ipairs(self.bands)do
  if reveal or dirty[i]or b.lastrev==-1 or self.wasreveal then
   local chunks={};for j,run in ipairs(b.runs)do local p=run.o
    if g:isstatic(p)or g.home[p]==1 then local colored=not reveal or revealed[floor(floor(p/g.cols)/7)*100+floor((p%g.cols)/7)];chunks[j]=colored and run.color or run.gray
    else chunks[j]=run.empty end
   end
   gui.set_texture_data(b.name,self.artw,b.y1-b.y0,'rgba',table.concat(chunks),false);b.lastrev=g.staticVersion
  end
  local h=(b.y1-b.y0)/4*game.grain
  self:rect(b.name,540,C.LAYOUT.picture.y+b.y0/4*game.grain+h/2,770,h,b.name,'sand',1,0,true)
 end;self.wasreveal=reveal
end
function M:grains(game)
 local pixels={unpack(self.blank,1,1)};for i=1,#self.blank do pixels[i]=self.blank[i]end
 local g=self.grid;local grain=game.grain;local ox=floor((155-self.C.LAYOUT.sandArea.x)/grain+.5);local cw,ch=self.cw,self.ch
 local function plot(x,y,c,shade)
  local cx,cy=floor((x-self.C.LAYOUT.sandArea.x)/grain),floor((y-188.5)/grain)
  if cx>=0 and cx<cw and cy>=0 and cy<ch then pixels[cy*cw+cx+1]=self.lut[c][shade%8]end
 end
 for r=0,g.rows-1 do if g.rowLoose[r]>0 then for c=0,g.cols-1 do local p=r*g.cols+c;local color=g.loose[p]
  if color>0 and g.home[p]~=1 then local q=r*cw+c+ox+1;if q>0 and q<=#pixels then pixels[q]=self.lut[color][g.ls[p]]end end
 end end end
 for _,b in ipairs(game.belt.grains)do local x,y=game.belt:position(b.s,b.lane);plot(x,y,b.color,b.shade)end
 for _,f in ipairs(game.belt.fall)do plot(f.x,f.y,f.color,f.shade)end
 gui.set_texture_data('grains',cw,ch,'rgba',table.concat(pixels),false)
 self:rect('grains',self.C.LAYOUT.sandArea.x+cw*grain/2,188.5+ch*grain/2,cw*grain,ch*grain,'grains','sand',1,0,true)
end
function M:buckets(game)
 local C,L=self.C,self.C.LAYOUT;local r=game.rack;local T=C.TIMING
 for col,column in ipairs(r.cols)do for row=1,4 do local b=column.queue[row];local key='bucket'..col..'_'..row;local shown=b and r.shown[b.color]and not(row==1 and column.busy and r.clock<(column.slide_at or 0))
  if shown then
   local age=r.clock-(r.wave_at or 0)-570-(row-1)*40;if game.wave>1 then age=r.clock-(r.wave_at or 0)-(row-1)*40 end
   local rise=age<T.bucketRise and T.bucketRiseFrom*(1-back(max(0,age)/T.bucketRise))or 0
   local slide=column.slide_at and max(0,min(1,(r.clock-column.slide_at)/160))or 1;local y=L.buckets.ys[row]+rise
   if slide<1 then y=y+107*(1-slide)^2 end
   local x=L.buckets.xs[col];local size=1+(b.pulse or 0)*.06;local art=C.BUCKETS.art[b.color]
   self:rect(key..'shadow',x,y+L.buckets.h*.32,180*C.ART_SCALE,85*C.ART_SCALE,'bucket-shadow','buckets')
   self:rect(key,x,y,L.buckets.w*size,L.buckets.h*size,art,'buckets')
   self:text(key..'label',tostring(max(0,math.ceil(b.label*b.remaining/b.need))),x,y+L.buckets.h*.265,38,'text')
   local lid=self.sizes[art..'-lid'];local at=column.open_at or 0;local open=row==1 and r.opened[b.color];local t=r.clock-at
   local alpha=1;local ly=y-L.buckets.h/2-10*C.ART_SCALE+(lid and lid.height or 0)*C.ART_SCALE/2;local z=1;local angle=0
   if open and t>=0 then
    if t<140 then local k=1-(1-t/140)^2;local h=L.buckets.h*(1+.6*k);self:rect(key,x,y+L.buckets.h/2-h/2,L.buckets.w*(1-.15*k),h,art,'buckets');ly=ly-L.buckets.h*.6*k
    elseif t<250 then local k=1-(1-(t-140)/110)^2;ly=ly-L.buckets.h*.6+(L.belt.cy+L.belt.radius*.3-(ly-L.buckets.h*.6))*k
    elseif t<380 then ly=L.belt.cy+L.belt.radius*.3;z=1-((t-250)/130)^2;angle=-18*math.pi/180*(1-z)
    else alpha=0 end
   end
   if lid then self:rect(key..'lid',x,ly,lid.width*C.ART_SCALE*z,lid.height*C.ART_SCALE*z,art..'-lid','lids',alpha,angle)end
  else for _,suffix in ipairs({'','shadow','label','lid'})do self:hide(key..suffix)end end
 end end
 for i=1,8 do local f=r.fly[i];local key='fly'..i
  if f then local age=r.clock-f.at;local art=C.BUCKETS.art[f.bucket.color];local x,y=L.buckets.xs[f.col],1574;local w,h=L.buckets.w,L.buckets.h;local spin=0;local lid=self.sizes[art..'-lid'];local ly=0
   if age<230 then local t=age/230;local k=1-(1-t)^2;h=h*(1+.45*k);w=w*(1-.12*k);y=1574+L.buckets.h/2-h/2;ly=-110*(1-t*t)
   elseif age<380 then local k=1-(1-(age-230)/150)^2;y=1574+(L.belt.cy+L.belt.radius*.45-1574)*k
   else local k=min(1,(age-380)/450);x=x+760*k*k;y=L.belt.cy+L.belt.radius*.45-50*k*k;spin=k*k*85*math.pi/180
    if not f.burst then f.burst=true;self:burst(L.buckets.xs[f.col],L.belt.cy+L.belt.radius*.45,8,false,game.time)end
   end
   self:rect(key,x,y,w,h,art,'fly',1,spin)
   if lid then self:rect(key..'lid',x,y-h/2-10*C.ART_SCALE+lid.height*C.ART_SCALE/2+ly,lid.width*C.ART_SCALE,lid.height*C.ART_SCALE,art..'-lid','fly',1,spin)end
  else self:hide(key);self:hide(key..'lid')end
 end
end
function M:draw(game)
 local C,L=self.C,self.C.LAYOUT;local cover=max(self.w,self.h)/self.s
 self.shakex,self.shakey=0,0
 local shake=game.shake_at;local duration=game.shake_duration;local strength=game.shake_strength
 if game.reason=='jam'or game.reason=='softlock'then shake=game.ended_at;duration=C.TIMING.wrongShake;strength=C.TIMING.wrongShakeIntensity end
 if shake and game.time-shake<duration and game.phase~='endcard'then self.shakex=(math.random()*2-1)*self.w/self.s*strength;self.shakey=(math.random()*2-1)*self.h/self.s*strength end
 self:rect('bg',540,960,cover,cover,'background','background')
 self:rect('belt',L.belt.cx,L.belt.cy+L.belt.artOffsetY,857*C.ART_SCALE,259*C.ART_SCALE,'conveyor-belt','belt')
 for i=1,25 do local x,y,a=game.belt:position((game.belt.travelled+(i-1)*game.belt.length/25)%game.belt.length,0);self:rect('arrow'..i,x,y,47*C.ART_SCALE,50*C.ART_SCALE,'belt-chevron','arrows',1,a)end
 self:picture(game);self:grains(game)
 self:rect('frame',L.container.x+L.container.w/2,L.container.y+L.container.h/2,L.container.w,L.container.h,'sand-container','frame')
 self:buckets(game);self:text('percent',game.belt:percent()..'%',540,L.belt.cy,44,'text')
 local hand=game.hand;local hint=game.hint
 if hand and hint and game.phase=='play'and C.HAND_TUTOR_MODE then
  local p=((game.time-game.hand_at)%2080)/2080;local move,press,fade=0,0,0
  if p<.15 then press=p/.15;fade=min(1,p/.08)elseif p<.75 then local q=(p-.15)/.6;press=1;move=q<.5 and 2*q*q or 1-(2-2*q)^2/2;fade=1 elseif p<.95 then local q=(p-.75)/.2;press=1-q;move=1;fade=1-q end
  if game.mechanic=='tap'then press=.5-.5*math.cos(((game.time-game.hand_at)%1040)/1040*math.pi*2);fade=1;move=0 end
  local x=hint.x1+(hint.x2-hint.x1)*move;local y=hint.y1;local a=-24*math.pi/180;local dx=-(0*math.cos(a)-(-.465*222)*math.sin(a));local dy=-(-.465*222)*math.cos(a)
  self:rect('hand',x+dx+34*(-math.sin(a))*(1-press),y+dy+34*math.cos(a)*(1-press),190*(1-.08*press),222*(1-.08*press),'ui-hand','hand',fade,a)
  if game.mechanic=='cut'and move>0 then self:line('guide',hint.x1,hint.y1,x,y,12,'hand',.75*fade)else self:hide('guide')end
  if game.mechanic=='tap'then local z=1+.07*press;self:rect('hint-ring',hint.x1,hint.y1,110*z,110*z,'fx-ring','impact',.9)else self:hide('hint-ring')end
 else self:hide('hand');self:hide('guide');self:hide('hint-ring')end
 for i=1,4 do local a=game.impacts[i];local t=a and game.time-a.at or 999
  if a and t<340 and game.phase~='endcard'then local q=min(1,t/340);local k=1-(1-q)^3;local z=.25+.75*k;self:rect('impact-ring'..i,a.x,a.y,230*z,230*z,'fx-ring','impact',.95*(1-k))
   q=min(1,t/260);k=1-(1-q)^2;z=.4+.7*k;local n=self:rect('impact-glow'..i,a.x,a.y,200*z,200*z,'fx-glow','impact',.9*(1-k));local rgb=C.SAND.palette[a.color];gui.set_color(n,vmath.vector4(rgb[1]/255,rgb[2]/255,rgb[3]/255,.9*(1-k)))
  else self:hide('impact-ring'..i);self:hide('impact-glow'..i)end
 end
 for i=1,96 do local b=game.trail[i];local prev=game.trail[i-1];if b and prev then local life=max(0,1-(game.time-b.t)/260);self:line('trailglow'..i,prev.x,prev.y,b.x,b.y,69*(.35+.65*life),'trail',.3*life);self:line('trail'..i,prev.x,prev.y,b.x,b.y,14*(.35+.65*life),'trail',.95*life)else self:hide('trail'..i);self:hide('trailglow'..i)end end
 if game.praise and game.phase~='endcard'and game.time-game.praise_at<1280 then
  local t=game.time-game.praise_at;local fx=C.FX[game.praise];local z=.3+.7*back(min(1,t/380));local fade=max(0,(t-900)/380);local a=1-fade*fade
  self:rect('praise',540,598-90*fade*fade,720*z,720*fx.height/fx.width*z,fx.key,'praise',a,(-6+6*min(1,t/380))*math.pi/180)
 else self:hide('praise')end
 if game.reason=='jam'or game.reason=='softlock'then self:rect('vignette',540,960,cover,cover*1000/590,'fail-glow','danger',min(.95,(game.time-game.ended_at)/200*.95))end
 if game.phase=='endcard'and C.SHOW_PACKSHOT then
  local t=game.time-game.card_at;local dim=self:rect('dim',540,960,self.w/self.s,self.h/self.s,nil,'dim',.91*math.sin(min(1,t/300)*math.pi/2));gui.set_color(dim,vmath.vector4(44/255,44/255,44/255,.91*math.sin(min(1,t/300)*math.pi/2)))
  local k=back(min(1,max(0,t-80)/420));local z=.5+.5*k
  self:rect('logo',540,960-(t>500 and 7-7*math.cos((t-500)/1100*math.pi)or 0),860*z,860*747/1000*z,'endcard-logo','endcard',min(1,max(0,t-80)/420))
  if t>=500 and not self.logo_burst then self.logo_burst=true;self:burst(540,960,12,true,game.time)end
 end
 for i=#self.sparkles,1,-1 do if game.time-self.sparkles[i].at>=720 then table.remove(self.sparkles,i)end end
 for i=1,64 do local p=self.sparkles[i];if p then local age=game.time-p.at;local k=1-(1-min(1,age/520))^3;local a=1-max(0,(age-420)/300)^2;local z=.3+.7*k;local n=self:rect('sparkle'..i,p.x+p.dx*k,p.y+p.dy*k,p.size*z,p.size*z,'sparkle',p.logo and 'endcard' or 'praise',a,age/520*140*math.pi/180);gui.set_color(n,vmath.vector4(p.color[1],p.color[2],p.color[3],a))else self:hide('sparkle'..i)end end
end
return M
