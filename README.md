# mini-mac-address-normalize

Parses and reformats MAC addresses across colon, dash, dot, and bare hex notations into a chosen canonical form.

```js
import { normalizeMac } from 'mini-mac-address-normalize';

normalizeMac('001A.2B3C.4D5E'); // '00:1a:2b:3c:4d:5e'
normalizeMac('00-1A-2B-3C-4D-5E', { style: 'dot' }); // '001a.2b3c.4d5e'
normalizeMac('001a2b3c4d5e', { style: 'bare', uppercase: true }); // '001A2B3C4D5E'
```

## Why this exists

MAC addresses appear in many textual forms depending on the platform and vendor. A router might show `001A.2B3C.4D5E`, a Linux tool `00:1a:2b:3c:4d:5e`, and a Windows command `00-1A-2B-3C-4D-5E`. Comparing or storing these strings directly is error-prone. This library normalizes any of the common notations to a single canonical form.

The trade-off: the parser is deliberately strict. It accepts only exactly 12 hexadecimal digits arranged in one of the four supported notations. It rejects mixed separators, surrounding whitespace, and partial addresses. This avoids silently accepting malformed input that looks almost right, at the cost of not being forgiving.

## API

### `normalizeMac(input, options?)`

Returns the normalized MAC address string. `input` must be a string in one of the accepted notations. `options` may contain:

- `style`: `'colon'` (default), `'dash'`, `'dot'`, or `'bare'`.
- `uppercase`: boolean, default `false`.

Throws `MacParseError` if the input is invalid or the style is unknown.

### `parseMac(input)`

Returns an array of 6 bytes (`number[]`). Throws `MacParseError` on invalid input.

### `formatMac(bytes, style?)`

Formats an array of 6 bytes into a MAC address string. `style` defaults to `'colon'`. Throws `MacParseError` if the byte array is invalid or the style is unknown.

### `MacParseError`

Error class thrown by all functions on invalid input.

## Awkward edge

The dot notation is Cisco-style: three groups of four hex digits separated by dots. A common mistake is to write `001A.2B3C.4D5E` with lowercase or mixed case; the parser accepts both. However, it does **not** accept a dot-separated form with any other grouping, such as `00.1A.2B.3C.4D.5E` or `001. A2B.3C4.D5E`. Only the three-group form is valid.
