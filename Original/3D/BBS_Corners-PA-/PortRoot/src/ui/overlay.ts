export function getOverlayRoot(): HTMLElement {
  const overlay = document.getElementById('html-overlay');
  if (!overlay) throw new Error('Missing #html-overlay');
  return overlay;
}
