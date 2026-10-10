// Static SVG tile for the decorative Warli band (used as a CSS mask).
import type { APIRoute } from 'astro';
import { bandTile } from '../../lib/warli';

export const GET: APIRoute = () =>
  new Response(bandTile(), { headers: { 'Content-Type': 'image/svg+xml' } });
