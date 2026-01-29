/**
 * Domain-Specific Error Codes
 *
 * Namespaced error codes for different domains in the application.
 * These codes extend the base E#### pattern from ProblemRegistry.
 *
 * Code Ranges:
 * - E1xxx: Generic HTTP errors (defined in problem-registry.ts)
 * - E2xxx: Authentication & Authorization errors
 * - E3xxx: Document Signing errors
 * - E4xxx: Company & Environment errors
 * - E5xxx: SOAP Integration errors
 *
 * @module errors/domain-codes
 */

// =================================================================
// AUTHENTICATION & AUTHORIZATION (E2xxx)
// =================================================================

/**
 * Authentication and authorization error codes
 */
export const AUTH_CODES = {
  /** Invalid username/password combination */
  INVALID_CREDENTIALS: "E2001",
  /** Access token has expired */
  TOKEN_EXPIRED: "E2002",
  /** OAuth2 client credentials invalid */
  INVALID_CLIENT: "E2003",
  /** Requested scope not allowed */
  INVALID_SCOPE: "E2004",
  /** Invalid or expired grant */
  INVALID_GRANT: "E2005",
  /** Unsupported grant type */
  UNSUPPORTED_GRANT: "E2006",
  /** Refresh token invalid or expired */
  INVALID_REFRESH_TOKEN: "E2007",
  /** User account is inactive */
  ACCOUNT_INACTIVE: "E2008",
  /** User account is locked */
  ACCOUNT_LOCKED: "E2009",
  /** Insufficient permissions */
  INSUFFICIENT_PERMISSIONS: "E2010",
  /** Authentication context missing (user not in request context) */
  AUTH_CONTEXT_MISSING: "E2011",
} as const;

// =================================================================
// DOCUMENT SIGNING (E3xxx)
// =================================================================

/**
 * Document signing error codes
 */
export const SIGNING_CODES = {
  /** Document exceeds maximum size limit */
  DOCUMENT_TOO_LARGE: "E3001",
  /** Invalid base64 encoded content */
  INVALID_BASE64: "E3002",
  /** Certificate validation failed */
  CERTIFICATE_ERROR: "E3003",
  /** Document format not supported */
  UNSUPPORTED_FORMAT: "E3004",
  /** Signature verification failed */
  SIGNATURE_INVALID: "E3005",
  /** Document already signed */
  ALREADY_SIGNED: "E3006",
  /** Signing workflow error */
  WORKFLOW_ERROR: "E3007",
  /** Timestamp service unavailable */
  TIMESTAMP_ERROR: "E3008",
  /** Document hash mismatch */
  HASH_MISMATCH: "E3009",
  /** Invalid request type for signing operation */
  INVALID_REQUEST_TYPE: "E3010",
} as const;

// =================================================================
// COMPANY & ENVIRONMENT (E4xxx)
// =================================================================

/**
 * Company and environment error codes
 */
export const COMPANY_CODES = {
  /** Company not found (generic) */
  COMPANY_NOT_FOUND: "E4001",
  /** Environment not found */
  ENVIRONMENT_NOT_FOUND: "E4002",
  /** Company already exists */
  COMPANY_EXISTS: "E4003",
  /** Environment already exists */
  ENVIRONMENT_EXISTS: "E4004",
  /** Invalid company configuration */
  INVALID_COMPANY_CONFIG: "E4005",
  /** Company is inactive */
  COMPANY_INACTIVE: "E4006",
  /** Environment is inactive */
  ENVIRONMENT_INACTIVE: "E4007",
  /** Company not found by process identifier */
  COMPANY_NOT_FOUND_BY_PROCESS: "E4008",
  /** Partner company not found by tax ID */
  PARTNER_NOT_FOUND_BY_TAXID: "E4009",
  /** Sender company or app configuration not found */
  SENDER_CONFIG_NOT_FOUND: "E4010",
  /** Receiver company or app configuration not found */
  RECEIVER_CONFIG_NOT_FOUND: "E4011",
} as const;

// =================================================================
// SOAP INTEGRATION (E5xxx)
// =================================================================

/**
 * SOAP integration error codes
 */
export const SOAP_CODES = {
  /** SOAP service connection failed */
  CONNECTION_FAILED: "E5001",
  /** SOAP service timeout */
  TIMEOUT: "E5002",
  /** Invalid SOAP response */
  INVALID_RESPONSE: "E5003",
  /** SOAP fault received */
  SOAP_FAULT: "E5004",
  /** WSDL parsing error */
  WSDL_ERROR: "E5005",
  /** Certificate chain error */
  CERT_CHAIN_ERROR: "E5006",
  /** Service endpoint unavailable */
  ENDPOINT_UNAVAILABLE: "E5007",
  /** SOAP sendSignedContract operation failed */
  SEND_CONTRACT_FAILED: "E5008",
  /** SOAP returnSignedContract operation failed */
  RETURN_SIGNED_FAILED: "E5009",
  /** SOAP client creation failed */
  CLIENT_CREATE_FAILED: "E5010",
  /** SOAP cancelSignedContract operation failed */
  CANCEL_CONTRACT_FAILED: "E5011",
  /** SOAP returnDeclinedContract operation failed */
  RETURN_DECLINED_FAILED: "E5012",
} as const;

// =================================================================
// TYPE EXPORTS
// =================================================================

export type AuthCode = (typeof AUTH_CODES)[keyof typeof AUTH_CODES];
export type SigningCode = (typeof SIGNING_CODES)[keyof typeof SIGNING_CODES];
export type CompanyCode = (typeof COMPANY_CODES)[keyof typeof COMPANY_CODES];
export type SoapCode = (typeof SOAP_CODES)[keyof typeof SOAP_CODES];

/** Union of all domain error codes */
export type DomainCode = AuthCode | SigningCode | CompanyCode | SoapCode;

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Checks if a code belongs to authentication domain
 */
export function isAuthCode(code: string) {
  return code.startsWith("E2");
};

/**
 * Checks if a code belongs to signing domain
 */
export function isSigningCode(code: string) {
  return code.startsWith("E3");
};

/**
 * Checks if a code belongs to company domain
 */
export function isCompanyCode(code: string) {
  return code.startsWith("E4");
};

/**
 * Checks if a code belongs to SOAP domain
 */
export function isSoapCode(code: string) {
  return code.startsWith("E5");
};
