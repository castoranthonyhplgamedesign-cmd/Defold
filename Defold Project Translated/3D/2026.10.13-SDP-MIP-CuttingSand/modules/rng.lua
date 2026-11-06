local bit=require 'bit'
local M={}
local function mul(a,b)
 local al,bl=bit.band(a,65535),bit.band(b,65535)
 return bit.tobit(al*bl+bit.lshift(bit.band(bit.rshift(a,16)*bl+bit.rshift(b,16)*al,65535),16))
end
function M.new(seed)
 return function()
  seed=bit.tobit(seed+0x6d2b79f5)
  local t=mul(bit.bxor(seed,bit.rshift(seed,15)),bit.bor(seed,1))
  t=bit.bxor(t,bit.tobit(t+mul(bit.bxor(t,bit.rshift(t,7)),bit.bor(t,61))))
  t=bit.bxor(t,bit.rshift(t,14));if t<0 then t=t+4294967296 end
  return t/4294967296
 end
end
return M
