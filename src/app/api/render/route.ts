// Next.js API Edge Route Handler for serving SVG typing animations.
import { NextRequest } from 'next/server';
import { renderSVG } from './renderer';

export const runtime = 'edge';

// Helper to sanitize and format hex colors from URL parameters
function parseColor(val: string | null): string {
  if (!val) return '';
  const decoded = decodeURIComponent(val).trim();
  if (decoded.toLowerCase() === 'transparent') return 'transparent';
  // If it matches a hex format without '#', prepend '#'
  if (/^[0-9a-fA-F]{3,8}$/.test(decoded)) {
    return `#${decoded}`;
  }
  return decoded;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse lines: split by semicolon
  const linesParam = searchParams.get('lines');
  let lines: string[] | undefined;
  if (linesParam) {
    lines = linesParam.split(';').map(l => decodeURIComponent(l)).filter(Boolean);
  }

  // Parse gradient: comma-separated list of colors
  const gradientParam = searchParams.get('gradient');
  let gradient: string[] | undefined;
  if (gradientParam) {
    gradient = gradientParam.split(',').map(c => parseColor(c)).filter(Boolean);
  }

  // Helper to parse numeric options with fallbacks
  const parseNum = (key: string, fallback?: number): number | undefined => {
    const val = searchParams.get(key);
    if (val === null) return fallback;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Helper to parse boolean options (e.g. center=true or center=1)
  const parseBool = (key: string, fallback: boolean): boolean => {
    const val = searchParams.get(key);
    if (val === null) return fallback;
    return val.toLowerCase() === 'true' || val === '1';
  };

  const width = parseNum('width', 600);
  const height = parseNum('height', 120);
  const font = searchParams.get('font') || undefined;
  const size = parseNum('size', 24);
  const weight = parseNum('weight', 400);
  const letterSpacing = parseNum('letterSpacing', 0);
  const color = parseColor(searchParams.get('color'));
  const gradientAngle = parseNum('gradientAngle', 90);
  const background = parseColor(searchParams.get('background'));
  const speed = parseNum('speed', 100);
  const deleteSpeed = parseNum('deleteSpeed', 50);
  const pause = parseNum('pause', 1500);
  
  const cursorParam = searchParams.get('cursor');
  let cursor: 'pipe' | 'block' | 'underscore' | 'none' | undefined;
  if (cursorParam && ['pipe', 'block', 'underscore', 'none'].includes(cursorParam)) {
    cursor = cursorParam as any;
  }

  const cursorColor = parseColor(searchParams.get('cursorColor'));
  const cursorGlow = parseNum('cursorGlow', 0);
  const textGlow = parseNum('textGlow', 0);
  
  const hCenter = parseBool('hCenter', false) || parseBool('center', false); // supports both names
  const vCenter = parseBool('vCenter', true);
  const loop = parseBool('loop', true);
  
  const layoutParam = searchParams.get('layout');
  let layout: 'raw' | 'terminal' | 'card' | undefined;
  if (layoutParam && ['raw', 'terminal', 'card'].includes(layoutParam)) {
    layout = layoutParam as any;
  }
  
  const theme = searchParams.get('theme') || undefined;
  const attribution = parseBool('attribution', true);

  try {
    const svg = await renderSVG({
      ...(lines ? { lines } : {}),
      width,
      height,
      font,
      size,
      weight,
      letterSpacing,
      ...(color ? { color } : {}),
      ...(gradient ? { gradient } : {}),
      gradientAngle,
      ...(background ? { background } : {}),
      speed,
      deleteSpeed,
      pause,
      ...(cursor ? { cursor } : {}),
      ...(cursorColor ? { cursorColor } : {}),
      cursorGlow,
      textGlow,
      hCenter,
      vCenter,
      loop,
      ...(layout ? { layout } : {}),
      ...(theme ? { theme } : {}),
      attribution
    });

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
