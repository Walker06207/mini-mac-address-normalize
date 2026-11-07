const HEX_RE = /^[0-9a-fA-F]+$/;

/**
 * Error thrown when a MAC address string cannot be parsed.
 */
export class MacParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MacParseError';
  }
}

/**
 * Parses a MAC address in colon, dash, dot, or bare hex notation.
 *
 * Accepted forms:
 *   - Colon-separated: 00:1A:2B:3C:4D:5E
 *   - Dash-separated:   00-1A-2B-3C-4D-5E
 *   - Dot-separated:    001A.2B3C.4D5E (Cisco style)
 *   - Bare hex:         001A2B3C4D5E
 *
 * The parser is strict: it requires exactly 12 hexadecimal digits and
 * does not accept mixed separators or surrounding whitespace. This
 * strictness avoids silently accepting malformed input that looks
 * almost right.
 *
 * @param {string} input The MAC address string.
 * @returns {number[]} An array of 6 bytes (0-255).
 * @throws {MacParseError} If the input is not a valid MAC address.
 */
export function parseMac(input) {
  if (typeof input !== 'string') {
    throw new MacParseError('MAC address must be a string');
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new MacParseError('MAC address must not be empty');
  }

  let hexDigits;

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length !== 6) {
      throw new MacParseError('Colon-separated MAC address must have 6 groups');
    }
    for (const part of parts) {
      if (part.length !== 2 || !HEX_RE.test(part)) {
        throw new MacParseError('Each colon-separated group must be exactly two hex digits');
      }
    }
    hexDigits = parts.join('');
  } else if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length !== 6) {
      throw new MacParseError('Dash-separated MAC address must have 6 groups');
    }
    for (const part of parts) {
      if (part.length !== 2 || !HEX_RE.test(part)) {
        throw new MacParseError('Each dash-separated group must be exactly two hex digits');
      }
    }
    hexDigits = parts.join('');
  } else if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      throw new MacParseError('Dot-separated MAC address must have 3 groups');
    }
    for (const part of parts) {
      if (part.length !== 4 || !HEX_RE.test(part)) {
        throw new MacParseError('Each dot-separated group must be exactly four hex digits');
      }
    }
    hexDigits = parts.join('');
  } else {
    if (trimmed.length !== 12 || !HEX_RE.test(trimmed)) {
      throw new MacParseError('Bare MAC address must be exactly 12 hex digits');
    }
    hexDigits = trimmed;
  }

  const bytes = [];
  for (let i = 0; i < 12; i += 2) {
    bytes.push(parseInt(hexDigits.slice(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Formats an array of 6 bytes into a MAC address string.
 *
 * @param {number[]} bytes An array of 6 bytes (0-255).
 * @param {string} [style='colon'] One of 'colon', 'dash', 'dot', or 'bare'.
 * @returns {string} The formatted MAC address.
 * @throws {MacParseError} If the bytes array is invalid or the style is unknown.
 */
export function formatMac(bytes, style = 'colon') {
  if (!Array.isArray(bytes) || bytes.length !== 6) {
    throw new MacParseError('MAC address must be an array of 6 bytes');
  }
  for (const b of bytes) {
    if (!Number.isInteger(b) || b < 0 || b > 255) {
      throw new MacParseError('Each byte must be an integer between 0 and 255');
    }
  }

  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');

  switch (style) {
    case 'colon':
      return hex.match(/.{2}/g).join(':');
    case 'dash':
      return hex.match(/.{2}/g).join('-');
    case 'dot':
      return hex.match(/.{4}/g).join('.');
    case 'bare':
      return hex;
    default:
      throw new MacParseError(`Unknown style: ${style}`);
  }
}

/**
 * Normalizes a MAC address to a canonical form.
 *
 * The default canonical form is lowercase colon-separated. Other styles
 * can be selected via the `style` option. The function parses any of the
 * supported input notations and reformats to the chosen style.
 *
 * @param {string} input The MAC address string.
 * @param {Object} [options] Optional settings.
 * @param {string} [options.style='colon'] The output style: 'colon', 'dash', 'dot', or 'bare'.
 * @param {boolean} [options.uppercase=false] Whether to output uppercase hex digits.
 * @returns {string} The normalized MAC address.
 * @throws {MacParseError} If the input is invalid or options are invalid.
 */
export function normalizeMac(input, options = {}) {
  const { style = 'colon', uppercase = false } = options;
  const bytes = parseMac(input);
  let result = formatMac(bytes, style);
  if (uppercase) {
    result = result.toUpperCase();
  }
  return result;
}
