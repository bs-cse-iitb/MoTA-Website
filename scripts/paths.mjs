// Where documents and test evidence are written: docs/ in this repository.
// Set MOTA_DOCS_DIR to use another place.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DOCS = process.env.MOTA_DOCS_DIR ? path.resolve(process.env.MOTA_DOCS_DIR) : path.resolve(ROOT, 'docs');
export const EVIDENCE = path.join(DOCS, 'Evidence');
