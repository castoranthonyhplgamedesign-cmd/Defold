local M={};M.__index=M
local function has(a,v)for _,c in ipairs(a)do if c==v then return true end end;return false end
function M.new(C,totals)
 local s=setmetatable({cols={{queue={}},{queue={}},{queue={}},{queue={}}},byid={},filled=0,completed=0,clock=0,fly={},opened={},shown={},C=C},M)
 local plan,weights={},{};for c=1,#C.SAND.palette do weights[c]=0 end
 for i,e in ipairs(C.BUCKETS.start)do
  local color=type(e)=='table'and e[1]or e
  if color>0 then local numbers=type(e)=='table'and {unpack(e,2)}or C.BUCKETS.stacks[color];local col=(i-1)%4+1
   if numbers and #numbers>0 then for _,label in ipairs(numbers)do plan[#plan+1]={col=col,color=color,label=label,weight=label}end
   else plan[#plan+1]={col=col,color=color,label=C.BUCKETS.capacity,weight=math.min(4,math.floor((i-1)/4)+1)}end
  end
 end
 for _,p in ipairs(plan)do weights[p.color]=weights[p.color]+p.weight end
 local given={};for c=1,#C.SAND.palette do given[c]=0 end
 for _,p in ipairs(plan)do local c=p.color;local left=(totals[c]or 0)-given[c];local share=weights[c]<=p.weight and left or math.floor(left*p.weight/weights[c]+.5)
  given[c]=given[c]+share;weights[c]=weights[c]-p.weight
  local b={id=#s.byid+1,color=c,label=p.label,need=math.max(1,share),remaining=math.max(1,share),reserved=0,pulse=0};s.byid[b.id]=b;local q=s.cols[p.col].queue;q[#q+1]=b
 end;return s
end
function M:colors(colors,delay)
 self.opened={};self.shown={};self.wave_at=self.clock
 for _,c in ipairs(colors)do self.opened[c]=true;self.shown[c]=true end
 for col,column in ipairs(self.cols)do column.open_at=self.clock+(delay or 0)+(col-1)*self.C.TIMING.lidPop end
end
function M:front(col)
 local column=self.cols[col];local b=column.queue[1]
 if column.busy or not b or b.remaining-b.reserved<=0 then return nil end;return b
end
function M:takes(color)for col=1,4 do local b=self:front(col);if b and b.color==color then return true end end;return false end
function M:reserve(col,color)local b=self:front(col);if not b or b.color~=color then return nil end;b.reserved=b.reserved+1;return b.id end
function M:complete(col)
 local column=self.cols[col];if column.busy or not column.queue[1]then return end
 local b=table.remove(column.queue,1);column.busy=true;column.slide_at=self.clock+605;column.until_at=self.clock+765
 self.fly[#self.fly+1]={bucket=b,col=col,at=self.clock};self.completed=self.completed+1
 if self.onfull then self.onfull()end
end
function M:fill(id)
 local b=self.byid[id];b.reserved=b.reserved-1;b.remaining=b.remaining-1;b.pulse=1;self.filled=self.filled+1
 if b.remaining<=0 and b.reserved<=0 then for col,column in ipairs(self.cols)do if column.queue[1]==b then self:complete(col);break end end end
end
function M:update(ms,supply)
 self.clock=self.clock+ms
 for col,column in ipairs(self.cols)do
  if column.busy and self.clock>=column.until_at then column.busy=false;column.open_at=self.clock end
  local b=column.queue[1];if b then b.pulse=math.max(0,b.pulse-ms/160)
   if not column.busy and b.remaining>0 and b.reserved==0 and supply(b.color)<=0 then self:complete(col)end
  end
 end
 for i=#self.fly,1,-1 do if self.clock-self.fly[i].at>=830 then table.remove(self.fly,i)end end
end
function M:needed()local a={};for _,column in ipairs(self.cols)do local b=column.queue[1];if b and b.remaining>0 and not has(a,b.color)then a[#a+1]=b.color end end;table.sort(a);return a end
function M:queued()local a={};for _,col in ipairs(self.cols)do for _,b in ipairs(col.queue)do if b.remaining>0 and not has(a,b.color)then a[#a+1]=b.color end end end;return a end
function M:has_colors(colors)for _,col in ipairs(self.cols)do if col.busy then return true end;for _,b in ipairs(col.queue)do if has(colors,b.color)then return true end end end;return false end
function M:allfilled()for _,c in ipairs(self.cols)do if #c.queue>0 or c.busy then return false end end;return true end
function M:integrity()for _,b in ipairs(self.byid)do if b.remaining<0 or b.reserved<0 or b.reserved>b.remaining or b.remaining>b.need then return 'invalid bucket '..b.id end end;return ''end
return M
