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
