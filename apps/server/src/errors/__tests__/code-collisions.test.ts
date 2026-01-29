/**
 * Error Code Collision Tests
 *
 * Ensures all error codes are unique across domains and follow
 * the correct range conventions.
 *
 * Code Ranges:
 * - E1xxx: Generic HTTP errors (ProblemRegistry)
 * - E2xxx: Authentication & Authorization
 * - E3xxx: Document Signing
 * - E4xxx: Company & Environment
 * - E5xxx: SOAP Integration
 */

import { describe, expect, it } from "vitest";

import {
  AUTH_CODES,
  COMPANY_CODES,
  SIGNING_CODES,
  SOAP_CODES,
} from "../domain-codes";
import { ProblemRegistry } from "../problem-registry";

describe("error Code Collisions", () => {
  // Collect all codes
  const problemRegistryCodes = Object.values(ProblemRegistry).map(def => def.code);
  const authCodes = Object.values(AUTH_CODES);
  const signingCodes = Object.values(SIGNING_CODES);
  const companyCodes = Object.values(COMPANY_CODES);
  const soapCodes = Object.values(SOAP_CODES);

  const allCodes = [
    ...problemRegistryCodes,
    ...authCodes,
    ...signingCodes,
    ...companyCodes,
    ...soapCodes,
  ];

  it("should have no duplicate codes across all domains", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const code of allCodes) {
      if (seen.has(code)) {
        duplicates.push(code);
      }
      seen.add(code);
    }

    expect(duplicates).toEqual([]);
  });

  it("should have ProblemRegistry codes in E1xxx range", () => {
    for (const code of problemRegistryCodes) {
      expect(code).toMatch(/^E1\d{3}$/);
    }
  });

  it("should have AUTH_CODES in E2xxx range", () => {
    for (const code of authCodes) {
      expect(code).toMatch(/^E2\d{3}$/);
    }
  });

  it("should have SIGNING_CODES in E3xxx range", () => {
    for (const code of signingCodes) {
      expect(code).toMatch(/^E3\d{3}$/);
    }
  });

  it("should have COMPANY_CODES in E4xxx range", () => {
    for (const code of companyCodes) {
      expect(code).toMatch(/^E4\d{3}$/);
    }
  });

  it("should have SOAP_CODES in E5xxx range", () => {
    for (const code of soapCodes) {
      expect(code).toMatch(/^E5\d{3}$/);
    }
  });

  it("should have valid E#### format for all codes", () => {
    for (const code of allCodes) {
      expect(code).toMatch(/^E\d{4}$/);
    }
  });

  // Summary output for debugging
  it("should report code statistics", () => {
    const stats = {
      total: allCodes.length,
      unique: new Set(allCodes).size,
      byDomain: {
        problemRegistry: problemRegistryCodes.length,
        auth: authCodes.length,
        signing: signingCodes.length,
        company: companyCodes.length,
        soap: soapCodes.length,
      },
    };

    // This test always passes, it's for reporting
    expect(stats.total).toBe(stats.unique);
    console.warn("Error Code Statistics:", JSON.stringify(stats, null, 2));
  });
});
