// Next.js API Edge Route Handler for serving SVG typing animations.
import { NextRequest } from 'next/server';
import { parseRenderParams } from './parse-params';
import { renderSVG } from './renderer';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const svg = await renderSVG(parseRenderParams(searchParams));

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Render error:', error);
    // Return a basic fallback SVG indicating error
    const errorSvg = `<?xml version="1.0" encoding="utf-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="80" fill="none">
      <rect width="600" height="80" fill="#1a1a24" rx="6" />
      <text x="30" y="45" fill="#ff5555" font-family="monospace" font-size="16">Error generating typing SVG</text>
    </svg>`;
    return new Response(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
