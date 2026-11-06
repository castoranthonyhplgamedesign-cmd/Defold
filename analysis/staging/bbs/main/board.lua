-- Authoritative integer grid, translated from Unity BoardManager/Brick/Gate.
local M = {}
M.colors={Red="fd474b",Green="46d154",Blue="3169fe",Yellow="f1ca3a",Orange="fd7a39",Purple="a950f2",Pink="fe649f",Black="34373b",White="f5f7f8"}
M.directions={{0,1},{0,-1},{-1,0},{1,0}}
local function key(x,z) return x..","..z end
function M.slot(x,z)
    return x>=-3 and x<=3 and z>=-4 and z<=7 and not(x>=-1 and x<=1 and z>=-1 and z<=5)
end
function M.new()
    local b={bricks={},occupancy={},gates={},remaining=0,history={},turn=0}
    local function add(c,x,z,n)
        local a={id=#b.bricks+1,color=c,x=x,z=z,length=n,active=true}
        b.bricks[a.id]=a
        for dz=0,n-1 do b.occupancy[key(x,z+dz)]=a.id end
        b.remaining=b.remaining+1
    end
    for i,c in ipairs({"Blue","Green","Orange","Purple","Yellow","Red","Pink"}) do add(c,i-4,-4,2) end
    for z=-2,7 do
        for x=-3,3 do
            if M.slot(x,z) then add((x+z)%2==0 and "White" or "Black",x,z,1) end
        end
    end
    for i,c in ipairs({"Red","Orange","Yellow","Green","Blue","Purple","Pink"}) do
        b.gates[#b.gates+1]={color=c,x=i-4,z=7.67,dx=0,dz=1,cx=i-4,cz=7}
    end
    b.gates[#b.gates+1]={color="White",x=-3.71,z=1,dx=-1,dz=0,cx=-3,cz=1}
    b.gates[#b.gates+1]={color="Black",x=3.7,z=2,dx=1,dz=0,cx=3,cz=2}
    return b
end
function M.can_place(b,a,x,z)
    if not a.active then return false end
    for dz=0,a.length-1 do
        local id=b.occupancy[key(x,z+dz)]
        if not M.slot(x,z+dz) or (id and id~=a.id) then return false end
    end
    return true
end
function M.gate(b,a,x,z)
    for _,g in ipairs(b.gates) do
        if g.color==a.color then
            for dz=0,a.length-1 do
                if (g.dx==0 and x==g.cx and z+dz==g.cz) or
                    (g.dx~=0 and x==g.cx and z+dz==g.cz) then return g end
            end
        end
    end
end
function M.move(b,a,x,z)
    if not M.can_place(b,a,x,z) then return false end
    -- Swept movement must be performed in single-cell cardinal steps.
    if math.abs(x-a.x)+math.abs(z-a.z)>1 then return false end
    for dz=0,a.length-1 do b.occupancy[key(a.x,a.z+dz)]=nil end
    a.x,a.z=x,z
    for dz=0,a.length-1 do b.occupancy[key(x,z+dz)]=a.id end
    return true
end
function M.remove(b,a)
    if not a.active then return false end
    for dz=0,a.length-1 do b.occupancy[key(a.x,a.z+dz)]=nil end
    a.active=false
    b.remaining=b.remaining-1
    return true
end
function M.pick(b,x,z)
    return b.bricks[b.occupancy[key(math.floor(x+0.5),math.floor(z+0.5))]]
end
-- BFS finds an entire legal route, never crossing the U opening or another brick.
function M.route(b,a)
    if not a.active then return nil end
    local q,head={{x=a.x,z=a.z}},1
    local seen={[key(a.x,a.z)]=true}
    head=1
    while head<=#q do
        local p=q[head];head=head+1
        local g=M.gate(b,a,p.x,p.z)
        if g then
            local result={gate=g}
            while p.parent do table.insert(result,1,{x=p.x,z=p.z});p=p.parent end
            return result
        end
        for _,d in ipairs(M.directions) do
            local x,z=p.x+d[1],p.z+d[2]
            local k=key(x,z)
            if not seen[k] and M.can_place(b,a,x,z) then
                seen[k]=true;q[#q+1]={x=x,z=z,parent=p}
            end
        end
    end
end
local function direct_hint(b)
    local best
    for _,a in ipairs(b.bricks) do
        local route=M.route(b,a)
        if route and (not best or #route<#best.route) then best={brick=a,route=route,gate=route.gate} end
    end
    if best then
        local p=best.route[1]
        best.dx=p and p.x-best.brick.x or best.gate.dx
        best.dz=p and p.z-best.brick.z or best.gate.dz
        return best
    end
end
local function clone(b)
    local c={bricks={},occupancy={},gates=b.gates,remaining=b.remaining,history={},turn=0}
    for _,a in ipairs(b.bricks) do
        local n={id=a.id,color=a.color,x=a.x,z=a.z,length=a.length,active=a.active}
        c.bricks[n.id]=n
        if n.active then for dz=0,n.length-1 do c.occupancy[key(n.x,n.z+dz)]=n.id end end
    end
    return c
end
local function signature(b)
    local result={}
    for z=-4,7 do for x=-3,3 do
        if M.slot(x,z) then local id=b.occupancy[key(x,z)];result[#result+1]=id and b.bricks[id].color:sub(1,2) or "_" end
    end end
    return table.concat(result,",")
end
-- Search the small set of vacancy moves for the next matching exit. Equal-color
-- single-cell pieces are interchangeable in visited-state keys.
function M.hint(b)
    local direct=direct_hint(b)
    if direct then return direct end
    local q={{board=b}},head
    head=1
    local seen={[signature(b)]=true}
    while head<=#q and head<=12000 do
        local item=q[head];head=head+1
        for _,a in ipairs(item.board.bricks) do
            if a.active then for _,d in ipairs(M.directions) do
                if M.can_place(item.board,a,a.x+d[1],a.z+d[2]) then
                    local c=clone(item.board)
                    M.move(c,c.bricks[a.id],a.x+d[1],a.z+d[2])
                    local k=signature(c)
                    if not seen[k] then
                        seen[k]=true
                        local first=item.first or {id=a.id,dx=d[1],dz=d[2]}
                        local next_hint=direct_hint(c)
                        if next_hint then
                            return {brick=b.bricks[first.id],gate=next_hint.gate,dx=first.dx,dz=first.dz,blocker=true,
                                route={{x=b.bricks[first.id].x+first.dx,z=b.bricks[first.id].z+first.dz}}}
                        end
                        q[#q+1]={board=c,first=first}
                    end
                end
            end end
        end
    end
    return nil
end
function M.legacy_fallback(b)
    -- Blocker planning: examine moves by distance from a neutral brick to its exit.
    local nearest,dist
    for _,a in ipairs(b.bricks) do
        if a.active and (a.color=="Black" or a.color=="White") then
            for _,g in ipairs(b.gates) do
                if g.color==a.color then
                    local d=math.abs(a.x-g.cx)+math.abs(a.z-g.cz)
                    if not dist or d<dist then nearest={brick=a,gate=g};dist=d end
                end
            end
        end
    end
    if nearest then
        local candidates={}
        for _,a in ipairs(b.bricks) do
            if a.active then
                for _,d in ipairs(M.directions) do
                    if M.can_place(b,a,a.x+d[1],a.z+d[2]) then
                        local old=b.history[a.id]
                        local reverse=old and old.dx==-d[1] and old.dz==-d[2] and b.turn-old.turn<3
                        if not reverse then
                            local score=math.abs(a.x-nearest.brick.x)+math.abs(a.z-nearest.brick.z)
                            if a==nearest.brick then score=score-10 end
                            candidates[#candidates+1]={brick=a,gate=nearest.gate,dx=d[1],dz=d[2],score=score}
                        end
                    end
                end
            end
        end
        table.sort(candidates,function(a,c)return a.score<c.score end)
        best=candidates[1]
        if best then b.turn=b.turn+1;b.history[best.brick.id]={dx=best.dx,dz=best.dz,turn=b.turn} end
    end
    return best
end
return M
