// PWA: o'rnatish (Android/Chrome/Windows), iPhone ko'rsatmasi, service worker
import { t, modal, toast, esc } from './core.js';

let deferred = null;
export const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; document.dispatchEvent(new Event('pwa-can-install')); });
addEventListener('appinstalled', () => { deferred = null; toast(t('pwa.installed'), 'ok'); });

export const canInstall = () => !isStandalone() && (!!deferred || isIOS);

export async function installApp() {
  if (deferred) { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; return; }
  if (isIOS) {
    modal(`<h3>📱 ${esc(t('pwa.ios_title'))}</h3>
      <ol class="steps"><li>${t('pwa.ios_1')}</li><li>${t('pwa.ios_2')}</li><li>${t('pwa.ios_3')}</li></ol>
      <p class="muted small">${esc(t('pwa.ios_note'))}</p>`);
    return;
  }
  modal(`<h3>${esc(t('pwa.title'))}</h3><p>${esc(t('pwa.generic'))}</p>`);
}

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
