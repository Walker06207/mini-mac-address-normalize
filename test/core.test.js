import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMac, parseMac, formatMac, MacParseError } from '../src/index.js';

test('parseMac handles colon-separated', () => {
  assert.deepEqual(parseMac('00:1A:2B:3C:4D:5E'), [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]);
});

test('parseMac handles dash-separated', () => {
  assert.deepEqual(parseMac('00-1a-2b-3c-4d-5e'), [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]);
});

test('parseMac handles dot-separated', () => {
  assert.deepEqual(parseMac('001A.2B3C.4D5E'), [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]);
});

test('parseMac handles bare hex', () => {
  assert.deepEqual(parseMac('001a2b3c4d5e'), [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]);
});

test('parseMac rejects invalid inputs', () => {
  assert.throws(() => parseMac('00:1A:2B:3C:4D'), MacParseError);
  assert.throws(() => parseMac('00:1A:2B:3C:4D:5E:6F'), MacParseError);
  assert.throws(() => parseMac('00:1A:2B:3C:4D:ZZ'), MacParseError);
  assert.throws(() => parseMac('00-1A-2B-3C-4D-5E-6F'), MacParseError);
  assert.throws(() => parseMac('001A.2B3C.4D5E.6F'), MacParseError);
  assert.throws(() => parseMac('001a2b3c4d5'), MacParseError);
  assert.throws(() => parseMac(''), MacParseError);
  assert.throws(() => parseMac('   '), MacParseError);
  assert.throws(() => parseMac(123), MacParseError);
});

test('formatMac produces correct styles', () => {
  const bytes = [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e];
  assert.equal(formatMac(bytes, 'colon'), '00:1a:2b:3c:4d:5e');
  assert.equal(formatMac(bytes, 'dash'), '00-1a-2b-3c-4d-5e');
  assert.equal(formatMac(bytes, 'dot'), '001a.2b3c.4d5e');
  assert.equal(formatMac(bytes, 'bare'), '001a2b3c4d5e');
});

test('formatMac pads single-digit hex bytes', () => {
  const bytes = [0x00, 0x01, 0x0a, 0x10, 0xff, 0xab];
  assert.equal(formatMac(bytes, 'colon'), '00:01:0a:10:ff:ab');
});

test('formatMac rejects bad byte arrays', () => {
  assert.throws(() => formatMac([1, 2, 3]), MacParseError);
  assert.throws(() => formatMac([1, 2, 3, 4, 5, 256]), MacParseError);
  assert.throws(() => formatMac([1, 2, 3, 4, 5, -1]), MacParseError);
  assert.throws(() => formatMac([1, 2, 3, 4, 5, 1.5]), MacParseError);
  assert.throws(() => formatMac('not an array'), MacParseError);
});

test('normalizeMac defaults to lowercase colon', () => {
  assert.equal(normalizeMac('001A.2B3C.4D5E'), '00:1a:2b:3c:4d:5e');
  assert.equal(normalizeMac('00-1A-2B-3C-4D-5E'), '00:1a:2b:3c:4d:5e');
  assert.equal(normalizeMac('001a2b3c4d5e'), '00:1a:2b:3c:4d:5e');
});

test('normalizeMac respects style option', () => {
  assert.equal(normalizeMac('00:1A:2B:3C:4D:5E', { style: 'dash' }), '00-1a-2b-3c-4d-5e');
  assert.equal(normalizeMac('00:1A:2B:3C:4D:5E', { style: 'dot' }), '001a.2b3c.4d5e');
  assert.equal(normalizeMac('00:1A:2B:3C:4D:5E', { style: 'bare' }), '001a2b3c4d5e');
});

test('normalizeMac respects uppercase option', () => {
  assert.equal(normalizeMac('00:1a:2b:3c:4d:5e', { uppercase: true }), '00:1A:2B:3C:4D:5E');
  assert.equal(normalizeMac('00:1a:2b:3c:4d:5e', { style: 'dot', uppercase: true }), '001A.2B3C.4D5E');
});

test('normalizeMac rejects unknown style', () => {
  assert.throws(() => normalizeMac('00:1A:2B:3C:4D:5E', { style: 'bogus' }), MacParseError);
});
