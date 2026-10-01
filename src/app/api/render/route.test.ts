import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { GET } from './route';

test('renders a literal percent sign in lines without decoding it twice', async () => {
  const request = new NextRequest('https://example.com/api/render?lines=%25&font=Arial');

  const response = await GET(request);

  assert.equal(response.status, 200);
  assert.match(await response.text(), />%<\/text>/);
});

test('returns a short uncached 400 response before rendering invalid parameters', async () => {
  const request = new NextRequest('https://example.com/api/render?layout=unknown&font=Arial');

  const response = await GET(request);

  assert.equal(response.status, 400);
  assert.match(response.headers.get('Content-Type') ?? '', /^text\/plain/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(await response.text(), /layout/i);
});

test('rejects an oversized URL before parsing or rendering it', async () => {
  const request = new NextRequest(`https://example.com/api/render?lines=${'x'.repeat(8200)}`);

  const response = await GET(request);

  assert.equal(response.status, 400);
  assert.match(await response.text(), /long/i);
});

test('renders user text as SVG text rather than markup', async () => {
  const request = new NextRequest('https://example.com/api/render?lines=%3Cscript%3E%26%22&font=Arial');

  const response = await GET(request);
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, />&lt;script&gt;&amp;"<\/text>/);
  assert.doesNotMatch(svg, /<script>/);
});

test('replaces XML-invalid characters while preserving valid Unicode text', async () => {
  const request = new NextRequest('https://example.com/api/render?lines=A%00%1F%EF%BF%BEB%0AC%F0%9F%98%80&font=Arial');

  const response = await GET(request);
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, />A\uFFFD\uFFFD\uFFFDB\nC😀<\/text>/u);
  assert.doesNotMatch(svg, /[\u0000\u001F\uFFFE]/u);
});

test('renders minimal-border with the text accent and an inset outline', async () => {
  const response = await GET(new NextRequest('https://example.com/api/render?layout=minimal-border&font=Arial&color=ff79c6&background=transparent&lines=Hello&width=100&height=40'));
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /<rect x="1" y="1" width="98" height="38" rx="8" fill="none" stroke="#ff79c6" stroke-width="2"/);
  assert.doesNotMatch(svg, /Terminal Header Bar|Window buttons/);
  assert.match(svg, /<text x="16" y="28\.4"/);
});

test('minimal-border preserves centering, background and escaped text', async () => {
  const response = await GET(new NextRequest('https://example.com/api/render?layout=minimal-border&font=Arial&background=181a23&color=36bcf7&center=true&vCenter=false&lines=%3Chello%3E%26&width=600&height=120'));
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /<rect width="600" height="120" fill="#181a23" rx="8"/);
  assert.match(svg, /<text x="300" y="40"/);
  assert.match(svg, />&lt;hello&gt;&amp;<\/text>/);
});