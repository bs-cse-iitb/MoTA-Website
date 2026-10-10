// Local stand-in for the TriBot chat service, for tests only. It answers POST /chat in the
// formats the real service (tribot.tribal.gov.in/api/v1/chat) returned in Oct 2026, so the
// assistant can be tested without calling production. The answers are fixed test text,
// not Ministry information.
//
//   node tests/mocks/tribot-service.mjs [port]      # default 4399
//
// GET /__requests returns the request bodies received, so tests can check what was sent.

import http from 'node:http';
import { pathToFileURL } from 'node:url';

export function startMockTribot(port = 4399) {
  const requests = [];
  let turn = 0;
  const server = http.createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.method === 'GET' && req.url === '/__requests') return send(200, requests);
    if (req.method !== 'POST' || req.url !== '/chat') return send(404, { detail: 'Not Found' });
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let body;
    try { body = JSON.parse(raw); } catch { return send(400, { detail: 'bad json' }); }
    requests.push(body);
    const q = String(body.query || '');
    if (/fail/i.test(q)) return send(500, { detail: 'test failure' });
    turn += 1;
    const base = { items: [], table_headers: [], table_rows: [], actions: [], confidence_level: 'high', session_id: body.session_id || 'test-session-1', turn_number: turn, lang: body.language || 'eng' };
    const sources = [{ filename: 'Unknown', page: 1, section: 'general' }, { filename: 'Test guidelines.pdf', page: 3, section: 'general' }];
    if (/list/i.test(q)) return send(200, { ...base, response_type: 'bullet_list', answer: 'Test list answer:', items: ['First test item', 'Second test item with www.example.gov.in'], sources });
    if (/table/i.test(q)) return send(200, { ...base, response_type: 'table', answer: 'Test table answer:', table_headers: ['Scheme', 'Year'], table_rows: [['Test scheme A', '2025-26'], ['Test scheme B', '2026-27']], sources: [] });
    if (body.language === 'hin') return send(200, { ...base, response_type: 'plain_text', answer: 'यह **परीक्षण** उत्तर है।', sources: [] });
    // Echoes the question, so a test can check that markup in it is shown as text.
    return send(200, { ...base, response_type: 'plain_text', answer: `Test answer to: ${q}\n\nSee **bold text** and https://www.example.gov.in/page.\n- point one\n- point two`, actions: [{ label: 'Ask a follow-up' }], sources });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, requests, url: `http://127.0.0.1:${port}` })));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await startMockTribot(Number(process.argv[2]) || 4399);
  console.log(`Mock TriBot service: ${url}/chat`);
}
