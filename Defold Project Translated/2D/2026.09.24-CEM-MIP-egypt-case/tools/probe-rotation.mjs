import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.addInitScript(()=>window.open=()=>{});p.on('console',m=>{if(m.text().includes('ERROR'))console.log(m.text());});
await p.goto('http://127.0.0.1:8174/dist/?variant=2clicks');await p.waitForFunction(()=>window.__EGYPT_STATE__);console.log('BEFORE',await p.evaluate(()=>({state:__EGYPT_STATE__,w:Module.canvas.width,h:Module.canvas.height})));
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(500);await p.screenshot({path:'qa/evidence/rotation-probe.png'});
for(const x of [116.6667,286]){const s=390/1920;await p.mouse.click((844-1080*s)/2+x*s,1222.5*s,{delay:100});await p.waitForTimeout(500);console.log('CLICK',await p.evaluate(()=>({state:__EGYPT_STATE__,w:Module.canvas.width,h:Module.canvas.height,rect:Module.canvas.getBoundingClientRect().toJSON()})));}
await b.close();
