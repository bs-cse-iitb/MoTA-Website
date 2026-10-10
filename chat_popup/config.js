/* Where the chat assistant sends questions, chosen from where this page is served. Edit the
   table if the page is served from another address. A same-origin address works best: the
   chat service rejects cross-origin calls from tribal.gov.in. From this computer it accepts
   pages at http://127.0.0.1:5500 (checked 10 Oct 2026). Kept in its own file so the pages
   need no inline script (Content-Security-Policy). See README.md. */
(function () {
  var byHost = {
    'tribot.tribal.gov.in': '/api/v1/chat', // the chat service itself, serving /chat_popup/
    'tribal.gov.in': '/tribot-api/chat',     // the website: IIS forwards this path to the service
    'www.tribal.gov.in': '/tribot-api/chat'
  };
  var h = location.hostname;
  var local = h === 'localhost' || h === '127.0.0.1' || location.protocol === 'file:';
  var endpoint = byHost[h] ||
    (local && location.port === '8000' ? '/api/v1/chat' // the chat backend on this computer serves the page
      : local ? 'https://tribot.tribal.gov.in/api/v1/chat' // another local server (Live Server): the live service
      : '/tribot-api/chat');                             // any other portal: forward this path as the website does
  var el = document.querySelector('[data-tribot]');
  if (el) el.setAttribute('data-endpoint', endpoint);
})();
