package.path="./?.lua;"..package.path
local Board=require "main.board"
local b=Board.new()
assert(#b.bricks==56 and #b.gates==9 and b.remaining==56,"reference counts")
local slots=0
for z=-4,7 do for x=-3,3 do if Board.slot(x,z) then slots=slots+1 end end end
assert(slots==63,"U board has exactly 63 valid cells")
assert(not Board.slot(0,0) and not Board.slot(4,0),"hole and bounds")
assert(not Board.move(b,b.bricks[1],-2,-4),"occupied move rejected")
assert(not Board.move(b,b.bricks[1],-3,-2),"tunneling rejected")
local function consistent()
    local occupied={}
    for _,a in ipairs(b.bricks) do
        if a.active then for dz=0,a.length-1 do
            local k=a.x..","..(a.z+dz)
            assert(Board.slot(a.x,a.z+dz),"brick stays in board")
            assert(not occupied[k],"no overlap")
            occupied[k]=a.id
            assert(b.occupancy[k]==a.id,"occupancy matches brick")
        end end
    end
    for k,id in pairs(b.occupancy) do assert(occupied[k]==id,"no stale occupancy") end
end
local moves,removed=0,0
while b.remaining>0 do
    local h=Board.hint(b)
    assert(h and h.route,"a legal route exists at step "..removed)
    local a=h.brick
    for _,p in ipairs(h.route) do assert(Board.move(b,a,p.x,p.z));moves=moves+1;consistent() end
    if not h.blocker then
        assert(Board.gate(b,a,a.x,a.z),"route finishes at matching exit")
        assert(Board.remove(b,a));assert(not Board.remove(b,a),"removal is idempotent")
        removed=removed+1;consistent()
    end
    assert(moves<2000,"solver converges")
end
assert(removed==56 and next(b.occupancy)==nil,"all bricks cleared")
print("PASS: 63 slots, 56 bricks, 9 exits; occupancy, collision, bounds, idempotence, full-clear route ("..moves.." moves).")
