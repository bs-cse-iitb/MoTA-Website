// Page tools (DBIM 5.5 inner page): print and share buttons.
import { toast } from './dialogs';

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
document.querySelector<HTMLButtonElement>('[data-share]')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget as HTMLButtonElement;
  const url = btn.dataset.share || location.href;
  try {
    if (navigator.share) await navigator.share({ title: document.title, url });
    else { await navigator.clipboard.writeText(url); toast(btn.dataset.copied || 'Link copied'); }
  } catch { /* cancelled */ }
});
