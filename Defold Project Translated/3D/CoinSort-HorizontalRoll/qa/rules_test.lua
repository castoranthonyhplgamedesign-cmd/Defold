package.path='./?.lua;'..package.path
local C=require 'main.config'
local R=require 'main.rules'
local function encode(v)
    if type(v)=='number'then return tostring(v)end
    if type(v)=='boolean'then return tostring(v)end
    if type(v)=='string'then return '"'..v..'"'end
    if v==nil then return 'null'end
    local items={};for _,value in ipairs(v)do items[#items+1]=encode(value)end
    return '['..table.concat(items,',')..']'
end
local trace={}
local function best_target(level)
    local best,best_cost
    for _,color in ipairs(R.colors)do
        for lane=0,11 do
            local offsets,cost={},0
            for row=1,level.config.rowSegmentCount do
                local selected,distance
                local palette=C.LEVEL_EDITOR_CONFIG.levels[level.index].outerCylinder.rowSegmentColors[row]
                for source=0,11 do
                    if palette[source+1]==color and not level.cleared[row][source]then
                        local target=(lane-source)%12
                        local delta=(target-level.offsets[row]+6)%12-6
                        if not distance or math.abs(delta)<distance then selected=target;distance=math.abs(delta)end
                    end
                end
                if not selected then cost=math.huge;break end
                offsets[row]=selected;cost=cost+distance
            end
            if not best_cost or cost<best_cost then best,best_cost=offsets,cost end
        end
    end
    assert(best and best_cost<math.huge,'a reachable matching column remains')
    return best
end
for index=1,2 do
    local level=R.new(index)
    local moves=0
    while not R.complete(level)do
        local target=best_target(level)
        local moved=false
        for row=1,level.config.rowSegmentCount do
            local delta=(target[row]-level.offsets[row]+6)%12-6
            if delta~=0 then
                local step=math.max(-2,math.min(2,delta));R.rotate(level,row,step);moves=moves+1;moved=true
                local matches=R.matches(level)
                trace[#trace+1]={index,row,step,matches}
                R.clear(level,matches)
                break
            end
        end
        if not moved then
            local matches=R.matches(level);assert(#matches>0)
            trace[#trace+1]={index,1,0,matches};R.clear(level,matches)
        end
        assert(moves<150,'objective can be reached through real rotations')
    end
    assert(level.count>=level.config.clearObjectiveLanes)
end
assert(R.step(-2.5)==-2 and R.step(2.5)==3,'JavaScript rounding at signed half steps')
assert(R.step(.4)==0 and R.step(-.4)==0,'sub-half release snaps back')
assert(#R.matches(R.new(3))==0,'third level has no matching objective')
local b=R.new(1);local original=b.offsets[1];R.rotate(b,1,24);assert(b.offsets[1]==original,'rotation wraps')
local f=assert(io.open('qa/rotation-replay.json','w'));f:write(encode(trace),'\n');f:close()
print('PASS: both objectives reachable; third-level tap-only behavior; wrap, signed rounding, cleared source lanes. Replay moves: '..#trace)
