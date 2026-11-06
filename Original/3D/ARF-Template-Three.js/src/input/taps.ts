interface GestureAudio {start(token:number,action:()=>void):void;move(token:number):void;release(token:number,action:()=>void):void;cancel(token:number):void}
export function bindTaps(element: HTMLElement, pick: (x: number, y: number) => number | null, press: (id: number, token:number) => void, audio?:GestureAudio) {
  const gestures = new Map<number, number>();
  let nextToken=0;
  const controller = new AbortController(), options = { capture: true, passive: false, signal: controller.signal };
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const touch = (mobile && 'ontouchstart' in window) || !('PointerEvent' in window);
  function start(id: number, x: number, y: number) {
    if(document.hidden||gestures.has(id))return;
    const arrow=pick(x,y);if(arrow===null)return;
    const token=++nextToken;gestures.set(id,token);
    const action=()=>press(arrow,token);
    if(audio)audio.start(token,action);else action();
  }
  function move(id: number) {
    const token=gestures.get(id);if(token!==undefined)audio?.move(token);
  }
  function end(id: number) {
    const token=gestures.get(id);if(token!==undefined)audio?.release(token,()=>{});
    gestures.delete(id);
  }
  function cancelOne(id:number) {const token=gestures.get(id);if(token!==undefined)audio?.cancel(token);gestures.delete(id);}
  if (touch) {
    element.addEventListener('touchstart', event => { event.preventDefault(); for (const t of Array.from(event.changedTouches)) if(t.target===element || (t.target instanceof Node && element.contains(t.target))) start(t.identifier, t.clientX, t.clientY); }, options);
    window.addEventListener('touchmove', event => { for (const t of Array.from(event.changedTouches)) move(t.identifier); }, options);
    window.addEventListener('touchend', event => { for (const t of Array.from(event.changedTouches)) end(t.identifier); }, options);
    window.addEventListener('touchcancel', event => { for (const t of Array.from(event.changedTouches)) cancelOne(t.identifier); }, options);
  } else {
    element.addEventListener('pointerdown', event => {
      if (event.button !== 0) return; event.preventDefault(); start(event.pointerId, event.clientX, event.clientY);
      element.setPointerCapture(event.pointerId);
    }, options);
    window.addEventListener('pointermove', event => move(event.pointerId), options);
    window.addEventListener('pointerup', event => end(event.pointerId), options);
    window.addEventListener('pointercancel', event => cancelOne(event.pointerId), options);
    element.addEventListener('lostpointercapture', event => cancelOne(event.pointerId), options);
  }
  const cancel = () => {for(const id of gestures.keys())cancelOne(id);};
  window.addEventListener('blur', cancel, options);
  document.addEventListener('visibilitychange', cancel, options);
  window.addEventListener('resize', cancel, options);
  element.addEventListener('webglcontextlost',cancel,options);
  return () => { cancel(); controller.abort(); };
}
