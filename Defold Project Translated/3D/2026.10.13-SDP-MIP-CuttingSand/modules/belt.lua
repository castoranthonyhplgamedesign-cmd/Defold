local M={};M.__index=M
function M.new(C,rack)
 local b=C.LAYOUT.belt;local straight=b.half*2;local arc=math.pi*b.radius
 return setmetatable({C=C,rack=rack,grains={},fall={},counts={},incoming=0,accepted=0,refused=0,straight=straight,arc=arc,length=straight*2+arc*2,travelled=0,limit=C.BELT.capacity+C.BELT.overflow},M)
end
function M:load()return #self.grains+self.incoming end
function M:percent()return math.min(100,math.floor(self:load()/self.C.BELT.capacity*100+.5))end
function M:feeds()for c,n in pairs(self.counts)do if n>0 and self.rack:takes(c)then return true end end;return false end
function M:frontwaiting()for c=1,#self.C.SAND.palette do if self.waiting(c)>0 and self.rack:takes(c)then return true end end;return false end
function M:jammed()return self:load()>=self.C.BELT.capacity and not self:feeds()and(self:load()>=self.limit or not self:frontwaiting())end
function M:accept(c,shade,x)
 local load=self:load()
 if #self.fall>=self.limit*2 or load>=self.limit or(load>=self.C.BELT.capacity and not self.rack:takes(c)and(self:feeds()or not self:frontwaiting()))then self.refused=self.refused+1;return false end
 self.accepted=self.accepted+1;local b=self.C.LAYOUT.belt
 self.fall[#self.fall+1]={x=x,y=self.C.LAYOUT.frame.mouthY,vy=60,ty=b.cy-b.radius+(math.random()-.5)*(b.track-12),vx=0,kind=0,color=c,shade=shade}
 self.incoming=self.incoming+1;self.counts[c]=(self.counts[c]or 0)+1;return true
end
function M:position(s,lane)
 local b=self.C.LAYOUT.belt;local left,right=b.cx-b.half,b.cx+b.half;local radius=b.radius-lane
 if s<self.straight then return left+s,b.cy-b.radius+lane,0
 elseif s<self.straight+self.arc then local a=-math.pi/2+(s-self.straight)/b.radius;return right+math.cos(a)*radius,b.cy+math.sin(a)*radius,(s-self.straight)/b.radius
 elseif s<self.straight*2+self.arc then return right-(s-self.straight-self.arc),b.cy+b.radius-lane,math.pi
 else local a=math.pi/2+(s-self.straight*2-self.arc)/b.radius;return left+math.cos(a)*radius,b.cy+math.sin(a)*radius,math.pi+(s-self.straight*2-self.arc)/b.radius end
end
local function swapremove(a,i)a[i]=a[#a];a[#a]=nil end
function M:update(ms)
 local dt=math.min(ms,50)/1000;local C=self.C;local b=C.LAYOUT.belt;local buckets=C.LAYOUT.buckets;local i=1
 while i<=#self.fall do local f=self.fall[i];f.vy=f.vy+C.SAND.gravity*dt;f.y=f.y+f.vy*dt;f.x=f.x+f.vx*dt
  if f.y>=f.ty then
   if f.kind==0 then self.incoming=self.incoming-1;self.grains[#self.grains+1]={s=math.max(0,math.min(self.straight,f.x-(b.cx-b.half))),lane=f.ty-(b.cy-b.radius),color=f.color,shade=f.shade}
   else self.rack:fill(f.bucket)end;swapremove(self.fall,i)
  else i=i+1 end
 end
 i=1;while i<=#self.grains do local g=self.grains[i];g.s=(g.s+C.BELT.speed*dt)%self.length;local removed=false
  if g.s>=self.straight+self.arc and g.s<=self.straight*2+self.arc then
   local x=b.cx+b.half-(g.s-self.straight-self.arc)
   for col,bx in ipairs(buckets.xs)do if math.abs(x-bx)<=buckets.catchHalf then
    local id=self.rack:reserve(col,g.color)
    if id then local sx=x+(math.random()-.5)*8;local sy=b.cy+b.radius-g.lane;local ty=buckets.ys[1]-buckets.h*.3+math.random()*10;local vy=25+math.random()*45
     local time=(math.sqrt(vy*vy+2*C.SAND.gravity*math.max(1,ty-sy))-vy)/C.SAND.gravity
     self.fall[#self.fall+1]={x=sx,y=sy,ty=ty,vy=vy,vx=(bx+(math.random()-.5)*22-sx)/math.max(.05,time),kind=1,bucket=id,color=g.color,shade=g.shade}
     self.counts[g.color]=self.counts[g.color]-1;swapremove(self.grains,i);removed=true
    end;break
   end end
  end
  if not removed then i=i+1 end
 end
 self.travelled=(self.travelled+C.BELT.speed*dt)%self.length
end
return M
