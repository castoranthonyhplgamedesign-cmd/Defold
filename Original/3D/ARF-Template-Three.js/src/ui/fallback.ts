import title from '../assets/ui/title.webp';
import play from '../assets/ui/play.webp';
export function showFallback(root:HTMLElement,install:()=>void) {
  root.replaceChildren();
  const screen=document.createElement('div');screen.className='fallback';
  const logo=document.createElement('img');logo.src=title;logo.alt='Arrow Flow';
  const message=document.createElement('p');message.textContent='Play Arrow Flow in the app.';
  const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Play Arrow Flow');
  const image=document.createElement('img');image.src=play;image.alt='Play Now';button.append(image);button.addEventListener('click',install);
  screen.append(logo,message,button);root.append(screen);
}
