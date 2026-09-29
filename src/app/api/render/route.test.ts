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
