// Time-limited items, e.g. the STQC certificate link in the footer.
// Markup: <p data-valid-till="2027-02-12">…</p> (ISO date, valid until the end of that
// day in India Standard Time). A static page cannot change after it is built, so this
// hides an item whose date has passed until the next build leaves it out.
const today = new Date();
document.querySelectorAll<HTMLElement>('[data-valid-till]').forEach((el) => {
  const till = new Date(`${el.dataset.validTill}T23:59:59+05:30`);
  if (Number.isNaN(till.getTime()) || till < today) el.hidden = true;
});

// Module scope: keeps this file's names from clashing with the other kit scripts.
export {};
