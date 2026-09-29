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
