local M={}
function M.call(method,value)
    if html5 then return html5.run('window.CoinHost&&window.CoinHost.'..method..'('..(value~=nil and json.encode(value) or '')..')')end
end
function M.event(name)M.call('event',name)end
function M.life(name)M.call('life',name)end
function M.paused()return M.call('paused')=='true'end
function M.muted()return M.call('muted')=='true'end
function M.cta()M.event('CTA_CLICKED');M.life('gameClose');M.call('cta')end
return M
