-- Source: SandGrid at baseline 8a241d3. Zero-based cells mirror source indices.
local Rng=require 'modules.rng'
local M={};M.__index=M
local floor,min,max=math.floor,math.min,math.max
local function zeros(n)local a={};for i=0,n-1 do a[i]=0 end;return a end
local function unpackbytes(s,n)local a={};for i=0,n-1 do a[i]=s:byte(i+1) end;return a end
function M.new(level,cells,shades,regions)
 local n=level.cols*level.rows
 local s=setmetatable({cols=level.cols,pr=level.pr,rows=level.rows,n=n,total=level.total,remaining=level.total,looseTotal=0,loosePicture=0,exitedPicture=0,staticVersion=0,lastCut=0,lastDrop=0,frame=0,changed={},cutTop={},cuttable={},level=level},M)
 s.cells=unpackbytes(cells,n);s.shade=unpackbytes(shades,n);s.region={}
 for p=0,s.cols*s.pr-1 do s.region[p]=regions:byte(p*2+1)+regions:byte(p*2+2)*256 end
 for _,k in ipairs({'loose','ls','home','vy','acc','delay','moved'})do s[k]=zeros(n) end
 s.counts=zeros(256);s.start=zeros(256);s.funnel=zeros(256);s.rowLoose=zeros(s.rows)
 for c=0,255 do s.counts[c]=level.totals[c+1] or 0;s.start[c]=s.counts[c] end
 s.random=Rng.new(level.seed);s.orders={{},{}}
 for first=0,1 do local l=floor((s.cols-1)/2);local r=l+1;for i=0,s.cols-1 do local take=r>=s.cols or (l>=0 and i%2==first);s.orders[first+1][i]=take and l or r;if take then l=l-1 else r=r+1 end end end
 return s
end
function M:isstatic(p)return p>=0 and p<self.n and self.cells[p]>0 and self.cells[p]~=255 end
function M:set_cuttable(colors)
 self.cuttable={};for _,c in ipairs(colors)do self.cuttable[c]=true end
 for c=0,self.cols-1 do self.cutTop[c]=self.pr end
end
function M:near(c,r,reach)
 local best,dist=-1,math.huge
 for dy=-reach,reach do for dx=-reach,reach do local x,y=c+dx,r+dy
  if x>=0 and x<self.cols and y>=0 and y<self.pr then local p=y*self.cols+x;local d=dx*dx+dy*dy
   if d<=reach*reach and d<dist and self:isstatic(p) and self.cuttable[self.cells[p]]then best,dist=p,d end
  end
 end end;return best
end
function M:loosen(p,delay)
 self.loose[p]=self.cells[p];self.ls[p]=self.shade[p];self.cells[p]=0;self.vy[p]=0;self.acc[p]=0;self.delay[p]=delay
 self.remaining=self.remaining-1;self.looseTotal=self.looseTotal+1;self.loosePicture=self.loosePicture+1
 local r=floor(p/self.cols);self.rowLoose[r]=self.rowLoose[r]+1;self.home[p]=1;self.staticVersion=self.staticVersion+1
end
function M:unsupported(jitter)
 local seen,stack={},{};local cols=self.cols;local pend=cols*self.pr
 local function add(p)if not seen[p] and self:isstatic(p)then seen[p]=true;stack[#stack+1]=p end end
 for c=0,cols-1 do add(c)end;for r=1,self.pr-1 do add(r*cols);add(r*cols+cols-1)end
 while #stack>0 do local p=table.remove(stack);local c=p%cols;if c>0 then add(p-1)end;if c<cols-1 then add(p+1)end;if p+cols<pend then add(p+cols)end end
 local count=0;for p=0,pend-1 do if self:isstatic(p)and not seen[p]then self:loosen(p,self.random()*jitter);count=count+1 end end;return count
end
function M:cut(cell,c,r,T)
 self.lastCut=0;self.lastDrop=0;if not self:isstatic(cell)then return end
 local color,region=self.cells[cell],self.region[cell];local stack,seen,list={cell},{[cell]=true},{};local cols=self.cols
 local function add(p)if p>=0 and p<cols*self.pr and not seen[p] and self.cells[p]==color and self.region[p]==region then seen[p]=true;stack[#stack+1]=p end end
 while #stack>0 do local p=table.remove(stack);list[#list+1]=p;local x=p%cols;if x>0 then add(p-1)end;if x<cols-1 then add(p+1)end;add(p-cols);add(p+cols)end
 for _,p in ipairs(list)do local x=p%cols;local d=((x-c)^2+(floor(p/cols)-r)^2)^.5;self:loosen(p,d*T.tapRipple+self.random()*T.tapJitter)end
 self.lastCut=#list;self.lastDrop=self:unsupported(T.dropJitter)
end
function M:cutcolumn(c,top,bottom,jitter)
 if top>=self.cutTop[c]then return 0 end
 local count=0;local row=top
 while row<self.cutTop[c]do local p=row*self.cols+c
  if self:isstatic(p)then if self.cuttable[self.cells[p]]then self:loosen(p,self.random()*jitter);count=count+1 elseif row>bottom then break end end
  row=row+1
 end
 if row>=self.cutTop[c]then self.cutTop[c]=top end;return count
end
function M:cutbelow(points,T)
 local count=0
 for i=1,#points-3,2 do local x1,y1=points[i],points[i+1];local dx,dy=points[i+2]-x1,points[i+3]-y1;local steps=max(1,math.ceil((dx*dx+dy*dy)^.5*2))
  for st=0,steps do local c,r=floor(x1+dx*st/steps),floor(y1+dy*st/steps);local reach=T.cutReach
   if c>=-reach and c<self.cols+reach and r>=-reach and r<self.pr then
    local from,to=max(0,c-reach),min(self.cols-1,c+reach);if from<=T.cutEdgeSnap then from=0 end;if to>=self.cols-1-T.cutEdgeSnap then to=self.cols-1 end
    for col=from,to do local off=col-c;local half=math.abs(off)<=reach and floor(math.sqrt(reach*reach-off*off))or 0;local top=r-half;if top<=T.cutTopSnap then top=0 end;count=count+self:cutcolumn(col,top,r+half,T.cutJitter)end
   end
  end
 end
 self.lastCut=count;self.lastDrop=count>0 and self:unsupported(T.dropJitter)or 0
end
function M:crumble(colors,T)
 local counts,crumble={},{};for p=0,self.cols*self.pr-1 do if self:isstatic(p)then local c=self.cells[p];counts[c]=(counts[c]or 0)+1 end end
 local any=false;for _,c in ipairs(colors)do if (counts[c]or 0)>0 and counts[c]<=max(T.leftoverGrains,T.leftoverShare*self.start[c])then crumble[c]=true;any=true end end
 if not any then return 0 end;local count=0;for p=0,self.cols*self.pr-1 do if self:isstatic(p)and crumble[self.cells[p]]then self:loosen(p,self.random()*T.cutJitter);count=count+1 end end;return count+self:unsupported(T.dropJitter)
end
function M:leavehome(p)
 if self.home[p]==1 then self.home[p]=0;self.changed[floor(p/self.cols)]=true end
end
function M:free(p)return p>=0 and p<self.n and self.cells[p]==0 and self.loose[p]==0 end
function M:target(p)
 local cols=self.cols;local c=p%cols;local r=floor(p/cols)
 if r==self.rows-1 then if self.cells[p]~=255 and self.exit(self.loose[p],self.ls[p],c)then return -2 end;return -1 end
 local below=p+cols;if self:free(below)then return below end
 local pinched=self.cells[below]~=0;local left=self.random()<.5;local side=left and -1 or 1
 if (left and c>0 or not left and c<cols-1)and self:free(below+side)and not(pinched and self.cells[p+side]~=0)then return below+side end
 if (left and c<cols-1 or not left and c>0)and self:free(below-side)and not(pinched and self.cells[p-side]~=0)then return below-side end
 if r>=self.pr then local q=c<cols/2 and p+1 or p-1;if self:free(q)then return q end end;return -1
end
function M:move(p,q)
 local pend=self.cols*self.pr;if p<pend then self.movedInPicture=self.movedInPicture+1 end
 self:leavehome(p);self.loose[q]=self.loose[p];self.ls[q]=self.ls[p];self.loose[p]=0
 local r,rr=floor(p/self.cols),floor(q/self.cols);self.rowLoose[r]=self.rowLoose[r]-1;self.rowLoose[rr]=self.rowLoose[rr]+1
 if p<pend and q>=pend then self.loosePicture=self.loosePicture-1;self.exitedPicture=self.exitedPicture+1;local c=self.loose[q];self.funnel[c]=self.funnel[c]+1 end
end
function M:remove(p)
 self:leavehome(p);local c=self.loose[p];self.counts[c]=self.counts[c]-1
 if p<self.cols*self.pr then self.loosePicture=self.loosePicture-1;self.exitedPicture=self.exitedPicture+1 else self.funnel[c]=self.funnel[c]-1 end
 self.loose[p]=0;self.looseTotal=self.looseTotal-1;local r=floor(p/self.cols);self.rowLoose[r]=self.rowLoose[r]-1
end
function M:step(ms,gravity,maxspeed)
 self.movedInPicture=0;if self.looseTotal==0 then return false end
 local dt=min(ms,50)/1000;self.frame=self.frame+1;local flip=self.frame%2==1;local cols=self.cols;local pend=cols*self.pr;local changed=false;local order=self.orders[flip and 2 or 1]
 for r=self.rows-1,0,-1 do if self.rowLoose[r]>0 then for i=0,cols-1 do
  local c=r>=self.pr and order[i]or(flip and cols-1-i or i);local p=r*cols+c
  if self.loose[p]>0 and self.moved[p]~=self.frame then
   if self.delay[p]>0 then self.delay[p]=self.delay[p]-ms else
    local v=min(maxspeed,self.vy[p]+gravity*dt);local a=self.acc[p]+v*dt;local steps=floor(a);a=a-steps
    for st=1,steps do local q=self:target(p)
     if q==-2 then self:remove(p);changed=true;p=-1;break
     elseif q==-1 then v=p>=pend and min(v,90)or 0;a=0;break
     else self:move(p,q);p=q;changed=true end
    end
    if p>=0 then self.vy[p]=v;self.acc[p]=a;self.moved[p]=self.frame end
   end
  end
 end end end;return changed
end
function M:patches()
 local cols,pend=self.cols,self.cols*self.pr;local drain={}
 local function falls(p)
  local x=p%cols;local below=p+cols
  if below>=pend then return self.cells[below]~=255 or(x>0 and self.cells[below-1]~=255)or(x<cols-1 and self.cells[below+1]~=255)end
  if drain[below]then return true end
  local own=self.cells[p];local function solid(q)return self.cells[q]~=0 and not(own~=0 and self.cells[q]==own and self.region[q]==self.region[p])end
  local pinch=solid(below);return (x>0 and drain[below-1]and not(pinch and solid(p-1)))or(x<cols-1 and drain[below+1]and not(pinch and solid(p+1)))or false
 end
 for p=pend-1,0,-1 do drain[p]=self.cells[p]==0 and falls(p)or false end
 local seen,out={},{}
 for start=0,pend-1 do if self:isstatic(start)and not seen[start]then
  local color,region=self.cells[start],self.region[start];local list,stack={},{start};seen[start]=true
  local a={color=color,size=0,minRow=self.pr,maxRow=0,minCol=cols,maxCol=0,cell=start,bottom=start,openBelow=false,drains=false};local sx,sy=0,0
  local function add(p)if p>=0 and p<pend and not seen[p]and self.cells[p]==color and self.region[p]==region then seen[p]=true;stack[#stack+1]=p end end
  while #stack>0 do local p=table.remove(stack);list[#list+1]=p;local x,y=p%cols,floor(p/cols);sx=sx+x;sy=sy+y
   a.minRow=min(a.minRow,y);a.maxRow=max(a.maxRow,y);a.minCol=min(a.minCol,x);a.maxCol=max(a.maxCol,x)
   a.openBelow=a.openBelow or(self.cells[p+cols]==0 and self.loose[p+cols]==0);a.drains=a.drains or falls(p)
   if x>0 then add(p-1)end;if x<cols-1 then add(p+1)end;add(p-cols);add(p+cols)
  end
  a.size=#list;local bx,bn=0,0;for _,p in ipairs(list)do if floor(p/cols)>=a.maxRow-6 then bx=bx+p%cols;bn=bn+1 end end;bx=bn>0 and bx/bn or 0
  local best,bottom=math.huge,math.huge
  for _,p in ipairs(list)do local x,y=p%cols,floor(p/cols)
   local inset=x>=3 and x<cols-3 and y>=3 and y<self.pr-3 and self.cells[p-3]==color and self.cells[p+3]==color and self.cells[p-3*cols]==color and self.cells[p+3*cols]==color
   local score=(x-sx/#list)^2+(y-sy/#list)^2+(inset and 0 or 1e6);if score<best then best=score;a.cell=p end
   inset=x>=2 and x<cols-2 and y>=2 and self.cells[p-2]==color and self.cells[p+2]==color and self.cells[p-2*cols]==color
   score=(x-bx)^2+(y-(a.maxRow-3))^2*4+(inset and 0 or 1e6);if score<bottom then bottom=score;a.bottom=p end
  end;out[#out+1]=a
 end end;return out
end
return M
