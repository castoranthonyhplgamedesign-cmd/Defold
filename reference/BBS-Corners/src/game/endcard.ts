import { trackEvent } from '../analytics';
import { ASSETS } from '../assets';
import { notifyGameEnd, triggerCTA } from '../networks';

export class EndCardController {
  private readonly element: HTMLDivElement;
  private readonly overlayRoot: HTMLElement;
  private lastCtaInputAt = 0;

  constructor(overlayRoot: HTMLElement) {
    this.overlayRoot = overlayRoot;
    this.element = document.createElement('div');
    this.element.className = 'endcard';
    this.element.innerHTML = `<div class="endcard__panel">
      <img class="endcard__app-icon" src="${ASSETS.ui.appIcon}" alt="" draggable="false" />
      <button class="endcard__cta" type="button" aria-label="Play Now">
        <img class="endcard__cta-image" src="${ASSETS.ui.playNow}" alt="" draggable="false" />
      </button>
    </div>`;
    const handleCtaInput = (event: PointerEvent | TouchEvent) => {
      if (!this.element.classList.contains('is-visible')) return;
      event.preventDefault();
      const now = performance.now();
      if (now - this.lastCtaInputAt < 350) return;

      this.lastCtaInputAt = now;
      trackEvent('CTA_CLICKED');
      triggerCTA();
    };
    this.element.addEventListener('pointerup', handleCtaInput);
    this.element.addEventListener('touchend', handleCtaInput);
    overlayRoot.appendChild(this.element);
  }

  show(isWin: boolean): void {
    if (this.isVisible()) return;

    notifyGameEnd();
    trackEvent(isWin ? 'CHALLENGE_SOLVED' : 'LEVEL_FAILED');
    trackEvent('ENDCARD_SHOWN');
    this.overlayRoot.classList.add('has-endcard');
    for (const target of this.overlayRoot.querySelectorAll<HTMLElement>('.footer-app-icon, .footer-cta')) {
      target.inert = true;
      target.setAttribute('aria-hidden', 'true');
    }
    this.element.classList.add('is-visible');
  }

  isVisible(): boolean {
    return this.element.classList.contains('is-visible');
  }
}
