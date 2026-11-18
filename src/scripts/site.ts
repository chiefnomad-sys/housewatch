// Sharing and signup. No tracking, no third-party scripts.
const toastEl = document.getElementById('toast');
let toastTimer: number | undefined;
function toast(msg: string) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toastEl.hidden = true), 2400);
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Link copied');
  } catch {
    window.prompt('Copy this link', text);
  }
}

let lastFocus: HTMLElement | null = null;
function closeSheet() {
  document.querySelectorAll('.sheet, .scrim').forEach((el) => el.remove());
  lastFocus?.focus();
}
function openSheet(title: string, inner: string) {
  closeSheet();
  lastFocus = document.activeElement as HTMLElement;
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.addEventListener('click', closeSheet);
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', title);
  sheet.innerHTML = `<div class="head"><h2>${title}</h2><button type="button" data-close>Done</button></div>${inner}`;
  sheet.querySelector('[data-close]')?.addEventListener('click', closeSheet);
  document.body.append(scrim, sheet);
  (sheet.querySelector('[data-close]') as HTMLElement)?.focus();
  return sheet;
}
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeSheet());

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Share with the crew: the phone's own share sheet, or a fallback with copy, text and email.
document.querySelectorAll<HTMLElement>('[data-share]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    const url = btn.dataset.url || location.href;
    const title = btn.dataset.title || document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    const body = encodeURIComponent(`${title} ${url}`);
    const sheet = openSheet(
      'Share with the crew',
      `<div class="opts">
        <button type="button" data-copy><svg class="i"><use href="#i-copy"/></svg>Copy link</button>
        <a href="sms:?&body=${body}"><svg class="i"><use href="#i-chat"/></svg>Text it</a>
        <a href="mailto:?subject=${encodeURIComponent(title)}&body=${body}"><svg class="i"><use href="#i-mail"/></svg>Email it</a>
      </div>`
    );
    sheet.querySelector('[data-copy]')?.addEventListener('click', () => copy(url));
  })
);

// Share as card: the story's 4:5 card image, shared as a file where the phone allows it.
document.querySelectorAll<HTMLElement>('[data-card]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const src = btn.dataset.card!;
    const name = btn.dataset.file || 'housewatch-card.png';
    const title = btn.dataset.title || document.title;
    const url = btn.dataset.url || location.href;
    const sheet = openSheet(
      'Share as card',
      `<img class="card-img" src="${esc(src)}" alt="Story card: ${esc(title)}" width="1080" height="1350">
       <div class="opts">
         <button type="button" data-send><svg class="i"><use href="#i-share"/></svg>Share the card</button>
         <a href="${esc(src)}" download="${esc(name)}"><svg class="i"><use href="#i-down"/></svg>Save image</a>
       </div>
       <p class="hint">For Instagram, save the image, then post it from the app.</p>`
    );
    sheet.querySelector('[data-send]')?.addEventListener('click', async () => {
      try {
        const blob = await (await fetch(src)).blob();
        const file = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title, text: `${title} ${url}` });
          return;
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
      toast('Saving the image instead');
      const a = document.createElement('a');
      a.href = src;
      a.download = name;
      a.click();
    });
  })
);

// Housewatch Daily signup, posted to Netlify Forms without leaving the page.
document.querySelectorAll<HTMLFormElement>('form[data-signup]').forEach((form) =>
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fine = form.parentElement?.querySelector<HTMLElement>('[data-fine]');
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const email = form.querySelector<HTMLInputElement>('input[type="email"]');
    if (!email?.value || !email.checkValidity()) {
      if (fine) { fine.textContent = 'Check that email address.'; fine.className = 'fine err'; }
      email?.focus();
      return;
    }
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      if (fine) { fine.textContent = "You're on the list. First one lands tomorrow morning."; fine.className = 'fine ok'; }
    } catch {
      if (fine) { fine.textContent = "That didn't go through. Try again in a minute."; fine.className = 'fine err'; }
    } finally {
      if (btn) btn.disabled = false;
    }
  })
);

// Add to home screen. Android and desktop Chrome fire beforeinstallprompt, which we hold
// and replay from our own Add button. iPhone Safari can't prompt, so it gets the Share hint.
(() => {
  const box = document.getElementById('a2hs');
  if (!box) return;
  const KEY = 'hw-a2hs';
  const store = {
    get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const mobile = ios || /android|mobile/i.test(ua);
  const installed = matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  const addBtn = box.querySelector<HTMLButtonElement>('[data-a2hs-add]')!;
  const androidText = box.querySelector<HTMLElement>('[data-a2hs-android]')!;
  const iosText = box.querySelector<HTMLElement>('[data-a2hs-ios]')!;
  let deferred: (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null = null;

  const show = (force = false) => {
    if (installed) { if (force) toast('Housewatch is already on your home screen.'); return; }
    const iosMode = ios || (!deferred && force);
    iosText.hidden = !iosMode;
    androidText.hidden = iosMode;
    addBtn.hidden = !deferred;
    box.hidden = false;
  };
  const hide = (remember: boolean) => {
    box.hidden = true;
    if (remember) store.set(KEY, 'dismissed');
  };

  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as typeof deferred;
    if (!box.hidden) addBtn.hidden = false;
  });
  addEventListener('appinstalled', () => { hide(true); deferred = null; });

  addBtn.addEventListener('click', async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    deferred = null;
    hide(true);
  });
  box.querySelector('[data-a2hs-close]')?.addEventListener('click', () => hide(true));

  // Footer link and the #homescreen link always open it, even after a dismissal.
  document.querySelectorAll('[data-a2hs-open]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); show(true); })
  );
  if (location.hash === '#homescreen') { show(true); return; }

  // Otherwise, once per reader: phones only, on their second page or after 25 seconds.
  if (!mobile || installed || store.get(KEY)) return;
  const views = Number(store.get('hw-views') || '0') + 1;
  store.set('hw-views', String(views));
  const ready = () => { if (!store.get(KEY) && box.hidden) show(); };
  if (views >= 2) setTimeout(ready, 4000);
  else setTimeout(ready, 25000);
})();

// Service worker: a short offline notice for home screen readers. Real site only.
const swUrl = document.documentElement.dataset.sw;
if (swUrl && 'serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register(swUrl).catch(() => {}));
}
