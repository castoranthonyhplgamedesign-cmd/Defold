import './styles.css';
import { getPlayableTitle } from './constants';
import { createBabylonRuntime } from './engine/createEngine';
import { bindResponsiveResize } from './engine/resize';
import { GameApp } from './game/app';
import { bindLifecycle, initMraid, installLifecycleStubs, notifyGameReady } from './networks';

async function boot(): Promise<void> {
  document.title = getPlayableTitle();
  installLifecycleStubs();
  await initMraid();

  const appRoot = document.getElementById('app');
  if (!appRoot) throw new Error('Missing #app root');

  const runtime = createBabylonRuntime(appRoot);
  const game = new GameApp(runtime);
  bindResponsiveResize(runtime, () => game.relayout());
  let lifecyclePaused = false;
  let hasRenderedOnce = false;
  bindLifecycle((paused) => {
    lifecyclePaused = paused;
    if (!paused) {
      runtime.engine.resize();
      game.relayout();
    }
  });

  game.start();
  await runtime.scene.whenReadyAsync();
  runtime.scene.onAfterRenderObservable.addOnce(() => {
    notifyGameReady();
  });

  runtime.engine.runRenderLoop(() => {
    if (lifecyclePaused && hasRenderedOnce) return;

    game.update();
    runtime.scene.render();
    hasRenderedOnce = true;
  });

  window.addEventListener('beforeunload', () => {
    game.dispose();
    runtime.engine.dispose();
  });
}

function showBootError(error: unknown): void {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const appRoot = document.getElementById('app') ?? document.body;
  const errorElement = document.createElement('pre');
  errorElement.className = 'boot-error';
  errorElement.textContent = `Boot failed\n${message}`;
  appRoot.appendChild(errorElement);
  throw error;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void boot().catch(showBootError), { once: true });
} else {
  void boot().catch(showBootError);
}
