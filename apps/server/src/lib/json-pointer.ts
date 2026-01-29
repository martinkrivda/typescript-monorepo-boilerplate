/**
 * JSON Pointer Utilities (RFC 6901)
 *
 * Provides escaping and formatting for JSON Pointer representation,
 * particularly for use in URI fragment form (`#/...`).
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901.html
 * @module lib/json-pointer
 */

/**
 * Escapes a JSON Pointer token per RFC 6901
 *
 * RFC 6901 requires escaping in this order:
 * 1. `~` → `~0` (must be first to avoid double-escaping)
 * 2. `/` → `~1`
 *
 * @example
 * escapeJsonPointerToken("a/b")  // "a~1b"
 * escapeJsonPointerToken("m~n")  // "m~0n"
 * escapeJsonPointerToken("a/b~c") // "a~1b~0c"
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901.html#section-3
 */
export function escapeJsonPointerToken(token: string | number) {
  const str = String(token);
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Percent-encodes a string for use in URI fragment (RFC 3986)
 *
 * Characters that need encoding in URI fragments:
 * - Space, %, #, ?, and other reserved/unsafe characters
 *
 * @see https://www.rfc-editor.org/rfc/rfc3986.html#section-3.5
 */
function percentEncodeForFragment(str: string) {
  // encodeURIComponent encodes all except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
  // For fragments we want to preserve some chars but encode others
  return encodeURIComponent(str)
    // Restore chars that are safe in fragments per RFC 3986
    .replace(/%21/g, "!")
    .replace(/%27/g, "'")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%2A/g, "*");
}

/**
 * Options for toJsonPointerFragment
 */
export interface JsonPointerOptions {
  /**
   * Apply percent-encoding for strict URI fragment compliance (RFC 3986)
   *
   * When true, characters like space, %, ?, # will be percent-encoded.
   * For typical field names this is not needed, but required for
   * 100% spec-compliant URI fragment representation.
   *
   * @default false
   */
  uriEncode?: boolean;
}

/**
 * Creates a JSON Pointer in URI fragment form from path segments
 *
 * Escapes each segment per RFC 6901 and joins with `/`.
 * Returns `#` for empty paths (root pointer).
 * Symbols are filtered out (not valid in JSON paths).
 *
 * @example
 * toJsonPointerFragment(["user", "name"])     // "#/user/name"
 * toJsonPointerFragment(["a/b", "c~d"])       // "#/a~1b/c~0d"
 * toJsonPointerFragment([])                    // "#" (root)
 *
 * // With URI encoding for special characters:
 * toJsonPointerFragment(["a b"], { uriEncode: true })  // "#/a%20b"
 * toJsonPointerFragment(["c%d"], { uriEncode: true })  // "#/c%25d"
 *
 * @param path - Array of path segments (strings, numbers, or symbols - symbols are ignored)
 * @param options - Optional settings for encoding
 * @returns JSON Pointer in URI fragment form (`#` for root, `#/...` for nested)
 */
export function toJsonPointerFragment(
  path: Array<string | number | symbol>,
  options?: JsonPointerOptions,
): string {
  // Filter out symbols (not valid in JSON) and keep only strings/numbers
  const validPath = path.filter(
    (segment): segment is string | number => typeof segment !== "symbol",
  );

  if (!validPath.length) {
    return "#";
  }

  const escaped = validPath.map(escapeJsonPointerToken);

  if (options?.uriEncode) {
    return `#/${escaped.map(percentEncodeForFragment).join("/")}`;
  }

  return `#/${escaped.join("/")}`;
}
