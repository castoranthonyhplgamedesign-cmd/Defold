-- Ad SDK access is isolated from gameplay. Local preview records CTA without navigation.
local M={started=false,ended=false,events={}}
local function js(code) if html5 then return html5.run(code) end end
function M.event(name)
    if M.events[name] then return end
    M.events[name]=true
    js("window.BBSBridge&&window.BBSBridge.event('"..name.."')")
    print("BBS_EVENT "..name)
end
function M.start()
    if M.started then return end
    M.started=true;js("window.BBSBridge&&window.BBSBridge.start()");M.event("CHALLENGE_STARTED")
end
function M.finish(win)
    if M.ended then return end
    M.ended=true;js("window.BBSBridge&&window.BBSBridge.end()")
    M.event(win and "CHALLENGE_SOLVED" or "LEVEL_FAILED");M.event("ENDCARD_SHOWN")
end
function M.cta()
    M.event("CTA_CLICKED");js("window.BBSBridge&&window.BBSBridge.cta()")
end
function M.config(name,default)
    if html5 then
        local value=js("window.BBSBridge?window.BBSBridge.config('"..name.."'):''")
        if value and value~="" then return value end
    end
    return sys.get_config_string("bbs."..name,default)
end
function M.state()
    if html5 then return js("window.BBSBridge?window.BBSBridge.state():'active'") end
    return "active"
end
function M.volume()
    if html5 then return math.max(0,math.min(1,tonumber(js("window.BBSBridge?window.BBSBridge.volume():1")) or 1)) end
    return 1
end
function M.snapshot(value)
    if html5 then js("window.__bbsState="..json.encode(value)) end
end
return M
