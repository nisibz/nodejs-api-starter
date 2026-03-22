export enum ErrorType {
  Simple = 'simple',
  Validation = 'validation',
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface IErrorInfo {
  status?: number;
  messages?: string[];
  type?: ErrorType;
  validationErrors?: ValidationError[];
}

class ErrorInfo extends Error implements IErrorInfo {
  status?: number;
  messages?: string[];
  type: ErrorType;
  validationErrors?: ValidationError[];

  constructor(
    status?: number,
    messages?: string[],
    type: ErrorType = ErrorType.Simple,
    validationErrors?: ValidationError[],
  ) {
    // Call Error constructor with the first message
    const message = Array.isArray(messages) ? messages[0] : undefined;
    super(message || "An error occurred");

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, ErrorInfo.prototype);

    this.status = status;
    this.messages = messages;
    this.type = type;
    this.validationErrors = validationErrors;

    // Ensure stack trace points to where error was thrown, not where it was created
    Error.captureStackTrace?.(this, ErrorInfo);
  }
}

export const notFound = (module: string): ErrorInfo => new ErrorInfo(400, [`${module} not found`]);

export const alreadyExists = (module: string): ErrorInfo =>
  new ErrorInfo(400, [`${module} already exists`]);

export const structuredValidationError = (
  errors: ValidationError[],
  summaryMessage: string = "Validation failed",
): ErrorInfo => new ErrorInfo(400, [summaryMessage], ErrorType.Validation, errors);

// Kept for backward compatibility
export const validationError = (error: string[]): ErrorInfo => new ErrorInfo(400, error);

export const invalidCredentials = new ErrorInfo(401, ["Invalid credentials"]);
export const missingAuthToken = new ErrorInfo(401, ["Missing authorization token"]);
export const invalidToken = new ErrorInfo(401, ["Invalid or expired token"]);

export const apiPathNotFound = new ErrorInfo(404, ["API path not found"]);
