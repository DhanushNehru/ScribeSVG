import type { RenderOptions } from './renderer';

// URLSearchParams has already decoded percent escapes before these helpers run.
export function parseColor(val: string | null): string {
  if (!val) return '';
  const color = val.trim();
  if (color.toLowerCase() === 'transparent') return 'transparent';
  return /^[0-9a-fA-F]{3,8}$/.test(color) ? `#${color}` : color;
}

export function parseNum(
  searchParams: URLSearchParams,
  key: string,
  fallback?: number,
): number | undefined {
  const val = searchParams.get(key);
  if (val === null) return fallback;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseBool(
  searchParams: URLSearchParams,
  key: string,
  fallback: boolean,
): boolean {
  const val = searchParams.get(key);
  if (val === null) return fallback;
  return val.toLowerCase() === 'true' || val === '1';
}

export function parseRenderParams(searchParams: URLSearchParams): Partial<RenderOptions> {
  const linesParam = searchParams.get('lines');
  const lines = linesParam ? linesParam.split(';').filter(Boolean) : undefined;

  const gradientParam = searchParams.get('gradient');
  const gradient = gradientParam ? gradientParam.split(',').map(parseColor).filter(Boolean) : undefined;

  const font = searchParams.get('font') || undefined;
  const color = parseColor(searchParams.get('color'));
  const background = parseColor(searchParams.get('background'));
  const cursorColor = parseColor(searchParams.get('cursorColor'));

  const cursorParam = searchParams.get('cursor');
  const cursor = (['pipe', 'block', 'underscore', 'none'] as const).find(
    value => value === cursorParam,
  );

  const layoutParam = searchParams.get('layout');
  const layout = (['raw', 'terminal', 'card'] as const).find(
    value => value === layoutParam,
  );

  const theme = searchParams.get('theme') || undefined;

  return {
    ...(lines ? { lines } : {}),
    width: parseNum(searchParams, 'width', 600),
    height: parseNum(searchParams, 'height', 120),
    ...(font ? { font } : {}),
    size: parseNum(searchParams, 'size', 24),
    weight: parseNum(searchParams, 'weight', 400),
    letterSpacing: parseNum(searchParams, 'letterSpacing', 0),
    ...(color ? { color } : {}),
    ...(gradient ? { gradient } : {}),
    gradientAngle: parseNum(searchParams, 'gradientAngle', 90),
    ...(background ? { background } : {}),
    speed: parseNum(searchParams, 'speed', 100),
    deleteSpeed: parseNum(searchParams, 'deleteSpeed', 50),
    pause: parseNum(searchParams, 'pause', 1500),
    ...(cursor ? { cursor } : {}),
    ...(cursorColor ? { cursorColor } : {}),
    cursorGlow: parseNum(searchParams, 'cursorGlow', 0),
    textGlow: parseNum(searchParams, 'textGlow', 0),
    hCenter: parseBool(searchParams, 'hCenter', false) || parseBool(searchParams, 'center', false),
    vCenter: parseBool(searchParams, 'vCenter', true),
    loop: parseBool(searchParams, 'loop', true),
    ...(layout ? { layout } : {}),
    ...(theme ? { theme } : {}),
    attribution: parseBool(searchParams, 'attribution', true),
  };
}
