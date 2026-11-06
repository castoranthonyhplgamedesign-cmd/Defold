local C=require 'main.config'
local M={}
M.colors={'gold','sky','lime','violet','coral','pink'}
function M.mod(value,size)return value%size end
function M.step(rotation)return math.abs(rotation)>=0.38 and math.floor(rotation+0.5) or 0 end
function M.new(index)
    local config=C.LEVEL_CONFIGS[index]
    local level={config=config,index=index,offsets={},rotation={},cleared={},count=0,dim=config.darkenWhenNonInteractable and 0.95 or 0,unlit=index~=1,locked=index~=1}
    for r=1,config.rowSegmentCount do
        level.offsets[r]=config.initialRowSegmentOffsets[r]
        level.rotation[r]=0;level.cleared[r]={}
    end
    return level
end
function M.source(level,row,lane)return (lane-level.offsets[row])%level.config.laneCount end
function M.color(level,row,lane)
    local source=M.source(level,row,lane)
    if level.cleared[row][source] then return nil end
    return C.LEVEL_EDITOR_CONFIG.levels[level.index].outerCylinder.rowSegmentColors[row][source+1]
end
function M.rotate(level,row,step)
    level.offsets[row]=(level.offsets[row]+step)%level.config.laneCount
    level.rotation[row]=0
end
function M.matches(level)
    local matches={}
    if not level.config.clearObjectiveLanes then return matches end
    for lane=0,level.config.laneCount-1 do
        local color=M.color(level,1,lane)
        local match=color~=nil
        for row=2,level.config.rowSegmentCount do if M.color(level,row,lane)~=color then match=false end end
        if match then matches[#matches+1]=lane end
    end
    table.sort(matches,function(a,b)return -math.cos((a+.5)*math.pi/6)>-math.cos((b+.5)*math.pi/6)end)
    return matches
end
function M.clear(level,matches)
    for _,lane in ipairs(matches)do
        for row=1,level.config.rowSegmentCount do level.cleared[row][M.source(level,row,lane)]=true end
        level.count=level.count+1
    end
end
function M.complete(level)return level.config.clearObjectiveLanes and level.count>=level.config.clearObjectiveLanes end
function M.row_width(config)return (config.coinsPerRowSegment-1)*config.coinOverlap+60 end
function M.spacing(config)return M.row_width(config)-33+config.rowSegmentSpacingOffset end
function M.row_x(config,row)return config.centerX+(row-1-(config.rowSegmentCount-1)/2)*M.spacing(config)end
return M
