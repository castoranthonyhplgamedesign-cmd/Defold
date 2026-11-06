local M = {}
local cy,sy = 16/math.sqrt(288.49),5.7/math.sqrt(288.49)
function M.calculate(w,h)
    local short = math.min(w,h)
    local footer = short*(w<h and 98/390 or 72/390)
    local header = short*(w<h and 93/390 or 46/390)
    local available = math.max(1,h-footer-header)
    local ppu = math.min(w/8.1,available/12.9)
    local halfw,halfh = w/ppu/2,available/ppu/2
    local target = vmath.vector3(0,0,-1.0)
    return {w=w,h=h,ppu=ppu,footer=footer,header=header,available=available,
        view=vmath.matrix4_look_at(target+vmath.vector3(0,16,5.7),target,vmath.vector3(0,1,0)),
        projection=vmath.matrix4_orthographic(-halfw,halfw,-halfh,halfh,0.1,100)}
end
function M.project(v,x,z,y)
    return v.w/2+x*v.ppu,v.footer+v.available/2+((z-1.0)*cy+(y or 0)*sy)*v.ppu
end
function M.unproject(v,x,y,height)
    return (x-v.w/2)/v.ppu,1.0+((y-v.footer-v.available/2)/v.ppu-(height or 0)*sy)/cy
end
return M
