import type { RenderOptions } from './renderer';

export class RenderParameterError extends Error {}

function parseClampedNum(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = parseNum(searchParams, key, fallback) ?? fallback;
  return Math.min(max, Math.max(min, value));
}

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
  if (linesParam && linesParam.length > 2048) {
    throw new RenderParameterError('lines parameter is too long');
  }
  const lines = linesParam ? linesParam.split(';').filter(Boolean) : undefined;
  if (lines && lines.length > 10) {
    throw new RenderParameterError('lines cannot contain more than 10 entries');
  }
  let totalChars = 0;
  for (const line of lines ?? []) {
    let lineChars = 0;
    for (let index = 0; index < line.length; index++) {
      if (line.codePointAt(index)! > 0xFFFF) index++;
      lineChars++;
    }
    if (lineChars > 200) {
      throw new RenderParameterError('Each line must be at most 200 characters');
    }
    totalChars += lineChars;
  }
  if (totalChars > 1000) {
    throw new RenderParameterError('Total lines text must be at most 1000 characters');
  }

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
  if (cursorParam !== null && !cursor) {
    throw new RenderParameterError('Invalid cursor parameter');
  }

  const layoutParam = searchParams.get('layout');
  const layout = (['raw', 'terminal', 'card', 'minimal-border'] as const).find(
    value => value === layoutParam,
  );
  if (layoutParam !== null && !layout) {
    throw new RenderParameterError('Invalid layout parameter');
  }

  const theme = searchParams.get('theme') || undefined;

  return {
    ...(lines ? { lines } : {}),
    width: parseClampedNum(searchParams, 'width', 600, 100, 2000),
    height: parseClampedNum(searchParams, 'height', 120, 40, 1000),
    ...(font ? { font } : {}),
    size: parseClampedNum(searchParams, 'size', 24, 12, 120),
    weight: parseNum(searchParams, 'weight', 400),
    letterSpacing: parseNum(searchParams, 'letterSpacing', 0),
    ...(color ? { color } : {}),
    ...(gradient ? { gradient } : {}),
    gradientAngle: parseNum(searchParams, 'gradientAngle', 90),
    ...(background ? { background } : {}),
    speed: parseClampedNum(searchParams, 'speed', 100, 10, 1000),
    deleteSpeed: parseClampedNum(searchParams, 'deleteSpeed', 50, 10, 1000),
    pause: parseClampedNum(searchParams, 'pause', 1500, 0, 10000),
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
