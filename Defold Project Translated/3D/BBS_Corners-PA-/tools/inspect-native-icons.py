"""Inspect icon resources without launching or modifying a Windows executable."""
from pathlib import Path
import struct
import hashlib
import sys

data = Path(sys.argv[1]).read_bytes()
u16 = lambda off: struct.unpack_from('<H', data, off)[0]
u32 = lambda off: struct.unpack_from('<I', data, off)[0]
pe = u32(0x3c)
opt = pe + 24
directories = opt + (112 if u16(opt) == 0x20b else 96)
section_start = opt + u16(pe + 20)
sections = [section_start + i * 40 for i in range(u16(pe + 6))]
def offset(rva):
    for s in sections:
        start, size, raw = u32(s + 12), max(u32(s + 8), u32(s + 16)), u32(s + 20)
        if start <= rva < start + size:
            return raw + rva - start
    raise ValueError('Invalid RVA')
base = offset(u32(directories + 16))
def walk(relative=0, kind=None):
    directory = base + relative
    for i in range(u16(directory + 12) + u16(directory + 14)):
        entry = directory + 16 + i * 8
        name, target = u32(entry), u32(entry + 4)
        resource_kind = name if kind is None else kind
        if target & 0x80000000:
            walk(target & 0x7fffffff, resource_kind)
        elif resource_kind == 3:
            desc = base + target
            blob = data[offset(u32(desc)):offset(u32(desc)) + u32(desc + 4)]
            if blob[:8] == b'\x89PNG\r\n\x1a\n':
                w, h = struct.unpack_from('>II', blob, 16)
                depth, encoding = 32, 'PNG'
            else:
                w, h = struct.unpack_from('<ii', blob, 4)
                h //= 2
                depth = struct.unpack_from('<H', blob, 14)[0]
                encoding = 'DIB'
            print(f'{w}x{h} {depth}bit {encoding} {hashlib.sha256(blob).hexdigest()}')
walk()
