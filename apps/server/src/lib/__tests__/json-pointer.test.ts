/**
 * JSON Pointer Tests (RFC 6901)
 *
 * Tests escaping and formatting per RFC 6901 specification.
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901.html
 * @module lib/__tests__/json-pointer.test
 */

import { describe, expect, it } from "vitest";

import { escapeJsonPointerToken, toJsonPointerFragment } from "../json-pointer";

describe("escapeJsonPointerToken", () => {
  it("returns unescaped string for simple tokens", () => {
    expect(escapeJsonPointerToken("foo")).toBe("foo");
    expect(escapeJsonPointerToken("bar")).toBe("bar");
    expect(escapeJsonPointerToken("")).toBe("");
  });

  it("converts numbers to strings", () => {
    expect(escapeJsonPointerToken(0)).toBe("0");
    expect(escapeJsonPointerToken(42)).toBe("42");
  });

  // RFC 6901 Section 3: ~ must be escaped as ~0
  it("escapes tilde as ~0 (RFC 6901)", () => {
    expect(escapeJsonPointerToken("m~n")).toBe("m~0n");
    expect(escapeJsonPointerToken("~")).toBe("~0");
    expect(escapeJsonPointerToken("~~")).toBe("~0~0");
  });

  // RFC 6901 Section 3: / must be escaped as ~1
  it("escapes slash as ~1 (RFC 6901)", () => {
    expect(escapeJsonPointerToken("a/b")).toBe("a~1b");
    expect(escapeJsonPointerToken("/")).toBe("~1");
    expect(escapeJsonPointerToken("//")).toBe("~1~1");
  });

  // Order matters: ~ must be escaped before /
  it("escapes both ~ and / in correct order", () => {
    // If order was wrong (/ first), "~/" would become "~1" then "~01"
    // Correct order: "~/" → "~0/" → "~0~1"
    expect(escapeJsonPointerToken("~/")).toBe("~0~1");
    expect(escapeJsonPointerToken("/~")).toBe("~1~0");
    expect(escapeJsonPointerToken("a/b~c/d")).toBe("a~1b~0c~1d");
  });

  // RFC 6901 examples
  it("handles RFC 6901 spec examples", () => {
    // From RFC 6901 Section 5
    expect(escapeJsonPointerToken("c%d")).toBe("c%d"); // % not escaped
    expect(escapeJsonPointerToken("e^f")).toBe("e^f"); // ^ not escaped
    expect(escapeJsonPointerToken("g|h")).toBe("g|h"); // | not escaped
    expect(escapeJsonPointerToken("i\\j")).toBe("i\\j"); // \ not escaped
    expect(escapeJsonPointerToken("k\"l")).toBe("k\"l"); // " not escaped
    expect(escapeJsonPointerToken(" ")).toBe(" "); // space not escaped
  });
});

describe("toJsonPointerFragment", () => {
  it("returns # (root pointer) for empty path", () => {
    expect(toJsonPointerFragment([])).toBe("#");
  });

  it("creates fragment for simple paths", () => {
    expect(toJsonPointerFragment(["foo"])).toBe("#/foo");
    expect(toJsonPointerFragment(["foo", "bar"])).toBe("#/foo/bar");
    expect(toJsonPointerFragment(["a", "b", "c"])).toBe("#/a/b/c");
  });

  it("handles numeric path segments", () => {
    expect(toJsonPointerFragment(["items", 0])).toBe("#/items/0");
    expect(toJsonPointerFragment(["arr", 0, "nested", 1])).toBe("#/arr/0/nested/1");
  });

  it("escapes special characters in segments", () => {
    expect(toJsonPointerFragment(["a/b"])).toBe("#/a~1b");
    expect(toJsonPointerFragment(["m~n"])).toBe("#/m~0n");
    expect(toJsonPointerFragment(["a/b", "c~d"])).toBe("#/a~1b/c~0d");
  });

  // RFC 6901 Section 5 examples (URI fragment representation)
  it("produces correct RFC 6901 URI fragment examples", () => {
    // Examples from RFC 6901 Section 5
    // Note: The RFC shows full document examples, we test escaping
    expect(toJsonPointerFragment(["foo"])).toBe("#/foo");
    expect(toJsonPointerFragment(["foo", 0])).toBe("#/foo/0");
    expect(toJsonPointerFragment(["a/b"])).toBe("#/a~1b");
    expect(toJsonPointerFragment(["c%d"])).toBe("#/c%d");
    expect(toJsonPointerFragment(["e^f"])).toBe("#/e^f");
    expect(toJsonPointerFragment(["g|h"])).toBe("#/g|h");
    expect(toJsonPointerFragment(["i\\j"])).toBe("#/i\\j");
    expect(toJsonPointerFragment(["k\"l"])).toBe("#/k\"l");
    expect(toJsonPointerFragment([" "])).toBe("#/ ");
    expect(toJsonPointerFragment(["m~n"])).toBe("#/m~0n");
  });

  // Edge cases for typical Zod paths
  it("handles typical Zod validation paths", () => {
    expect(toJsonPointerFragment(["user", "email"])).toBe("#/user/email");
    expect(toJsonPointerFragment(["items", 0, "name"])).toBe("#/items/0/name");
    expect(toJsonPointerFragment(["filedata"])).toBe("#/filedata");
  });

  // URI encoding option (RFC 3986)
  describe("with uriEncode option", () => {
    it("percent-encodes space as %20", () => {
      expect(toJsonPointerFragment(["a b"], { uriEncode: true })).toBe("#/a%20b");
      expect(toJsonPointerFragment(["hello world"], { uriEncode: true })).toBe("#/hello%20world");
    });

    it("percent-encodes % as %25", () => {
      expect(toJsonPointerFragment(["c%d"], { uriEncode: true })).toBe("#/c%25d");
      expect(toJsonPointerFragment(["100%"], { uriEncode: true })).toBe("#/100%25");
    });

    it("percent-encodes # as %23", () => {
      expect(toJsonPointerFragment(["a#b"], { uriEncode: true })).toBe("#/a%23b");
    });

    it("percent-encodes ? as %3F", () => {
      expect(toJsonPointerFragment(["a?b"], { uriEncode: true })).toBe("#/a%3Fb");
    });

    it("applies RFC 6901 escaping before percent-encoding", () => {
      // "a/b" → "a~1b" (RFC 6901) → "a~1b" (no percent needed)
      expect(toJsonPointerFragment(["a/b"], { uriEncode: true })).toBe("#/a~1b");
      // "m~n" → "m~0n" (RFC 6901) → "m~0n" (no percent needed)
      expect(toJsonPointerFragment(["m~n"], { uriEncode: true })).toBe("#/m~0n");
    });

    it("combines RFC 6901 escaping with percent-encoding", () => {
      // "a/ b" → "a~1 b" (RFC 6901) → "a~1%20b" (percent)
      expect(toJsonPointerFragment(["a/ b"], { uriEncode: true })).toBe("#/a~1%20b");
      // "~%" → "~0%" (RFC 6901) → "~0%25" (percent)
      expect(toJsonPointerFragment(["~%"], { uriEncode: true })).toBe("#/~0%25");
    });

    it("preserves safe fragment characters", () => {
      // These should NOT be encoded per RFC 3986 fragment rules
      expect(toJsonPointerFragment(["a!b"], { uriEncode: true })).toBe("#/a!b");
      expect(toJsonPointerFragment(["a'b"], { uriEncode: true })).toBe("#/a'b");
      expect(toJsonPointerFragment(["a(b)"], { uriEncode: true })).toBe("#/a(b)");
      expect(toJsonPointerFragment(["a*b"], { uriEncode: true })).toBe("#/a*b");
    });

    it("does not encode when uriEncode is false or omitted", () => {
      expect(toJsonPointerFragment(["a b"])).toBe("#/a b");
      expect(toJsonPointerFragment(["a b"], { uriEncode: false })).toBe("#/a b");
      expect(toJsonPointerFragment(["c%d"])).toBe("#/c%d");
    });
  });
});
