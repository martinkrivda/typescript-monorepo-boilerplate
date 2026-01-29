/**
 * Errors Module - Barrel Export
 *
 * Centralized error handling infrastructure for RFC 9457 Problem Details.
 *
 * @module errors
 */

// Core error classes
export { AppError } from "./app-error";
export type { AppErrorOptions, FieldError } from "./app-error";

// Domain-specific error codes
export {
  AUTH_CODES,
  COMPANY_CODES,
  isAuthCode,
  isCompanyCode,
  isSigningCode,
  isSoapCode,
  SIGNING_CODES,
  SOAP_CODES,
} from "./domain-codes";
export type {
  AuthCode,
  CompanyCode,
  DomainCode,
  SigningCode,
  SoapCode,
} from "./domain-codes";

// Problem registry
export {
  getProblemDef,
  getProblemDefByStatus,
  ProblemRegistry,
  problemTypeUri,
  statusToKey,
} from "./problem-registry";
export type { LogLevel, ProblemDef, ProblemKey } from "./problem-registry";
