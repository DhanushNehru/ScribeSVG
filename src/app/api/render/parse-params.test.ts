import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseBool, parseColor, parseNum, parseRenderParams } from './parse-params';

test('parseNum uses the fallback for absent, invalid, and non-finite values', () => {
  assert.equal(parseNum(new URLSearchParams(), 'speed', 100), 100);
  assert.equal(parseNum(new URLSearchParams('speed=abc'), 'speed', 100), 100);
  assert.equal(parseNum(new URLSearchParams('speed=Infinity'), 'speed', 100), 100);
  assert.equal(parseNum(new URLSearchParams('speed=0'), 'speed', 100), 0);
  assert.equal(parseNum(new URLSearchParams('speed=12.5'), 'speed', 100), 12.5);
});

test('parseBool accepts true and 1 case-insensitively and preserves the fallback', () => {
  assert.equal(parseBool(new URLSearchParams(), 'loop', true), true);
  assert.equal(parseBool(new URLSearchParams('loop=TRUE'), 'loop', false), true);
  assert.equal(parseBool(new URLSearchParams('loop=1'), 'loop', false), true);
  assert.equal(parseBool(new URLSearchParams('loop=false'), 'loop', true), false);
});

test('parseColor handles decoded hashes, bare hex colors, and transparency', () => {
  assert.equal(parseColor(new URLSearchParams('color=%23aBc').get('color')), '#aBc');
  assert.equal(parseColor('ff00aa'), '#ff00aa');
  assert.equal(parseColor('  TRANSPARENT  '), 'transparent');
  assert.equal(parseColor(null), '');
});

test('empty lines use the default while an explicit empty gradient stays explicit', () => {
  const options = parseRenderParams(new URLSearchParams('lines=&gradient=,&theme=dracula'));

  assert.equal('lines' in options, false);
  assert.deepEqual(options.gradient, []);
  assert.equal(options.theme, 'dracula');
  assert.deepEqual(parseRenderParams(new URLSearchParams('lines=;')).lines, []);
});

test('lines and gradient omit empty entries and keep percent signs literal', () => {
  const options = parseRenderParams(
    new URLSearchParams('lines=one;;%25&gradient=ff0000,,%23fff'),
  );

  assert.deepEqual(options.lines, ['one', '%']);
  assert.deepEqual(options.gradient, ['#ff0000', '#fff']);
});

test('render options retain defaults, aliases, and only valid enumerations', () => {
  const options = parseRenderParams(
    new URLSearchParams('speed=abc&center=true&hCenter=false&vCenter=false&cursor=invalid&layout=card&color=%23abc'),
  );

  assert.equal(options.speed, 100);
  assert.equal(options.hCenter, true);
  assert.equal(options.vCenter, false);
  assert.equal('cursor' in options, false);
  assert.equal(options.layout, 'card');
  assert.equal(options.color, '#abc');
  assert.equal(options.width, 600);
  assert.equal(options.attribution, true);
});

test('render options pass through supported numeric, color, and display settings', () => {
  const options = parseRenderParams(new URLSearchParams(
    'width=320&height=80&font=Arial&size=20&weight=700&letterSpacing=2' +
    '&gradientAngle=45&background=000000&deleteSpeed=25&pause=500' +
    '&cursor=block&cursorColor=%23fff&cursorGlow=3&textGlow=2' +
    '&loop=false&attribution=false',
  ));

  assert.deepEqual(options, {
    width: 320,
    height: 80,
    font: 'Arial',
    size: 20,
    weight: 700,
    letterSpacing: 2,
    gradientAngle: 45,
    background: '#000000',
    speed: 100,
    deleteSpeed: 25,
    pause: 500,
    cursor: 'block',
    cursorColor: '#fff',
    cursorGlow: 3,
    textGlow: 2,
    hCenter: false,
    vCenter: true,
    loop: false,
    attribution: false,
  });
});
