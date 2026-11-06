local M={}
function M.call(name,...)
 local args={...};local encoded={}
 for i=1,#args do encoded[i]=json.encode(args[i]) end
 return html5.run('window.PuzzleHost.'..name..'('..table.concat(encoded,',')..')')
end
function M.physics(commands,steps)
 local result=html5.run('window.PuzzlePhysics.run('..json.encode(commands)..','..(steps or 0)..')')
 return json.decode(result)
end
function M.prepare(g) return json.decode(html5.run('window.PuzzlePhysics.prepare('..json.encode(g)..')')) end
function M.random() return tonumber(html5.run('window.PuzzlePhysics.random()')) end
return M
