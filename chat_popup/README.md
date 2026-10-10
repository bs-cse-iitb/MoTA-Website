# chat_popup: the chat assistant on a page of its own

The website's chat assistant, Jago, on a page of its own: `index.html` in English and
`hi/index.html` in Hindi. It is made from the component kit, so it looks and works like the
assistant on the website: the same design, wording, 11 answer languages, keyboard and
screen-reader support, and no fonts or icons from outside the folder. The chat service can
serve this folder at `/chat_popup/`; it is also the quickest way to test the service.

Until 10 Oct 2026 this folder held a copy of the chat service's own widget (its own HTML, CSS
and JavaScript). The read-aloud and thumbs-up/down buttons of that widget are not part of
the website's assistant, so they are not here. No API key is sent: the chat backend's code
does not check one.

## Files

| File | Made by | Contents |
|---|---|---|
| `index.html`, `hi/index.html` | `npm run chat:build` | The page and the assistant, from the kit templates (`packages/dbim-kit/templates/`) |
| `dbim.min.css`, `dbim.js`, `dbim-early.js`, `icons.svg`, `fonts/`, `assets/` | `npm run chat:build` | Copies of the kit's files (`packages/dbim-kit/dist/`) |
| `config.js` | Edited by hand | The address questions are sent to |
| `README.md` | Edited by hand | This file |

Do not edit the generated files. Change the website's assistant instead
(`src/data/assistant.ts`, `src/components/TriBot.astro`, `packages/dbim-kit/src/`) and
rebuild, as in [RUN.md](../RUN.md#chat-popup-page). The page text around the assistant and
the message shown when the service fails are in `scripts/build-chat-popup.mjs`.

## Which address it calls

`config.js` chooses the address from where the page is served:

| Page served from | Questions go to |
|---|---|
| `tribot.tribal.gov.in` (the chat service, at `/chat_popup/`) | `/api/v1/chat` on the same server |
| `tribal.gov.in` | `/tribot-api/chat`, which IIS forwards to the service ([DEPLOYMENT.md](../docs/DEPLOYMENT.md)) |
| This computer, port 8000 (the chat backend serving the page) | `/api/v1/chat` on the same server |
| This computer, any other port (for example Live Server on 5500) | `https://tribot.tribal.gov.in/api/v1/chat`, the live service |
| Anywhere else | `/tribot-api/chat`, to be forwarded to the service as the website does |

A same-origin address works best: the service rejects cross-origin calls from tribal.gov.in
(checked 6 and 10 Oct 2026). From this computer it accepts pages at `http://127.0.0.1:5500`
(10 Oct); pages at other addresses may be refused (the service's `FRONTEND_ORIGINS`
setting). To use a chat backend on this computer instead, change the local rule in
`config.js` to `http://127.0.0.1:8000/api/v1/chat`.

When the service cannot be reached, the assistant says so and links to the website's search.
